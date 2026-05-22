package booktine.Booktine.domain.community.dto;

import booktine.Booktine.domain.community.entity.CommunityCategory;
import booktine.Booktine.domain.community.entity.CommunityPost;

import java.time.LocalDateTime;

/** 커뮤니티 게시글 조회 결과를 반환하는 응답 DTO. */
public record CommunityPostResponse(
        Long id,
        Long userId,
        String authorNickname,
        String authorProfileImageUrl,
        String title,
        String content,
        CommunityCategory category,
        int likeCount,
        boolean isLiked,
        boolean isDeleted,
        boolean isEdited,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /** CommunityPost 엔티티를 응답 DTO로 변환한다. */
    public static CommunityPostResponse from(CommunityPost post) {
        return new CommunityPostResponse(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getNickname(),
                post.getUser().getProfileImageUrl(),
                post.getTitle(),
                post.getContent(),
                post.getCategory(),
                post.getLikeCount(),
                false,
                post.isDeleted(),
                post.getContentUpdatedAt() != null,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    /** CommunityPost 엔티티와 현재 사용자 좋아요 여부를 응답 DTO로 변환한다. */
    public static CommunityPostResponse from(CommunityPost post, boolean isLiked) {
        return new CommunityPostResponse(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getNickname(),
                post.getUser().getProfileImageUrl(),
                post.getTitle(),
                post.getContent(),
                post.getCategory(),
                post.getLikeCount(),
                isLiked,
                post.isDeleted(),
                post.getContentUpdatedAt() != null,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}