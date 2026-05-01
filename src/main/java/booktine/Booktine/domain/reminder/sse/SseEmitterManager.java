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
 * ReminderService가 연결 등록/해제와 알림 전송을 안정적으로 수행할 수 있도록 돕는다.
 */
@Component
public class SseEmitterManager {

    private static final long DEFAULT_TIMEOUT = 60L * 60L * 1000L;
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    /**
     * 사용자별 SSE 연결을 생성하고 라이프사이클 콜백을 등록한다.
     */
    public SseEmitter connect(Long userId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        emitters.computeIfAbsent(userId, key -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError((e) -> removeEmitter(userId, emitter));

        return emitter;
    }

    /**
     * 특정 사용자에게 리마인더 이벤트를 전송한다.
     */
    public void send(Long userId, Object data) {
        List<SseEmitter> userEmitters = emitters.getOrDefault(userId, List.of());
        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().name("reminder").data(data));
            } catch (IOException e) {
                removeEmitter(userId, emitter);
            }
        }
    }

    /**
     * 사용자와 연결 객체 기준으로 SSE 연결을 제거한다.
     */
    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null) {
            return;
        }
        userEmitters.remove(emitter);
        if (userEmitters.isEmpty()) {
            emitters.remove(userId);
        }
    }
}

