package booktine.Booktine.domain.community.entity;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 커뮤니티 게시글에 작성된 댓글과 대댓글을 저장하는 JPA 엔티티.
 * parent 참조가 있으면 대댓글이며, 대댓글의 대댓글은 서비스 계층에서 차단한다.
 */
@Getter
@Entity
@Table(name = "community_comments", indexes = {
        @Index(name = "idx_community_comments_post_id", columnList = "post_id"),
        @Index(name = "idx_community_comments_user_id", columnList = "user_id"),
        @Index(name = "idx_community_comments_parent_id", columnList = "parent_id")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommunityComment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private CommunityPost post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private boolean isDeleted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private CommunityComment parent;

    @Builder
    public CommunityComment(CommunityPost post, User user, String content, CommunityComment parent) {
        this.post = post;
        this.user = user;
        this.content = content;
        this.parent = parent;
        this.isDeleted = false;
    }

    /** 댓글/대댓글 내용을 수정한다. */
    public void updateContent(String content) {
        this.content = content;
    }

    /** 대댓글이 남아 있는 댓글을 소프트 삭제 상태로 변경한다. */
    public void markDeleted() {
        this.content = "삭제된 댓글입니다";
        this.isDeleted = true;
    }

    /** 대댓글 여부를 반환한다. */
    public boolean isReply() {
        return parent != null;
    }
}
