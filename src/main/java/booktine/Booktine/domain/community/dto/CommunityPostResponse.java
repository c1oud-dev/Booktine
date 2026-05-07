package booktine.Booktine.domain.community.dto;

import booktine.Booktine.domain.community.entity.CommunityPost;

import java.time.LocalDateTime;

/** 커뮤니티 게시글 조회 결과를 반환하는 응답 DTO. */
public record CommunityPostResponse(
        Long id,
        Long userId,
        String title,
        String content,
        int likeCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /** CommunityPost 엔티티를 응답 DTO로 변환한다. */
    public static CommunityPostResponse from(CommunityPost post) {
        return new CommunityPostResponse(
                post.getId(),
                post.getUser().getId(),
                post.getTitle(),
                post.getContent(),
                post.getLikeCount(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}