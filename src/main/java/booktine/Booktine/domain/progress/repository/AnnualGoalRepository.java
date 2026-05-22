package booktine.Booktine.domain.progress.repository;

import booktine.Booktine.domain.progress.entity.AnnualGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 연간 목표 엔티티를 조회/저장하는 리포지토리.
 * 사용자별, 연도별 연간 목표를 검색할 때 사용된다.
 */
public interface AnnualGoalRepository extends JpaRepository<AnnualGoal, Long> {

    /**
     * 사용자와 연도로 연간 목표를 단건 조회한다.
     */
    Optional<AnnualGoal> findByUserIdAndYear(Long userId, Integer year);

    /** 회원 탈퇴 시 연간 목표를 일괄 삭제한다. */
    void deleteAllByUserId(Long userId);
}
