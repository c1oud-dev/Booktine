package booktine.Booktine.domain.notification.entity;

import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Entity
@Table(name = "notifications")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long postId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean isRead;

    @Builder
    public Notification(Long userId, Long postId, NotificationType type, String message) {
        this.userId = userId;
        this.postId = postId;
        this.type = type;
        this.message = message;
        this.isRead = false;
    }

    public void markRead() {
        this.isRead = true;
    }
}

