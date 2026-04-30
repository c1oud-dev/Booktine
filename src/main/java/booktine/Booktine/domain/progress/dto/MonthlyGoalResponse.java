package booktine.Booktine.domain.progress.dto;

import booktine.Booktine.domain.progress.entity.MonthlyGoal;

/**
 * 월간 목표 응답 DTO.
 * MonthlyGoalController의 응답 바디로 사용된다.
 */
public record MonthlyGoalResponse(
        Long id,
        Integer year,
        Integer month,
        Integer goalCount
) {

    /**
     * MonthlyGoal 엔티티를 응답 DTO로 변환한다.
     */
    public static MonthlyGoalResponse from(MonthlyGoal goal) {
        return new MonthlyGoalResponse(
                goal.getId(),
                goal.getYear(),
                goal.getMonth(),
                goal.getGoalCount()
        );
    }
}
