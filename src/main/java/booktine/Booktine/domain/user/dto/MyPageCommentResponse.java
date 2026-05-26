package booktine.Booktine.domain.user.dto;

import booktine.Booktine.domain.community.entity.CommunityComment;
import java.time.LocalDateTime;

public record MyPageCommentResponse(Long id, Long postId, String content, LocalDateTime createdAt) {
    public static MyPageCommentResponse from(CommunityComment comment) { return new MyPageCommentResponse(comment.getId(), comment.getPost().getId(), comment.getContent(), comment.getCreatedAt()); }
}
