package booktine.Booktine.domain.admin.dto;

import booktine.Booktine.domain.reminder.entity.Reminder;

import java.time.LocalTime;

/**
 * 관리자 화면에서 리마인더 현황 목록을 응답할 때 사용하는 DTO.
 * AdminController의 리마인더 현황 API에서 엔티티를 직렬화 가능한 형태로 변환해 반환한다.
 */
public record AdminReminderResponse(
        Long id,
        Long userId,
        LocalTime reminderTime,
        String message
) {

    /** Reminder 엔티티를 관리자 리마인더 응답 DTO로 변환한다. */
    public static AdminReminderResponse from(Reminder reminder) {
        return new AdminReminderResponse(
                reminder.getId(),
                reminder.getUserId(),
                reminder.getReminderTime(),
                reminder.getMessage()
        );
    }
}

