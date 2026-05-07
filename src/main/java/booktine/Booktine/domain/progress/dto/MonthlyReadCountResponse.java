package booktine.Booktine.domain.progress.dto;

/**
 * 연간 월별 완독 권수 응답 DTO.
 * StatisticsController의 GET /stats/annual/completed-counts 응답 바디의 리스트 항목으로 사용된다.
 */
public record MonthlyReadCountResponse(
        Integer month,
        long count
) {
}
