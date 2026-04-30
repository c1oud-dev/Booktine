package booktine.Booktine.domain.progress.service;

import booktine.Booktine.domain.progress.dto.MonthlyGoalCreateRequest;
import booktine.Booktine.domain.progress.dto.MonthlyGoalResponse;
import booktine.Booktine.domain.progress.entity.MonthlyGoal;
import booktine.Booktine.domain.progress.repository.MonthlyGoalRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class MonthlyGoalServiceTest {

    @InjectMocks
    MonthlyGoalService monthlyGoalService;
    @Mock
    MonthlyGoalRepository monthlyGoalRepository;
    @Mock
    UserRepository userRepository;

    @Test
    @DisplayName("월간 목표 설정 성공")
    void create_success() {
        // given
        User user = user();
        MonthlyGoal goal = MonthlyGoal.builder().user(user).year(2026).month(4).goalCount(4).build();
        ReflectionTestUtils.setField(goal, "id", 1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(monthlyGoalRepository.findByUserIdAndYearAndMonth(1L, 2026, 4)).willReturn(Optional.empty());
        given(monthlyGoalRepository.save(any())).willReturn(goal);

        // when
        MonthlyGoalResponse res = monthlyGoalService.create(1L, new MonthlyGoalCreateRequest(2026, 4, 4));

        // then
        assertThat(res.month()).isEqualTo(4);
        assertThat(res.goalCount()).isEqualTo(4);
    }

    @Test
    @DisplayName("이미 존재하는 월에 월간 목표 설정 시 예외 발생")
    void create_duplicate_throws() {
        // given
        User user = user();
        MonthlyGoal existing = MonthlyGoal.builder().user(user).year(2026).month(4).goalCount(4).build();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(monthlyGoalRepository.findByUserIdAndYearAndMonth(1L, 2026, 4)).willReturn(Optional.of(existing));

        // when & then
        assertThatThrownBy(() -> monthlyGoalService.create(1L, new MonthlyGoalCreateRequest(2026, 4, 4)))
                .isInstanceOf(CustomException.class);
    }

    @Test
    @DisplayName("월간 목표 조회 성공")
    void getGoal_success() {
        // given
        User user = user();
        MonthlyGoal goal = MonthlyGoal.builder().user(user).year(2026).month(4).goalCount(4).build();
        ReflectionTestUtils.setField(goal, "id", 1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(monthlyGoalRepository.findByUserIdAndYearAndMonth(1L, 2026, 4)).willReturn(Optional.of(goal));

        // when
        MonthlyGoalResponse res = monthlyGoalService.getGoal(1L, 2026, 4);

        // then
        assertThat(res.year()).isEqualTo(2026);
        assertThat(res.month()).isEqualTo(4);
    }

    @Test
    @DisplayName("존재하지 않는 월간 목표 조회 시 예외 발생")
    void getGoal_notFound_throws() {
        // given
        User user = user();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(monthlyGoalRepository.findByUserIdAndYearAndMonth(1L, 2026, 4)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> monthlyGoalService.getGoal(1L, 2026, 4))
                .isInstanceOf(CustomException.class);
    }

    private User user() {
        User user = User.builder().email("e").password("p").nickname("n").build();
        ReflectionTestUtils.setField(user, "id", 1L);
        return user;
    }
}