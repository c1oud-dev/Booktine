package booktine.Booktine.domain.progress.dto;

import booktine.Booktine.domain.progress.entity.AnnualGoal;

/**
 * 연간 목표 응답 DTO.
 * AnnualGoalController의 응답 바디로 사용된다.
 */
public record AnnualGoalResponse(
        Long id,
        Integer year,
        Integer goalCount
) {

    /**
     * AnnualGoal 엔티티를 응답 DTO로 변환한다.
     */
    public static AnnualGoalResponse from(AnnualGoal goal) {
        return new AnnualGoalResponse(
                goal.getId(),
                goal.getYear(),
                goal.getGoalCount()
        );
    }
}
