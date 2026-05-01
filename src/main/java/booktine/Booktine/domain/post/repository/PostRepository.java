package booktine.Booktine.domain.post.repository;

import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

/**
 * 게시물 엔티티의 DB 접근을 담당하는 JPA 리포지토리.
 * 사용자별 게시물 목록/검색/상태 집계 쿼리를 제공한다.
 */
public interface PostRepository extends JpaRepository<Post, Long>, PostRepositoryCustom {

    /**
     * 사용자 ID로 전체 게시물 목록을 조회한다.
     */
    Page<Post> findAllByUserId(Long userId, Pageable pageable);

    /**
     * 사용자 ID와 독서 상태로 게시물 목록을 조회한다.
     */
    List<Post> findAllByUserIdAndReadingStatus(Long userId, ReadingStatus readingStatus);

    /**
     * 사용자 ID와 제목 키워드로 게시물 목록을 조회한다.
     */
    List<Post> findAllByUserIdAndTitleContaining(Long userId, String title);

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
    List<Post> findAllByUserIdAndReadingStatusAndCompletedDateBetween(Long userId, ReadingStatus readingStatus, LocalDate from, LocalDate to);
}
