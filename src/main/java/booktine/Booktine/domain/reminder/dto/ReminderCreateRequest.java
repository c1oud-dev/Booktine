package booktine.Booktine.domain.reminder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

/**
 * 리마인더 생성 요청 바디를 표현하는 DTO.
 * ReminderController에서 검증 후 ReminderService로 전달한다.
 */
public record ReminderCreateRequest(
        @NotNull LocalTime reminderTime,
        @NotBlank String message
) {
}
