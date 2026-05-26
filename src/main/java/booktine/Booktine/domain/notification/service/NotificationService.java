package booktine.Booktine.domain.notification.service;

import booktine.Booktine.domain.notification.dto.NotificationResponse;
import booktine.Booktine.domain.notification.entity.Notification;
import booktine.Booktine.domain.notification.entity.NotificationType;
import booktine.Booktine.domain.notification.repository.NotificationRepository;
import booktine.Booktine.domain.reminder.sse.SseEmitterManager;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

/**
 * 알림 도메인 비즈니스 로직을 처리하는 서비스.
 * 알림 생성/조회/읽음 처리 및 SSE 연결을 담당한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SseEmitterManager sseEmitterManager;

    /**
     * 알림을 생성하고 SSE로 실시간 전송한다.
     */
    @Transactional
    public void sendNotification(Long receiverId, Long postId, NotificationType type, String message) {
        Notification saved = notificationRepository.save(
                Notification.builder()
                        .userId(receiverId)
                        .postId(postId)
                        .type(type)
                        .message(message)
                        .build()
        );
        sseEmitterManager.sendNotification(receiverId, NotificationResponse.from(saved));
    }

    /**
     * 특정 사용자의 알림 목록을 최신순으로 조회한다.
     */
    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    /**
     * 특정 사용자의 읽지 않은 알림 수를 조회한다.
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * 특정 알림을 읽음 처리한다.
     */
    @Transactional
    public void read(Long userId, Long id) {
        notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND))
                .markRead();
    }

    /**
     * 모든 알림을 읽음 처리한다.
     */
    @Transactional
    public void readAll(Long userId) {
        notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .forEach(Notification::markRead);
    }

    /**
     * SSE 연결을 생성해 실시간 알림을 수신할 수 있도록 한다.
     */
    public SseEmitter connect(Long userId) {
        return sseEmitterManager.connect(userId);
    }
}