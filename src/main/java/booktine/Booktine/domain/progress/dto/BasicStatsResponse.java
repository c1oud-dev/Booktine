package booktine.Booktine.domain.progress.dto;

/**
 * 기본 통계 응답 DTO.
 * StatisticsController의 GET /stats 응답 바디로 사용된다.
 */
public record BasicStatsResponse(
        long totalFinished,
        long currentYearFinished,
        long currentMonthFinished
) {
}
