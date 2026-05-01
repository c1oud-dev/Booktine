package booktine.Booktine.domain.memo.repository;

import booktine.Booktine.domain.memo.entity.Memo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Memo 엔티티의 영속성 처리를 담당하는 리포지토리.
 * 게시물별 메모 목록 조회 쿼리를 제공한다.
 */
public interface MemoRepository extends JpaRepository<Memo, Long> {

    /**
     * 게시물 ID 기준으로 연결된 메모를 모두 조회한다.
     */
    Page<Memo> findAllByPostId(Long postId, Pageable pageable);
}
