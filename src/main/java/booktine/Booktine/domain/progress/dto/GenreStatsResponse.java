package booktine.Booktine.domain.progress.dto;

/**
 * 장르별 독서 비율 통계 응답 DTO.
 * StatisticsController의 GET /stats/genre 응답 바디의 리스트 항목으로 사용된다.
 */
public record GenreStatsResponse(
        String genre,
        long count,
        double percentage
) {
}
