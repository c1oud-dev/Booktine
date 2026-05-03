package booktine.Booktine.domain.progress.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * 연간 목표 생성 요청 DTO.
 * AnnualGoalController의 POST /goals/annual 요청 바디로 사용된다.
 */
public record AnnualGoalCreateRequest(
        @NotNull(message = "연도는 필수입니다.")
        @Min(value = 2000, message = "연도는 2000년 이상이어야 합니다.")
        Integer year,

        @NotNull(message = "목표 권수는 필수입니다.")
        @Min(value = 1, message = "목표 권수는 1 이상이어야 합니다.")
        Integer goalCount
) {
}
