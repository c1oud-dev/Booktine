package booktine.Booktine.domain.reminder.entity;

import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * 사용자 독서 리마인더 정보를 저장하는 JPA 엔티티.
 * ReminderService에서 사용자별 알림 시간 조회 및 SSE 푸시 대상 선정에 사용된다.
 */
@Getter
@Entity
@Table(name = "reminders")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reminder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalTime reminderTime;

    @Column(nullable = false)
    private String message;

    /**
     * 리마인더 생성 시 필요한 필드를 초기화한다.
     */
    @Builder
    public Reminder(Long userId, LocalTime reminderTime, String message) {
        this.userId = userId;
        this.reminderTime = reminderTime;
        this.message = message;
    }
}
