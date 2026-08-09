package booktine.Booktine.domain.auth.service;

import booktine.Booktine.domain.auth.dto.EmailSendRequest;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;

/**
 * AuthService 단위 테스트.
 * 인증 관련 유스케이스(로그인, 토큰 재발급, 이메일 인증)에 대한 서비스 로직을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    private static final String EMAIL = "user@test.com";

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
        LoginRequest request = new LoginRequest("test@test.com", "pw", false);
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
        LoginRequest request = new LoginRequest("test@test.com", "pw", false);
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
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("EMAIL_CODE:SIGNUP:test@test.com")).willReturn("123456");
        given(valueOperations.get("EMAIL_VERIFY_ATTEMPT:SIGNUP:test@test.com")).willReturn(null);

        // when
        authService.verifyEmailCode(new EmailVerifyRequest("test@test.com", "SIGNUP", "123456"));

        // then
        org.mockito.Mockito.verify(valueOperations).set("EMAIL_VERIFIED:SIGNUP:test@test.com", "true", 10L, java.util.concurrent.TimeUnit.MINUTES);
    }

    @Test
    @DisplayName("로그인 잠금 상태이면 예외가 발생한다")
    void login_locked_throwsException() {
        // given
        LoginRequest request = new LoginRequest(EMAIL, "password", false);
        given(redisTemplate.hasKey("LOGIN_LOCK:" + EMAIL)).willReturn(true);

        // when & then
        assertCustomException(
                () -> authService.login(request),
                ErrorCode.LOGIN_ATTEMPT_EXCEEDED
        );
    }

    @Test
    @DisplayName("로컬 사용자가 없으면 로그인 시 예외가 발생한다")
    void login_userNotFound_throwsException() {
        // given
        LoginRequest request = new LoginRequest(EMAIL, "password", false);
        given(redisTemplate.hasKey("LOGIN_LOCK:" + EMAIL)).willReturn(false);
        given(userRepository.findByEmailAndAuthProvider(
                EMAIL,
                UserAuthProvider.LOCAL
        )).willReturn(Optional.empty());

        // when & then
        assertCustomException(
                () -> authService.login(request),
                ErrorCode.USER_NOT_FOUND
        );
    }

    @Test
    @DisplayName("비밀번호가 틀리면 실패 횟수를 증가시키고 예외가 발생한다")
    void login_invalidPassword_throwsException() {
        // given
        LoginRequest request = new LoginRequest(EMAIL, "wrong", false);
        User user = createUser(1L, true);
        given(redisTemplate.hasKey("LOGIN_LOCK:" + EMAIL)).willReturn(false);
        given(userRepository.findByEmailAndAuthProvider(
                EMAIL,
                UserAuthProvider.LOCAL
        )).willReturn(Optional.of(user));
        given(passwordEncoder.matches("wrong", "encoded-password"))
                .willReturn(false);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.increment("LOGIN_FAIL:" + EMAIL)).willReturn(5L);

        // when & then
        assertCustomException(
                () -> authService.login(request),
                ErrorCode.INVALID_PASSWORD
        );
        then(valueOperations).should().set(
                "LOGIN_LOCK:" + EMAIL,
                "LOCKED",
                15L,
                TimeUnit.MINUTES
        );
    }

    @Test
    @DisplayName("운영 환경에서는 이메일 인증 코드를 저장하고 메일을 발송한다")
    void sendEmailCode_prod_success() {
        // given
        ReflectionTestUtils.setField(authService, "activeProfile", "prod");
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        EmailSendRequest request = new EmailSendRequest(EMAIL, "SIGNUP");
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(
                SimpleMailMessage.class
        );

        // when
        authService.sendEmailCode(request);

        // then
        then(valueOperations).should().set(
                org.mockito.ArgumentMatchers.eq("EMAIL_CODE:SIGNUP:" + EMAIL),
                org.mockito.ArgumentMatchers.matches("\\d{6}"),
                org.mockito.ArgumentMatchers.eq(5L),
                org.mockito.ArgumentMatchers.eq(TimeUnit.MINUTES)
        );
        then(javaMailSender).should().send(messageCaptor.capture());
        assertThat(messageCaptor.getValue().getTo()).containsExactly(EMAIL);
        assertThat(messageCaptor.getValue().getSubject())
                .isEqualTo("[Booktine] 이메일 인증 코드");
    }

    @Test
    @DisplayName("회원가입 외 이메일 인증에 성공하면 사용자를 인증 상태로 변경한다")
    void verifyEmailCode_otherPurpose_success() {
        // given
        User user = createUser(1L, false);
        prepareEmailVerification("PASSWORD_RESET", "123456", null);
        given(userRepository.findByEmailAndAuthProvider(
                EMAIL,
                UserAuthProvider.LOCAL
        )).willReturn(Optional.of(user));
        EmailVerifyRequest request = new EmailVerifyRequest(
                EMAIL,
                "PASSWORD_RESET",
                "123456"
        );

        // when
        authService.verifyEmailCode(request);

        // then
        assertThat(user.isEmailVerified()).isTrue();
    }

    @Test
    @DisplayName("이메일 인증 시도 횟수를 초과하면 예외가 발생한다")
    void verifyEmailCode_attemptExceeded_throwsException() {
        // given
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("EMAIL_VERIFY_ATTEMPT:SIGNUP:" + EMAIL))
                .willReturn("5");
        EmailVerifyRequest request = new EmailVerifyRequest(
                EMAIL,
                "SIGNUP",
                "123456"
        );

        // when & then
        assertCustomException(
                () -> authService.verifyEmailCode(request),
                ErrorCode.EMAIL_VERIFY_ATTEMPT_EXCEEDED
        );
    }

    @Test
    @DisplayName("이메일 인증 코드가 만료되면 예외가 발생한다")
    void verifyEmailCode_expired_throwsException() {
        // given
        prepareEmailVerification("SIGNUP", null, null);
        EmailVerifyRequest request = new EmailVerifyRequest(
                EMAIL,
                "SIGNUP",
                "123456"
        );

        // when & then
        assertCustomException(
                () -> authService.verifyEmailCode(request),
                ErrorCode.EMAIL_CODE_EXPIRED
        );
    }

    @Test
    @DisplayName("이메일 인증 코드가 다르면 시도 횟수를 증가시키고 예외가 발생한다")
    void verifyEmailCode_mismatch_throwsException() {
        // given
        prepareEmailVerification("SIGNUP", "654321", null);
        given(valueOperations.increment("EMAIL_VERIFY_ATTEMPT:SIGNUP:" + EMAIL))
                .willReturn(1L);
        EmailVerifyRequest request = new EmailVerifyRequest(
                EMAIL,
                "SIGNUP",
                "123456"
        );

        // when & then
        assertCustomException(
                () -> authService.verifyEmailCode(request),
                ErrorCode.EMAIL_CODE_MISMATCH
        );
        then(redisTemplate).should().expire(
                "EMAIL_VERIFY_ATTEMPT:SIGNUP:" + EMAIL,
                10L,
                TimeUnit.MINUTES
        );
    }

    @Test
    @DisplayName("회원가입 외 이메일 인증에서 사용자가 없으면 예외가 발생한다")
    void verifyEmailCode_userNotFound_throwsException() {
        // given
        prepareEmailVerification("PASSWORD_RESET", "123456", null);
        given(userRepository.findByEmailAndAuthProvider(
                EMAIL,
                UserAuthProvider.LOCAL
        )).willReturn(Optional.empty());
        EmailVerifyRequest request = new EmailVerifyRequest(
                EMAIL,
                "PASSWORD_RESET",
                "123456"
        );

        // when & then
        assertCustomException(
                () -> authService.verifyEmailCode(request),
                ErrorCode.USER_NOT_FOUND
        );
    }

    @Test
    @DisplayName("이메일 인증 코드로 비밀번호를 재설정한다")
    void resetPasswordByEmail_success() {
        // given
        User user = createUser(1L, true);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("EMAIL_CODE:PASSWORD_RESET:" + EMAIL))
                .willReturn("123456");
        given(userRepository.findByEmailAndAuthProvider(
                EMAIL,
                UserAuthProvider.LOCAL
        )).willReturn(Optional.of(user));
        given(passwordEncoder.encode("new-password")).willReturn("new-encoded");

        // when
        authService.resetPasswordByEmail(EMAIL, "123456", "new-password");

        // then
        assertThat(user.getPassword()).isEqualTo("new-encoded");
        then(redisTemplate).should().delete(
                "EMAIL_CODE:PASSWORD_RESET:" + EMAIL
        );
    }

    @Test
    @DisplayName("이메일 비밀번호 재설정에서 코드가 만료되면 예외가 발생한다")
    void resetPasswordByEmail_expired_throwsException() {
        // given
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("EMAIL_CODE:PASSWORD_RESET:" + EMAIL))
                .willReturn(null);

        // when & then
        assertCustomException(
                () -> authService.resetPasswordByEmail(
                        EMAIL,
                        "123456",
                        "new-password"
                ),
                ErrorCode.EMAIL_CODE_EXPIRED
        );
    }

    @Test
    @DisplayName("이메일 비밀번호 재설정에서 코드가 다르면 예외가 발생한다")
    void resetPasswordByEmail_mismatch_throwsException() {
        // given
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("EMAIL_CODE:PASSWORD_RESET:" + EMAIL))
                .willReturn("654321");
        given(valueOperations.increment(
                "EMAIL_VERIFY_ATTEMPT:PASSWORD_RESET:" + EMAIL
        )).willReturn(2L);

        // when & then
        assertCustomException(
                () -> authService.resetPasswordByEmail(
                        EMAIL,
                        "123456",
                        "new-password"
                ),
                ErrorCode.EMAIL_CODE_MISMATCH
        );
    }

    @Test
    @DisplayName("이메일 비밀번호 재설정에서 사용자가 없으면 예외가 발생한다")
    void resetPasswordByEmail_userNotFound_throwsException() {
        // given
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get("EMAIL_CODE:PASSWORD_RESET:" + EMAIL))
                .willReturn("123456");
        given(userRepository.findByEmailAndAuthProvider(
                EMAIL,
                UserAuthProvider.LOCAL
        )).willReturn(Optional.empty());

        // when & then
        assertCustomException(
                () -> authService.resetPasswordByEmail(
                        EMAIL,
                        "123456",
                        "new-password"
                ),
                ErrorCode.USER_NOT_FOUND
        );
    }

    @Test
    @DisplayName("로그아웃하면 토큰을 폐기한다")
    void logout_success() {
        // given
        String accessToken = "access-token";
        given(jwtProvider.getUserId(accessToken)).willReturn(1L);
        given(jwtProvider.getExpiration(accessToken))
                .willReturn(System.currentTimeMillis() + 60_000L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);

        // when
        authService.logout(accessToken);

        // then
        then(jwtProvider).should().validateToken(accessToken);
        then(redisTemplate).should().delete("RT:1");
        then(valueOperations).should().set(
                org.mockito.ArgumentMatchers.eq("BL:" + accessToken),
                org.mockito.ArgumentMatchers.eq("logout"),
                org.mockito.ArgumentMatchers.longThat(ttl -> ttl > 0L),
                org.mockito.ArgumentMatchers.eq(TimeUnit.MILLISECONDS)
        );
    }

    @Test
    @DisplayName("접근 토큰 없이 사용자 토큰을 폐기하면 리프레시 토큰만 삭제한다")
    void revokeUserTokens_withoutAccessToken_success() {
        // given
        Long userId = 1L;

        // when
        authService.revokeUserTokens(userId, " ", "withdrawal");

        // then
        then(redisTemplate).should().delete("RT:1");
        then(redisTemplate).should(never()).opsForValue();
    }

    @Test
    @DisplayName("만료된 접근 토큰을 폐기하면 블랙리스트에 저장하지 않는다")
    void revokeUserTokens_expiredAccessToken_success() {
        // given
        String accessToken = "expired-token";
        given(jwtProvider.getExpiration(accessToken))
                .willReturn(System.currentTimeMillis() - 1_000L);

        // when
        authService.revokeUserTokens(1L, accessToken, "withdrawal");

        // then
        then(redisTemplate).should().delete("RT:1");
        then(redisTemplate).should(never()).opsForValue();
    }

    @Test
    @DisplayName("저장된 리프레시 토큰이 없으면 재발급 시 예외가 발생한다")
    void reissueAccessToken_missingToken_throwsException() {
        // given
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(jwtProvider.getUserId("refresh-token")).willReturn(1L);
        given(valueOperations.get("RT:1")).willReturn(null);

        // when & then
        assertCustomException(
                () -> authService.reissueAccessToken("refresh-token"),
                ErrorCode.UNAUTHORIZED
        );
    }

    @Test
    @DisplayName("저장된 리프레시 토큰과 다르면 재발급 시 예외가 발생한다")
    void reissueAccessToken_mismatch_throwsException() {
        // given
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(jwtProvider.getUserId("refresh-token")).willReturn(1L);
        given(valueOperations.get("RT:1")).willReturn("other-token");

        // when & then
        assertCustomException(
                () -> authService.reissueAccessToken("refresh-token"),
                ErrorCode.UNAUTHORIZED
        );
    }

    @Test
    @DisplayName("현재 비밀번호가 일치하면 새 비밀번호로 변경한다")
    void resetPassword_success() {
        // given
        User user = createUser(1L, true);
        given(jwtProvider.getUserId("access-token")).willReturn(1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(passwordEncoder.matches("current", "encoded-password"))
                .willReturn(true);
        given(passwordEncoder.encode("new-password")).willReturn("new-encoded");

        // when
        authService.resetPassword("access-token", "current", "new-password");

        // then
        assertThat(user.getPassword()).isEqualTo("new-encoded");
        then(jwtProvider).should().validateToken("access-token");
    }

    @Test
    @DisplayName("접근 토큰의 사용자가 없으면 비밀번호 변경 시 예외가 발생한다")
    void resetPassword_userNotFound_throwsException() {
        // given
        given(jwtProvider.getUserId("access-token")).willReturn(1L);
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertCustomException(
                () -> authService.resetPassword(
                        "access-token",
                        "current",
                        "new-password"
                ),
                ErrorCode.USER_NOT_FOUND
        );
    }

    @Test
    @DisplayName("현재 비밀번호가 다르면 비밀번호 변경 시 예외가 발생한다")
    void resetPassword_invalidPassword_throwsException() {
        // given
        User user = createUser(1L, true);
        given(jwtProvider.getUserId("access-token")).willReturn(1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(passwordEncoder.matches("wrong", "encoded-password"))
                .willReturn(false);

        // when & then
        assertCustomException(
                () -> authService.resetPassword(
                        "access-token",
                        "wrong",
                        "new-password"
                ),
                ErrorCode.INVALID_PASSWORD
        );
    }

    @Test
    @DisplayName("회원가입 이메일 인증 완료 여부를 조회한다")
    void isSignupEmailVerified_success() {
        // given
        given(redisTemplate.hasKey("EMAIL_VERIFIED:SIGNUP:" + EMAIL))
                .willReturn(true);

        // when
        boolean result = authService.isSignupEmailVerified(EMAIL);

        // then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("회원가입 완료 후 이메일 인증 마커를 제거한다")
    void consumeSignupEmailVerification_success() {
        // given
        String email = EMAIL;

        // when
        authService.consumeSignupEmailVerification(email);

        // then
        then(redisTemplate).should().delete("EMAIL_VERIFIED:SIGNUP:" + EMAIL);
    }

    private void prepareEmailVerification(
            String purpose,
            String savedCode,
            String attemptCount
    ) {
        given(redisTemplate.opsForValue()).willReturn(valueOperations);
        given(valueOperations.get(
                "EMAIL_VERIFY_ATTEMPT:" + purpose + ":" + EMAIL
        )).willReturn(attemptCount);
        given(valueOperations.get("EMAIL_CODE:" + purpose + ":" + EMAIL))
                .willReturn(savedCode);
    }

    private User createUser(Long id, boolean emailVerified) {
        User user = User.builder()
                .email(EMAIL)
                .password("encoded-password")
                .nickname("사용자")
                .emailVerified(emailVerified)
                .authProvider(UserAuthProvider.LOCAL)
                .build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private void assertCustomException(Runnable action, ErrorCode errorCode) {
        assertThatThrownBy(action::run)
                .isInstanceOf(CustomException.class)
                .extracting("errorCode")
                .isEqualTo(errorCode);
    }
}