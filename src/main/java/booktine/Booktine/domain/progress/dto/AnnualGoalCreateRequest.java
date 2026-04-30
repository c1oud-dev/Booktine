package booktine.Booktine.domain.progress.dto;

/**
 * 연간 목표 생성 요청 DTO.
 * AnnualGoalController의 POST /goals/annual 요청 바디로 사용된다.
 */
public record AnnualGoalCreateRequest(
        Integer year,
        Integer goalCount
) {
}
