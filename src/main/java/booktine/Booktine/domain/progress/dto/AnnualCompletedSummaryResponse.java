package booktine.Booktine.domain.progress.dto;

/**
 * 연간 완독 현황 요약 응답 DTO.
 * 월별 완독 권수에서 파생되는 총 완독 수, 최고 월, 완독 발생 월 수를 백엔드에서 계산해 제공한다.
 */
public record AnnualCompletedSummaryResponse(
        long totalCount,
        Integer bestMonth,
        long bestMonthCount,
        long activeMonthCount
) {

    /** 완독 기록이 없는 연도의 빈 요약 값을 생성한다. */
    public static AnnualCompletedSummaryResponse empty() {
        return new AnnualCompletedSummaryResponse(0, null, 0, 0);
    }
}
