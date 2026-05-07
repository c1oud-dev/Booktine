package booktine.Booktine.domain.community.entity;

import booktine.Booktine.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 커뮤니티 게시글 좋아요 이력을 저장하는 JPA 엔티티.
 * 게시글과 회원 조합에 유니크 제약을 걸어 중복 좋아요를 방지한다.
 */
@Getter
@Entity
@Table(name = "community_likes", uniqueConstraints = {
        @UniqueConstraint(name = "uk_community_likes_post_user", columnNames = {"post_id", "user_id"})
}, indexes = {
        @Index(name = "idx_community_likes_user_id", columnList = "user_id")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommunityLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private CommunityPost post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Builder
    public CommunityLike(CommunityPost post, User user) {
        this.post = post;
        this.user = user;
    }
}
