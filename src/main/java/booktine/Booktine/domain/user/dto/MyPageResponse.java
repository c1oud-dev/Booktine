package booktine.Booktine.domain.user.dto;

import java.time.LocalDateTime;
import java.util.List;

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
