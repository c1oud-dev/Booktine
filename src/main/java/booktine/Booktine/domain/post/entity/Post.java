package booktine.Booktine.domain.post.entity;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 사용자가 작성한 독서 게시물 정보를 저장하는 JPA 엔티티.
 * 게시물 CRUD 및 상태 기반 조회 기능의 핵심 영속 객체로 사용된다.
 */
@Getter
@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_posts_user_id", columnList = "user_id"),
        @Index(name = "idx_posts_reading_status", columnList = "reading_status"),
        @Index(name = "idx_posts_completed_date", columnList = "completed_date")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String coverImageUrl;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String genre;

    @Column(nullable = false)
    private String publisher;

    @Column(nullable = false)
    private LocalDate publishedDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReadingStatus readingStatus;

    private LocalDate completedDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    /** 게시물 생성 시 필요한 필드를 초기화하는 빌더 생성자 */
    @Builder
    public Post(String title, String coverImageUrl, String author, String genre, String publisher,
                LocalDate publishedDate, String summary, ReadingStatus readingStatus,
                LocalDate completedDate, User user) {
        this.title = title;
        this.coverImageUrl = coverImageUrl;
        this.author = author;
        this.genre = genre;
        this.publisher = publisher;
        this.publishedDate = publishedDate;
        this.summary = summary;
        this.readingStatus = readingStatus;
        this.completedDate = completedDate;
        this.user = user;
    }

    /** 게시물 수정 요청의 변경 가능한 정보를 반영한다 */
    public void updateDetails(String title, String author, String genre, String publisher,
                              LocalDate publishedDate, String summary, ReadingStatus readingStatus,
                              LocalDate completedDate) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.publisher = publisher;
        this.publishedDate = publishedDate;
        this.summary = summary;
        this.readingStatus = readingStatus;
        this.completedDate = completedDate;
    }
}
