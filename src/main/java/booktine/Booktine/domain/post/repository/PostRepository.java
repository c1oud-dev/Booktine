package booktine.Booktine.domain.post.repository;

import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.progress.dto.GenreStatsResponse;
import booktine.Booktine.domain.progress.dto.MonthlyReadCountResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 게시물 엔티티의 DB 접근을 담당하는 JPA 리포지토리.
 * 사용자별 게시물 목록/검색/상태 집계 쿼리를 제공한다.
 */
public interface PostRepository extends JpaRepository<Post, Long>, PostRepositoryCustom {

    /**
     * 사용자 ID로 전체 게시물 목록을 조회한다.
     */
    @EntityGraph(attributePaths = "user")
    Page<Post> findAllByUserId(Long userId, Pageable pageable);

    /**
     * 사용자 ID와 독서 상태로 게시물 목록을 조회한다.
     */
    @EntityGraph(attributePaths = "user")
    List<Post> findAllByUserIdAndReadingStatus(Long userId, ReadingStatus readingStatus);

    /**
     * 사용자 ID와 제목 키워드로 게시물 목록을 조회한다.
     */
    @EntityGraph(attributePaths = "user")
    List<Post> findAllByUserIdAndTitleContaining(Long userId, String title);

    /** 게시물 ID로 사용자 정보를 함께 조회한다. */
    @EntityGraph(attributePaths = "user")
    Optional<Post> findWithUserById(Long id);

    /** 사용자 ID와 게시물 ID로 소유 게시물을 사용자 정보와 함께 단건 조회한다. */
    @EntityGraph(attributePaths = "user")
    Optional<Post> findWithUserByIdAndUserId(Long id, Long userId);

    /** 게시물 존재 여부와 소유권을 한 번에 확인한다. */
    boolean existsByIdAndUserId(Long id, Long userId);

    /**
     * 사용자 ID와 독서 상태로 게시물 수를 집계한다.
     */
    long countByUserIdAndReadingStatus(Long userId, ReadingStatus readingStatus);

    /**
     * 사용자 ID와 독서 상태, 완독일 범위로 게시물 수를 집계한다.
     */
    long countByUserIdAndReadingStatusAndCompletedDateBetween(Long userId, ReadingStatus readingStatus, LocalDate from, LocalDate to);

    /**
     * 사용자 ID와 독서 상태, 완독일 범위로 게시물 목록을 조회한다.
     */
    @EntityGraph(attributePaths = "user")
    List<Post> findAllByUserIdAndReadingStatusAndCompletedDateBetween(Long userId, ReadingStatus readingStatus, LocalDate from, LocalDate to);

    /** 완독 게시물의 장르별 건수를 DB에서 집계한다. */
    @Query("""
            select new booktine.Booktine.domain.progress.dto.GenreStatsResponse(p.genre, count(p), 0.0)
            from Post p
            where p.user.id = :userId
              and p.readingStatus = :status
              and (:from is null or p.completedDate >= :from)
              and (:to is null or p.completedDate <= :to)
            group by p.genre
            order by count(p) desc, p.genre asc
            """)
    List<GenreStatsResponse> countCompletedGenres(
            @Param("userId") Long userId,
            @Param("status") ReadingStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /** 특정 연도 완독 게시물의 월별 건수를 DB에서 집계한다. */
    @Query("""
            select new booktine.Booktine.domain.progress.dto.MonthlyReadCountResponse(month(p.completedDate), count(p))
            from Post p
            where p.user.id = :userId
              and p.readingStatus = :status
              and p.completedDate between :from and :to
            group by month(p.completedDate)
            """)
    List<MonthlyReadCountResponse> countCompletedMonths(
            @Param("userId") Long userId,
            @Param("status") ReadingStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}
