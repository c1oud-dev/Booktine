package booktine.Booktine.domain.progress.service;

import booktine.Booktine.domain.progress.dto.MonthlyGoalCreateRequest;
import booktine.Booktine.domain.progress.dto.MonthlyGoalResponse;
import booktine.Booktine.domain.progress.entity.MonthlyGoal;
import booktine.Booktine.domain.progress.repository.MonthlyGoalRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 월간 목표 CRUD 비즈니스 로직을 담당하는 서비스.
 * 사용자/연월 기준 단일 월간 목표를 생성, 조회, 수정, 삭제한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MonthlyGoalService {

    private final MonthlyGoalRepository monthlyGoalRepository;
    private final UserRepository userRepository;

    /** 월간 목표를 설정한다. 동일 연월에 이미 존재하면 예외를 발생시킨다. */
    @Transactional
    public MonthlyGoalResponse create(Long userId, MonthlyGoalCreateRequest request) {
        User user = getUserOrThrow(userId);
        if (monthlyGoalRepository.findByUserIdAndYearAndMonth(userId, request.year(), request.month()).isPresent()) {
            throw new CustomException(ErrorCode.MONTHLY_GOAL_ALREADY_EXISTS);
        }
        MonthlyGoal goal = monthlyGoalRepository.save(MonthlyGoal.builder()
                .user(user)
                .year(request.year())
                .month(request.month())
                .goalCount(request.goalCount())
                .build());
        return MonthlyGoalResponse.from(goal);
    }

    /** 특정 연월의 월간 목표를 조회한다. */
    public MonthlyGoalResponse getGoal(Long userId, Integer year, Integer month) {
        validateUserExists(userId);
        return MonthlyGoalResponse.from(findGoalByUserYearMonth(userId, year, month));
    }

    /** 특정 연도의 월간 목표 목록을 조회한다. */
    public List<MonthlyGoalResponse> getByYear(Long userId, Integer year) {
        validateUserExists(userId);
        return monthlyGoalRepository.findAllByUserIdAndYearOrderByMonthAsc(userId, year).stream()
                .map(MonthlyGoalResponse::from).toList();
    }

    /** 특정 연월의 월간 목표를 조회한다. */
    public MonthlyGoalResponse getByYearAndMonth(Long userId, Integer year, Integer month) {
        return MonthlyGoalResponse.from(findGoalByUserYearMonth(userId, year, month));
    }

    /** 특정 연월의 월간 목표를 수정한다. */
    @Transactional
    public MonthlyGoalResponse update(Long userId, Integer year, Integer month, MonthlyGoalCreateRequest request) {
        validateUserExists(userId);
        MonthlyGoal goal = findGoalByUserYearMonth(userId, year, month);
        goal.updateGoalCount(request.goalCount());
        return MonthlyGoalResponse.from(goal);
    }

    /** 특정 연월의 월간 목표를 삭제한다. */
    @Transactional
    public void deleteByYearAndMonth(Long userId, Integer year, Integer month) {
        monthlyGoalRepository.delete(findGoalByUserYearMonth(userId, year, month));
    }

    /** ID로 사용자를 조회한다. */
    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    /** 사용자 존재 여부를 검증한다. */
    private void validateUserExists(Long userId) {
        getUserOrThrow(userId);
    }

    /** 사용자/연/월 조건으로 월간 목표를 조회한다. */
    private MonthlyGoal findGoalByUserYearMonth(Long userId, Integer year, Integer month) {
        validateUserExists(userId);
        return monthlyGoalRepository.findByUserIdAndYearAndMonth(userId, year, month)
                .orElseThrow(() -> new CustomException(ErrorCode.MONTHLY_GOAL_NOT_FOUND));
    }
}
