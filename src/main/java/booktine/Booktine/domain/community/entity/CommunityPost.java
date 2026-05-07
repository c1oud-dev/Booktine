package booktine.Booktine.domain.community.entity;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 독서 커뮤니티 게시글 정보를 저장하는 JPA 엔티티.
 * 기존 개인 독서 기록 Post 도메인과 분리된 커뮤니티 게시판의 루트 리소스로 사용된다.
 */
@Getter
@Entity
@Table(name = "community_posts", indexes = {
        @Index(name = "idx_community_posts_user_id", columnList = "user_id"),
        @Index(name = "idx_community_posts_created", columnList = "created_at")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommunityPost extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private int likeCount;

    @Column(nullable = false)
    private boolean isDeleted;

    @Column
    private LocalDateTime contentUpdatedAt;

    @Builder
    public CommunityPost(User user, String title, String content) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.likeCount = 0;
        this.isDeleted = false;
    }

    /** 커뮤니티 게시글의 수정 가능한 내용을 변경한다. */
    public void updateDetails(String title, String content) {
        this.title = title;
        this.content = content;
        this.contentUpdatedAt = LocalDateTime.now();
    }

    /** 댓글이 남아 있는 게시글을 소프트 삭제 상태로 변경한다. */
    public void markDeleted() {
        this.title = "삭제된 게시글입니다";
        this.content = "삭제된 게시글입니다";
        this.isDeleted = true;
        this.likeCount = 0;
    }

    /** 좋아요 수를 1 증가시킨다. */
    public void increaseLikeCount() {
        this.likeCount++;
    }

    /** 좋아요 수를 1 감소시키되 음수가 되지 않도록 보정한다. */
    public void decreaseLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }
}

