package booktine.Booktine.domain.progress.repository;

import booktine.Booktine.domain.progress.entity.MonthlyGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 월간 목표 엔티티를 조회/저장하는 리포지토리.
 * 사용자별 연/월 조건으로 목표를 조회할 때 사용된다.
 */
public interface MonthlyGoalRepository extends JpaRepository<MonthlyGoal, Long> {

    /** 사용자와 연/월로 월간 목표를 단건 조회한다. */
    Optional<MonthlyGoal> findByUserIdAndYearAndMonth(Long userId, Integer year, Integer month);

    /** 사용자와 연도로 월간 목표 목록을 조회한다. */
    List<MonthlyGoal> findAllByUserIdAndYearOrderByMonthAsc(Long userId, Integer year);

    /** 회원 탈퇴 시 월간 목표를 일괄 삭제한다. */
    void deleteAllByUserId(Long userId);
}
