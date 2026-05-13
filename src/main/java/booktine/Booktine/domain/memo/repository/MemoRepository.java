package booktine.Booktine.domain.memo.repository;

import booktine.Booktine.domain.memo.entity.Memo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Memo 엔티티의 영속성 처리를 담당하는 리포지토리.
 * 게시물별 메모 목록 조회 쿼리를 제공한다.
 */
public interface MemoRepository extends JpaRepository<Memo, Long> {

    /**
     * 게시물 ID 기준으로 연결된 메모를 모두 조회한다.
     */
    @EntityGraph(attributePaths = "post")
    Page<Memo> findAllByPostId(Long postId, Pageable pageable);

    /** 메모와 연결 게시물/사용자 정보를 함께 조회한다. */
    @EntityGraph(attributePaths = {"post", "post.user"})
    Optional<Memo> findWithPostAndUserByIdAndPostId(Long id, Long postId);

    /** 회원 탈퇴 시 사용자 게시물에 연결된 메모를 일괄 삭제한다. */
    void deleteAllByPostUserId(Long userId);
}
