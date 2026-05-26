package booktine.Booktine.domain.notification.repository;

import booktine.Booktine.domain.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 알림 엔티티에 대한 데이터 접근 레이어.
 * 알림 목록 조회, 읽음 처리, 읽지 않은 알림 수 조회에 사용된다.
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 특정 사용자의 알림 목록을 최신순으로 조회한다.
     */
    List<Notification> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * 특정 사용자의 특정 알림을 조회한다.
     */
    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    /**
     * 특정 사용자의 읽지 않은 알림 수를 조회한다.
     */
    long countByUserIdAndIsReadFalse(Long userId);
}