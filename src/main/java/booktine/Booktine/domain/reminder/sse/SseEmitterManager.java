package booktine.Booktine.domain.reminder.sse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 사용자별 SSE 연결(SseEmitter)을 관리하는 컴포넌트.
 * ReminderService에서 연결 생성/해제와 알림 전송 시 공통 관리 지점으로 사용한다.
 */
@Component
public class SseEmitterManager {

    private static final long DEFAULT_TIMEOUT_MILLIS = 60L * 60L * 1000L;
    private static final String REMINDER_EVENT_NAME = "reminder";
    private static final String NOTIFICATION_EVENT_NAME = "notification";

    private final Map<Long, List<SseEmitter>> emitterStore = new ConcurrentHashMap<>();

    /**
     * 사용자별 SSE 연결을 생성하고 라이프사이클 콜백을 등록한다.
     */
    public SseEmitter connect(Long userId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_MILLIS);
        emitterStore.computeIfAbsent(userId, key -> new CopyOnWriteArrayList<>()).add(emitter);
        registerLifecycleCallbacks(userId, emitter);

        return emitter;
    }

    public void sendNotification(Long userId, Object data) {
        List<SseEmitter> userEmitters = emitterStore.getOrDefault(userId, List.of());
        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().name(NOTIFICATION_EVENT_NAME).data(data));
            } catch (IOException exception) {
                removeEmitter(userId, emitter);
            }
        }
    }

    /**
     * 특정 사용자에게 리마인더 이벤트를 전송한다.
     * 전송 실패한 연결은 저장소에서 제거한다.
     */
    public void send(Long userId, Object data) {
        List<SseEmitter> userEmitters = emitterStore.getOrDefault(userId, List.of());
        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().name(REMINDER_EVENT_NAME).data(data));
            } catch (IOException exception) {
                removeEmitter(userId, emitter);
            }
        }
    }

    /**
     * SSE 연결 생명주기 이벤트 완료/타임아웃/오류 시 연결을 제거하도록 콜백을 등록한다.
     */
    private void registerLifecycleCallbacks(Long userId, SseEmitter emitter) {
        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(exception -> removeEmitter(userId, emitter));
    }

    /**
     * 사용자와 연결 객체 기준으로 SSE 연결을 제거한다.
     */
    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitterStore.get(userId);
        if (userEmitters == null) {
            return;
        }

        userEmitters.remove(emitter);
        if (userEmitters.isEmpty()) {
            emitterStore.remove(userId);
        }
    }
}

