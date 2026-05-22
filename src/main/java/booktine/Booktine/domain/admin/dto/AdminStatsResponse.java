package booktine.Booktine.domain.admin.dto;

/**
 * 관리자 대시보드 통계 수치를 묶어 반환하는 DTO.
 * AdminController의 통계 API에서 서비스 계산 결과를 응답 본문으로 전달할 때 사용된다.
 */
public record AdminStatsResponse(
        long totalUsers,
        long monthlyUsers,
        long totalPosts,
        long monthlyPosts,
        long activeUsers
) {

    /** 통계 항목 값을 기반으로 관리자 통계 응답 DTO를 생성한다. */
    public static AdminStatsResponse from(
            long totalUsers,
            long monthlyUsers,
            long totalPosts,
            long monthlyPosts,
            long activeUsers
    ) {
        return new AdminStatsResponse(
                totalUsers,
                monthlyUsers,
                totalPosts,
                monthlyPosts,
                activeUsers
        );
    }
}
