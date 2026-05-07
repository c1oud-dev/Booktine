package booktine.Booktine.domain.community.dto;

import booktine.Booktine.domain.community.entity.CommunityPost;

import java.time.LocalDateTime;
import java.util.Objects;

/** 커뮤니티 게시글 목록 전용 요약 응답 DTO. */
public record CommunityPostSummaryResponse(
        Long id,
        Long userId,
        String authorNickname,
        String authorProfileImageUrl,
        String title,
        String content,
        int likeCount,
        boolean isDeleted,
        boolean isEdited,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CommunityPostSummaryResponse from(CommunityPost post) {
        return new CommunityPostSummaryResponse(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getNickname(),
                post.getUser().getProfileImageUrl(),
                post.getTitle(),
                post.getContent(),
                post.getLikeCount(),
                post.isDeleted(),
                !Objects.equals(post.getUpdatedAt(), post.getCreatedAt()),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}