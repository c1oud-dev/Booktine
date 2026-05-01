package booktine.Booktine.domain.recommendation.repository;

import booktine.Booktine.domain.recommendation.entity.Recommendation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Recommendation 엔티티 영속성 처리를 담당하는 레포지토리.
 * 사용자별 저장 추천 목록 조회 및 기본 CRUD에 사용된다.
 */
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    /**
     * 사용자 ID 기준으로 저장된 추천 도서 목록을 조회한다.
     */
    Page<Recommendation> findAllByUserId(Long userId, Pageable pageable);
}
