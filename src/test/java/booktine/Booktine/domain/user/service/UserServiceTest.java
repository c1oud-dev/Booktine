package booktine.Booktine.domain.user.service;

import booktine.Booktine.domain.user.dto.SignUpRequest;
import booktine.Booktine.domain.user.dto.UpdateProfileRequest;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserAuthProvider;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.s3.S3Service;
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
 * Mockito를 사용해 UserRepository, BCryptPasswordEncoder, S3Service를 Mock 처리하고
 * 사용자 도메인 서비스의 핵심 비즈니스 로직을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private S3Service s3Service;

    /**
     * 회원가입 시 중복 검증과 저장이 정상 처리되는지 검증한다.
     */
    @Test
    @DisplayName("회원가입 성공")
    void signUp_success() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(false);
        given(userRepository.existsByNickname(request.nickname())).willReturn(false);
        given(passwordEncoder.encode(request.password())).willReturn("encodedPassword");

        User savedUser = User.builder()
                .email(request.email())
                .nickname(request.nickname())
                .password("encodedPassword")
                .emailVerified(false)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
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
    @DisplayName("회원가입 닉네임 미전달 시 이메일 로컬 파트를 기본 닉네임으로 사용")
    void signUp_withoutNickname_usesEmailLocalPart() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", null, "password123!");
        given(userRepository.existsByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(false);
        given(userRepository.existsByNickname("test")).willReturn(false);
        given(passwordEncoder.encode(request.password())).willReturn("encodedPassword");

        User savedUser = User.builder()
                .email(request.email())
                .nickname("test")
                .password("encodedPassword")
                .emailVerified(false)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();
        ReflectionTestUtils.setField(savedUser, "id", 2L);
        given(userRepository.save(any(User.class))).willReturn(savedUser);

        // when
        UserResponse response = userService.signUp(request);

        // then
        assertThat(response.nickname()).isEqualTo("test");
        verify(userRepository, times(1)).save(any(User.class));
    }

    /**
     * 회원가입 시 로컬 계정 이메일이 중복되면 예외가 발생하는지 검증한다.
     */
    @Test
    @DisplayName("이메일 중복 시 예외 발생")
    void signUp_duplicateEmail_throwsException() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.signUp(request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_EMAIL);
    }

    /**
     * 회원가입 시 닉네임이 중복되면 예외가 발생하는지 검증한다.
     */
    @Test
    @DisplayName("닉네임 중복 시 예외 발생")
    void signUp_duplicateNickname_throwsException() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(false);
        given(userRepository.existsByNickname(request.nickname())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.signUp(request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_NICKNAME);
    }

    /**
     * 사용자 식별자로 내 정보를 조회할 수 있는지 검증한다.
     */
    @Test
    @DisplayName("내 정보 조회 성공")
    void getMyInfo_success() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .nickname("테스터")
                .password("encodedPassword")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        // when
        UserResponse response = userService.getMyInfo(1L);

        // then
        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.nickname()).isEqualTo("테스터");
    }

    /**
     * 비밀번호 검증 후 프로필 수정이 정상 반영되는지 검증한다.
     */
    @Test
    @DisplayName("내 정보 수정 성공")
    void updateMyProfile_success() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .nickname("테스터")
                .password("encodedPassword")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
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

    /**
     * 사용자 탈퇴 시 사용자 삭제가 수행되는지 검증한다.
     */
    @Test
    @DisplayName("회원탈퇴 성공")
    void deleteMyAccount_success() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .password("encodedPassword")
                .nickname("테스터")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);

        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        // when
        userService.deleteMyAccount(1L);

        // then
        verify(userRepository, times(1)).delete(user);
    }
}