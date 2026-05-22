package booktine.Booktine.domain.reminder.repository;

import booktine.Booktine.domain.reminder.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * 리마인더 엔티티 영속화를 담당하는 리포지토리.
 * 사용자별 조회와 특정 시각 배치 조회 기능을 제공한다.
 */
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    /** 특정 사용자에 등록된 리마인더를 모두 조회한다. */
    List<Reminder> findAllByUserIdOrderByReminderTimeAsc(Long userId);

    /** 특정 사용자 소유 리마인더를 ID로 조회한다. */
    Optional<Reminder> findByIdAndUserId(Long id, Long userId);

    /** 특정 시각과 일치하는 리마인더를 조회한다. */
    List<Reminder> findAllByReminderTime(LocalTime reminderTime);

    /** 회원 탈퇴 시 사용자 리마인더를 일괄 삭제한다. */
    void deleteAllByUserId(Long userId);
}
