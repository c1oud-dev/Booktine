package booktine.Booktine.domain.recommendation.repository;

import booktine.Booktine.domain.recommendation.entity.Recommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Recommendation 엔티티 영속성 처리를 담당하는 레포지토리.
 * 사용자별 저장 추천 목록 조회 및 기본 CRUD에 사용된다.
 */
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    /** 사용자 ID 기준으로 저장된 추천 도서 목록을 조회한다. */
    Page<Recommendation> findAllByUserId(Long userId, Pageable pageable);

    /** 회원 탈퇴 시 저장된 추천 도서를 일괄 삭제한다. */
    void deleteAllByUserId(Long userId);

    /** 사용자와 ISBN 기준으로 저장된 추천 도서 단건을 조회한다. */
    Optional<Recommendation> findByUserIdAndIsbn(Long userId, String isbn);
}
