package booktine.Booktine.domain.recommendation.entity;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자별 추천 도서 정보를 저장하는 JPA 엔티티.
 * 알라딘 추천 결과를 사용자가 저장할 때 RecommendationService를 통해 생성되어 영속화된다.
 */
@Getter
@Entity
@Table(name = "recommendations")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Recommendation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String author;

    private String publisher;

    private String coverImageUrl;

    private String genre;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String isbn;

    /**
     * 추천 도서 저장 시 Recommendation 엔티티를 생성한다.
     */
    @Builder
    public Recommendation(User user, String title, String author, String publisher, String coverImageUrl,
                          String genre, String description, String isbn) {
        this.user = user;
        this.title = title;
        this.author = author;
        this.publisher = publisher;
        this.coverImageUrl = coverImageUrl;
        this.genre = genre;
        this.description = description;
        this.isbn = isbn;
    }
}
