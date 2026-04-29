package booktine.Booktine.domain.user.service;

import booktine.Booktine.domain.user.dto.SignUpRequest;
import booktine.Booktine.domain.user.dto.UpdateProfileRequest;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.domain.user.service.UserService;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

/**
 * UserService 단위 테스트
 * Mockito를 사용하여 UserRepository, BCryptPasswordEncoder를 Mock 처리
 * 실제 DB 연결 없이 서비스 로직만 검증
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Test
    @DisplayName("회원가입 성공")
    void signUp_success() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmail(request.email())).willReturn(false);
        given(userRepository.existsByNickname(request.nickname())).willReturn(false);
        given(passwordEncoder.encode(request.password())).willReturn("encodedPassword");

        User savedUser = User.builder()
                .email(request.email())
                .nickname(request.nickname())
                .password("encodedPassword")
                .build();
        ReflectionTestUtils.setField(savedUser, "id", 1L);
        given(userRepository.save(any(User.class))).willReturn(savedUser);

// when
        UserResponse response = userService.signUp(request);

        // then
        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.nickname()).isEqualTo("테스터");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("이메일 중복 시 예외 발생")
    void signUp_duplicateEmail_throwsException() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmail(request.email())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.signUp(request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_EMAIL);
    }

    @Test
    @DisplayName("닉네임 중복 시 예외 발생")
    void signUp_duplicateNickname_throwsException() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmail(request.email())).willReturn(false);
        given(userRepository.existsByNickname(request.nickname())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.signUp(request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_NICKNAME);
    }

    @Test
    @DisplayName("내 정보 조회 성공")
    void getMyInfo_success() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .nickname("테스터")
                .password("encodedPassword")
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);
        given(userRepository.findById(anyLong())).willReturn(Optional.of(user));

        // when
        UserResponse response = userService.getMyInfo(1L);

        // then
        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.nickname()).isEqualTo("테스터");
    }

    @Test
    @DisplayName("내 정보 수정 성공")
    void updateMyProfile_success() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .nickname("테스터")
                .password("encodedPassword")
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);

        UpdateProfileRequest request = new UpdateProfileRequest("새닉네임", "새자기소개", "password123!");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.password(), user.getPassword())).willReturn(true);
        given(userRepository.existsByNickname(request.nickname())).willReturn(false);

        // when
        UserResponse response = userService.updateMyProfile(1L, request);

        // then
        assertThat(response.nickname()).isEqualTo("새닉네임");
        assertThat(response.aboutMe()).isEqualTo("새자기소개");
    }

    @Test
    @DisplayName("회원탈퇴 성공")
    void deleteMyAccount_success() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);

        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        // when
        userService.deleteMyAccount(1L);

        // then
        verify(userRepository, times(1)).delete(user);
    }
}