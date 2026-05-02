package booktine.Booktine.domain.auth.service;

import booktine.Booktine.domain.auth.dto.EmailVerifyRequest;
import booktine.Booktine.domain.auth.dto.LoginRequest;
import booktine.Booktine.domain.auth.dto.TokenResponse;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserAuthProvider;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.jwt.JwtProperties;
import booktine.Booktine.global.jwt.JwtProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

/**
 * AuthService 단위 테스트.
 * 인증 관련 유스케이스(로그인, 토큰 재발급, 이메일 인증)에 대한 서비스 로직을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @InjectMocks private AuthService authService;
    @Mock private UserRepository userRepository;
    @Mock private BCryptPasswordEncoder passwordEncoder;
    @Mock private JwtProvider jwtProvider;
    @Mock private JwtProperties jwtProperties;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;
    @Mock private JavaMailSender javaMailSender;

    /**
     * 로컬 계정 로그인 성공 시 Access Token이 정상 반환되는지 검증한다.
     */
    @Test
    @DisplayName("로그인 성공")
    void login_success() {
        // given
        LoginRequest request = new LoginRequest("test@test.com", "pw");
        User user = User.builder().email("test@test.com").password("encoded").nickname("n")
                .emailVerified(true).authProvider(UserAuthProvider.LOCAL).providerId(null).build();
        ReflectionTestUtils.setField(user, "id", 1L);
        given(userRepository.findByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.password(), user.getPassword())).willReturn(true);
        given(jwtProvider.generateAccessToken(1L)).willReturn("at");
        given(jwtProvider.generateRefreshToken(1L)).willReturn("rt");
        given(jwtProperties.refreshTokenExpiration()).willReturn(1000L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);

        // when
        AuthService.LoginResult result = authService.login(request);

        // then
        assertThat(result.refreshToken()).isEqualTo("rt");
    }

    /**
     * 이메일 미인증 계정 로그인 시 차단되는지 검증한다.
     */
    @Test
    @DisplayName("이메일 미인증 사용자 로그인 차단")
    void login_fail_unverified_user() {
        // given
        LoginRequest request = new LoginRequest("test@test.com", "pw");
        User user = User.builder().email("test@test.com").password("encoded").nickname("n")
                .emailVerified(false).authProvider(UserAuthProvider.LOCAL).providerId(null).build();
        given(userRepository.findByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.password(), user.getPassword())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_VERIFIED);
    }

    /**
     * 유효한 Refresh Token으로 Access Token 재발급이 가능한지 검증한다.
     */
    @Test
    @DisplayName("토큰 재발급 성공")
    void reissue_success() {
        // given
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(jwtProvider.getUserId("rt")).willReturn(1L);
        given(valueOperations.get("RT:1")).willReturn("rt");
        given(jwtProvider.generateAccessToken(1L)).willReturn("new-at");

        // when
        TokenResponse response = authService.reissueAccessToken("rt");

        // then
        assertThat(response.accessToken()).isEqualTo("new-at");
    }

    /**
     * 회원가입 목적 이메일 인증 코드 검증 시 계정이 활성화되는지 검증한다.
     */
    @Test
    @DisplayName("회원가입 이메일 인증 코드 검증 시 계정 활성화")
    void verifyEmailCode_signup_success() {
        // given
        User user = User.builder().email("test@test.com").password("encoded").nickname("n")
                .emailVerified(false).authProvider(UserAuthProvider.LOCAL).providerId(null).build();
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("EMAIL_CODE:SIGNUP:test@test.com")).willReturn("123456");
        given(userRepository.findByEmailAndAuthProvider("test@test.com", UserAuthProvider.LOCAL)).willReturn(Optional.of(user));

        // when
        authService.verifyEmailCode(new EmailVerifyRequest("test@test.com", "SIGNUP", "123456"));

        // then
        assertThat(user.isEmailVerified()).isTrue();
    }
}