package booktine.Booktine.domain.reminder.dto;

import booktine.Booktine.domain.reminder.entity.Reminder;

import java.time.LocalTime;

/**
 * 리마인더 조회/생성 응답에 사용하는 DTO.
 * 엔티티를 외부 응답 스펙으로 변환할 때 from 정적 팩토리 메서드를 사용한다.
 */
public record ReminderResponse(Long id, Long userId, LocalTime reminderTime, String message) {

    /**
     * Reminder 엔티티를 ReminderResponse로 변환한다.
     */
    public static ReminderResponse from(Reminder reminder) {
        return new ReminderResponse(reminder.getId(), reminder.getUserId(), reminder.getReminderTime(), reminder.getMessage());
    }
}