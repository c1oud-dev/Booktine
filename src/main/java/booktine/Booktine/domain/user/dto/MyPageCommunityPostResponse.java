package booktine.Booktine.domain.user.dto;

import booktine.Booktine.domain.community.entity.CommunityPost;
import java.time.LocalDateTime;

public record MyPageCommunityPostResponse(Long id, String title, LocalDateTime createdAt) {
    public static MyPageCommunityPostResponse from(CommunityPost post) { return new MyPageCommunityPostResponse(post.getId(), post.getTitle(), post.getCreatedAt()); }
}
