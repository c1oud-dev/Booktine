package booktine.Booktine.domain.community.dto;

import booktine.Booktine.domain.community.entity.CommunityComment;

import java.time.LocalDateTime;

/** 커뮤니티 댓글/대댓글 조회 결과를 반환하는 응답 DTO. */
public record CommunityCommentResponse(
        Long id,
        Long postId,
        Long userId,
        String content,
        Long parentId,
        int depth,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /** CommunityComment 엔티티를 응답 DTO로 변환한다. */
    public static CommunityCommentResponse from(CommunityComment comment) {
        return new CommunityCommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getUser().getId(),
                comment.getContent(),
                comment.getParent() == null ? null : comment.getParent().getId(),
                comment.isReply() ? 2 : 1,
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}

