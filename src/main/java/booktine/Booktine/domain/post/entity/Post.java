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
        @Index(name = "idx_posts_completed_date", columnList = "completed_date"),
        @Index(name = "idx_posts_user_status_completed", columnList = "user_id, reading_status, completed_date"),
        @Index(name = "idx_posts_user_created", columnList = "user_id, created_at")
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

    private String genre;

    @Column(nullable = false)
    private String publisher;

    private LocalDate publishedDate;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReadingStatus readingStatus;

    private LocalDate startDate;

    private LocalDate completedDate;

    private Double rating;

    private String shortReview;

    private Integer currentPage;

    private Integer totalPage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    /** 게시물 생성 시 필요한 필드를 초기화하는 빌더 생성자 */
    @Builder
    public Post(String title, String coverImageUrl, String author, String genre, String publisher,
                LocalDate publishedDate, String summary, ReadingStatus readingStatus,
                LocalDate startDate, LocalDate completedDate, Double rating, String shortReview,
                Integer currentPage, Integer totalPage, User user) {
        this.title = title;
        this.coverImageUrl = coverImageUrl;
        this.author = author;
        this.genre = genre;
        this.publisher = publisher;
        this.publishedDate = publishedDate;
        this.summary = summary;
        this.readingStatus = readingStatus;
        this.startDate = startDate;
        this.completedDate = completedDate;
        this.rating = rating;
        this.shortReview = shortReview;
        this.currentPage = currentPage;
        this.totalPage = totalPage;
        this.user = user;
    }

    /** 게시물 수정 요청의 변경 가능한 정보를 반영한다 */
    public void updateDetails(String title, String author, String genre, String publisher,
                              LocalDate publishedDate, String summary, ReadingStatus readingStatus,
                              LocalDate startDate, LocalDate completedDate, Double rating, String shortReview,
                              Integer currentPage, Integer totalPage) {
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.publisher = publisher;
        this.publishedDate = publishedDate;
        this.summary = summary;
        this.readingStatus = readingStatus;
        this.startDate = startDate;
        this.completedDate = completedDate;
        this.rating = rating;
        this.shortReview = shortReview;
        this.currentPage = currentPage;
        this.totalPage = totalPage;
    }
}
