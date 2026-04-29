package booktine.Booktine.domain.memo.entity;

import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 게시물에 대한 메모 정보를 저장하는 JPA 엔티티.
 * 게시물 상세에서 사용자 메모 생성/조회/수정/삭제 기능에 사용된다.
 */
@Getter
@Entity
@Table(name = "memos")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Memo extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private Post post;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer page;

    /**
     * 메모 생성 시 필요한 값을 초기화한다.
     */
    @Builder
    public Memo(Post post, String content, Integer page) {
        this.post = post;
        this.content = content;
        this.page = page;
    }

    /**
     * 메모 수정 시 내용과 페이지를 갱신한다.
     */
    public void update(String content, Integer page) {
        this.content = content;
        this.page = page;
    }
}
