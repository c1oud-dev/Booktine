package booktine.Booktine.domain.reminder.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

/** 사용자별 SSE 연결과 재연결용 최근 이벤트를 관리한다. */
@Slf4j
@Component
public class SseEmitterManager {

    private static final long DEFAULT_TIMEOUT_MILLIS = 60L * 60L * 1000L;
    private static final int MAX_CACHED_EVENTS_PER_USER = 100;
    private static final Duration EVENT_RETENTION = Duration.ofMinutes(10);
    private static final String REMINDER_EVENT_NAME = "reminder";
    private static final String NOTIFICATION_EVENT_NAME = "notification";

    private final Map<Long, List<SseEmitter>> emitterStore = new ConcurrentHashMap<>();
    private final Map<Long, Deque<CachedEvent>> eventCache = new ConcurrentHashMap<>();
    private final AtomicLong eventSequence = new AtomicLong();
    private final AtomicLong sendFailureCount = new AtomicLong();

    public SseEmitter connect(Long userId) {
        return connect(userId, null);
    }

    /** 연결을 생성하고 Last-Event-ID 이후의 캐시 이벤트를 새 연결에만 재전송한다. */
    public SseEmitter connect(Long userId, String lastEventId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_MILLIS);
        emitterStore.computeIfAbsent(userId, key -> new CopyOnWriteArrayList<>()).add(emitter);
        registerLifecycleCallbacks(userId, emitter);
        replayMissedEvents(userId, emitter, parseLastEventId(lastEventId));

        return emitter;
    }

    public void sendNotification(Long userId, Object data) {
        sendEvent(userId, NOTIFICATION_EVENT_NAME, data);
    }

    public void send(Long userId, Object data) {
        sendEvent(userId, REMINDER_EVENT_NAME, data);
    }

    private void sendEvent(Long userId, String eventName, Object data) {
        CachedEvent event = cacheEvent(userId, eventName, data);
        for (SseEmitter emitter : emitterStore.getOrDefault(userId, List.of())) {
            sendCachedEvent(userId, emitter, event, false);
        }
    }

    /** 프록시의 idle timeout을 피하도록 모든 활성 연결에 30초마다 SSE 주석을 보낸다. */
    @Scheduled(fixedRate = 30_000L)
    public void sendHeartbeats() {
        emitterStore.forEach((userId, emitters) -> emitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event().comment("heartbeat"));
            } catch (IOException exception) {
                handleSendFailure(userId, emitter, "heartbeat", exception);
            }
        }));
        pruneExpiredEventCaches();
    }

    public long getSendFailureCount() {
        return sendFailureCount.get();
    }

    private CachedEvent cacheEvent(Long userId, String eventName, Object data) {
        CachedEvent event = new CachedEvent(
                eventSequence.incrementAndGet(),
                eventName,
                data,
                Instant.now()
        );
        Deque<CachedEvent> events = eventCache.computeIfAbsent(userId, key -> new ArrayDeque<>());
        synchronized (events) {
            removeExpiredEvents(events, Instant.now());
            events.addLast(event);
            while (events.size() > MAX_CACHED_EVENTS_PER_USER) {
                events.removeFirst();
            }
        }
        return event;
    }

    private void replayMissedEvents(Long userId, SseEmitter emitter, long lastEventId) {
        if (lastEventId < 0) {
            return;
        }
        Deque<CachedEvent> events = eventCache.get(userId);
        if (events == null) {
            return;
        }
        synchronized (events) {
            removeExpiredEvents(events, Instant.now());
            events.stream()
                    .filter(event -> event.id() > lastEventId)
                    .forEach(event -> sendCachedEvent(userId, emitter, event, true));
        }
    }

    private void sendCachedEvent(
            Long userId,
            SseEmitter emitter,
            CachedEvent event,
            boolean replay
    ) {
        try {
            emitter.send(SseEmitter.event()
                    .id(Long.toString(event.id()))
                    .name(event.name())
                    .data(event.data()));
        } catch (IOException exception) {
            handleSendFailure(userId, emitter, replay ? "replay" : event.name(), exception);
        }
    }

    private void handleSendFailure(
            Long userId,
            SseEmitter emitter,
            String eventName,
            IOException exception
    ) {
        long failures = sendFailureCount.incrementAndGet();
        log.warn(
                "SSE 전송 실패: userId={}, event={}, totalFailures={}",
                userId,
                eventName,
                failures,
                exception
        );
        removeEmitter(userId, emitter);
    }

    private long parseLastEventId(String lastEventId) {
        if (lastEventId == null || lastEventId.isBlank()) {
            return -1L;
        }
        try {
            return Long.parseLong(lastEventId);
        } catch (NumberFormatException exception) {
            log.warn("유효하지 않은 Last-Event-ID를 무시합니다: {}", lastEventId);
            return -1L;
        }
    }

    private void pruneExpiredEventCaches() {
        Instant now = Instant.now();
        eventCache.forEach((userId, events) -> {
            synchronized (events) {
                removeExpiredEvents(events, now);
                if (events.isEmpty()) {
                    eventCache.remove(userId, events);
                }
            }
        });
    }

    private void removeExpiredEvents(Deque<CachedEvent> events, Instant now) {
        Instant cutoff = now.minus(EVENT_RETENTION);
        while (!events.isEmpty() && events.getFirst().createdAt().isBefore(cutoff)) {
            events.removeFirst();
        }
    }

    private void registerLifecycleCallbacks(Long userId, SseEmitter emitter) {
        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(exception -> removeEmitter(userId, emitter));
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitterStore.get(userId);
        if (userEmitters == null) {
            return;
        }

        userEmitters.remove(emitter);
        if (userEmitters.isEmpty()) {
            emitterStore.remove(userId, userEmitters);
        }
    }

    private record CachedEvent(long id, String name, Object data, Instant createdAt) {
    }
}

