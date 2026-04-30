package booktine.Booktine.domain.progress.service;

import booktine.Booktine.domain.progress.dto.AnnualGoalCreateRequest;
import booktine.Booktine.domain.progress.dto.AnnualGoalResponse;
import booktine.Booktine.domain.progress.entity.AnnualGoal;
import booktine.Booktine.domain.progress.repository.AnnualGoalRepository;
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
class AnnualGoalServiceTest {

    @InjectMocks
    AnnualGoalService annualGoalService;
    @Mock
    AnnualGoalRepository annualGoalRepository;
    @Mock
    UserRepository userRepository;

    @Test
    @DisplayName("연간 목표 설정 성공")
    void create_success() {
        // given
        User user = user();
        AnnualGoal goal = AnnualGoal.builder().user(user).year(2026).goalCount(12).build();
        ReflectionTestUtils.setField(goal, "id", 1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(annualGoalRepository.findByUserIdAndYear(1L, 2026)).willReturn(Optional.empty());
        given(annualGoalRepository.save(any())).willReturn(goal);

        // when
        AnnualGoalResponse res = annualGoalService.create(1L, new AnnualGoalCreateRequest(2026, 12));

        // then
        assertThat(res.goalCount()).isEqualTo(12);
        assertThat(res.year()).isEqualTo(2026);
    }

    @Test
    @DisplayName("이미 존재하는 연도에 연간 목표 설정 시 예외 발생")
    void create_duplicate_throws() {
        // given
        User user = user();
        AnnualGoal existing = AnnualGoal.builder().user(user).year(2026).goalCount(12).build();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(annualGoalRepository.findByUserIdAndYear(1L, 2026)).willReturn(Optional.of(existing));

        // when & then
        assertThatThrownBy(() -> annualGoalService.create(1L, new AnnualGoalCreateRequest(2026, 12)))
                .isInstanceOf(CustomException.class);
    }

    @Test
    @DisplayName("연간 목표 조회 성공")
    void getGoal_success() {
        // given
        User user = user();
        AnnualGoal goal = AnnualGoal.builder().user(user).year(2026).goalCount(12).build();
        ReflectionTestUtils.setField(goal, "id", 1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(annualGoalRepository.findByUserIdAndYear(1L, 2026)).willReturn(Optional.of(goal));

        // when
        AnnualGoalResponse res = annualGoalService.getGoal(1L, 2026);

        // then
        assertThat(res.year()).isEqualTo(2026);
        assertThat(res.goalCount()).isEqualTo(12);
    }

    @Test
    @DisplayName("존재하지 않는 연간 목표 조회 시 예외 발생")
    void getGoal_notFound_throws() {
        // given
        User user = user();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(annualGoalRepository.findByUserIdAndYear(1L, 2026)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> annualGoalService.getGoal(1L, 2026))
                .isInstanceOf(CustomException.class);
    }

    private User user() {
        User user = User.builder().email("e").password("p").nickname("n").build();
        ReflectionTestUtils.setField(user, "id", 1L);
        return user;
    }
}