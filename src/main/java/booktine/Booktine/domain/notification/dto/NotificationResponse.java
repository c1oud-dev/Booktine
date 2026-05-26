package booktine.Booktine.domain.notification.dto;

import booktine.Booktine.domain.notification.entity.Notification;
import booktine.Booktine.domain.notification.entity.NotificationType;
import java.time.LocalDateTime;

/**
 * 알림 응답 DTO.
 * 알림 목록 조회 API에서 클라이언트에 반환할 때 사용한다.
 */
public record NotificationResponse(
        Long id,
        Long postId,
        NotificationType type,
        String message,
        boolean isRead,
        LocalDateTime createdAt
) {
    /**
     * Notification 엔티티를 응답 DTO로 변환한다.
     */
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getPostId(),
                notification.getType(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
