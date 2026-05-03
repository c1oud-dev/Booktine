package booktine.Booktine.domain.progress.service;

import booktine.Booktine.domain.progress.dto.AnnualGoalCreateRequest;
import booktine.Booktine.domain.progress.dto.AnnualGoalResponse;
import booktine.Booktine.domain.progress.entity.AnnualGoal;
import booktine.Booktine.domain.progress.repository.AnnualGoalRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 연간 목표 CRUD 비즈니스 로직을 담당하는 서비스.
 * 사용자/연도 기준 단일 연간 목표를 생성, 조회, 수정, 삭제한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnualGoalService {

    private final AnnualGoalRepository annualGoalRepository;
    private final UserRepository userRepository;

    /** 연간 목표를 설정한다. 동일 연도에 이미 존재하면 예외를 발생시킨다. */
    @Transactional
    public AnnualGoalResponse create(Long userId, AnnualGoalCreateRequest request) {
        User user = getUserOrThrow(userId);
        if (annualGoalRepository.findByUserIdAndYear(userId, request.year()).isPresent()) {
            throw new CustomException(ErrorCode.ANNUAL_GOAL_ALREADY_EXISTS);
        }
        AnnualGoal goal = annualGoalRepository.save(AnnualGoal.builder()
                .user(user)
                .year(request.year())
                .goalCount(request.goalCount())
                .build());
        return AnnualGoalResponse.from(goal);
    }

    /** 특정 연도의 연간 목표를 조회한다. */
    public AnnualGoalResponse getGoal(Long userId, Integer year) {
        validateUserExists(userId);
        return AnnualGoalResponse.from(findGoalByUserAndYear(userId, year));
    }

    /** 사용자 연간 목표 목록을 조회한다. */
    public List<AnnualGoalResponse> getAll(Long userId) {
        validateUserExists(userId);
        return annualGoalRepository.findAllByUserIdOrderByYearAsc(userId).stream().map(AnnualGoalResponse::from).toList();
    }

    /** 특정 연도의 연간 목표를 조회한다. */
    public AnnualGoalResponse getByYear(Long userId, Integer year) {
        return AnnualGoalResponse.from(findGoalByUserAndYear(userId, year));
    }

    /** 특정 연도의 연간 목표를 수정한다. */
    @Transactional
    public AnnualGoalResponse update(Long userId, Integer year, AnnualGoalCreateRequest request) {
        validateUserExists(userId);
        AnnualGoal goal = findGoalByUserAndYear(userId, year);
        goal.updateGoalCount(request.goalCount());
        return AnnualGoalResponse.from(goal);
    }

    /** 특정 연도의 연간 목표를 삭제한다. */
    @Transactional
    public void deleteByYear(Long userId, Integer year) {
        annualGoalRepository.delete(findGoalByUserAndYear(userId, year));
    }

    /** ID로 사용자를 조회한다. */
    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    /** 사용자 존재 여부를 검증한다. */
    private void validateUserExists(Long userId) {
        getUserOrThrow(userId);
    }


    /** 사용자/연도 조건으로 연간 목표를 조회한다. */
    private AnnualGoal findGoalByUserAndYear(Long userId, Integer year) {
        validateUserExists(userId);
        return annualGoalRepository.findByUserIdAndYear(userId, year)
                .orElseThrow(() -> new CustomException(ErrorCode.ANNUAL_GOAL_NOT_FOUND));
    }
}
