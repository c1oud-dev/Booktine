package booktine.Booktine.domain.progress.dto;

/**
 * 월간 목표 생성 요청 DTO.
 * MonthlyGoalController의 POST /goals/monthly 요청 바디로 사용된다.
 */
public record MonthlyGoalCreateRequest(
        Integer year,
        Integer month,
        Integer goalCount
) {
}
