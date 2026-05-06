package booktine.Booktine.domain.progress.entity;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 월간 독서 목표를 저장하는 JPA 엔티티.
 * Progress 도메인에서 월별 목표 CRUD 및 월별 달성 통계 비교에 사용된다.
 */
@Getter
@Entity
@Table(name = "monthly_goals", indexes = {
        @Index(name = "idx_monthly_goals_user_year_month", columnList = "user_id, goal_year, goal_month", unique = true)
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MonthlyGoal extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "goal_year", nullable = false)
    private Integer year;

    @Column(name = "goal_month", nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer goalCount;

    /**
     * 월간 목표 생성 시 필요한 필드를 초기화한다.
     */
    @Builder
    public MonthlyGoal(User user, Integer year, Integer month, Integer goalCount) {
        this.user = user;
        this.year = year;
        this.month = month;
        this.goalCount = goalCount;
    }

    /**
     * 월간 목표 수치를 수정한다.
     */
    public void updateGoalCount(Integer goalCount) {
        this.goalCount = goalCount;
    }
}
