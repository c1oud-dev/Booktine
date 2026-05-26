package booktine.Booktine.domain.user.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 마이페이지 상세 응답 DTO.
 * 사용자 기본 정보, 독서 통계, 최근 커뮤니티 활동을 한 번에 내려줄 때 사용한다.
 */
public record MyPageResponse(
        Long id,
        String email,
        String nickname,
        String aboutMe,
        String profileImageUrl,
        LocalDateTime createdAt,
        long readingCount,
        long completedCount,
        long wishCount,
        List<MyPageCommunityPostResponse> communityPosts,
        List<MyPageCommentResponse> comments
) {}
