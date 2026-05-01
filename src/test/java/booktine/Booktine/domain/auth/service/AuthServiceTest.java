package booktine.Booktine.domain.auth.service;

import booktine.Booktine.domain.auth.dto.LoginRequest;
import booktine.Booktine.domain.auth.dto.TokenResponse;
import booktine.Booktine.domain.user.entity.User;
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @InjectMocks private AuthService authService;
    @Mock private UserRepository userRepository;
    @Mock private BCryptPasswordEncoder passwordEncoder;
    @Mock private JwtProvider jwtProvider;
    @Mock private JwtProperties jwtProperties;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;

    @Test
    @DisplayName("로그인 성공")
    void login_success() {
        // given
        LoginRequest request = new LoginRequest("test@test.com", "pw");
        User user = User.builder().email("test@test.com").password("encoded").nickname("n").build();
        ReflectionTestUtils.setField(user, "id", 1L);
        given(userRepository.findByEmail(request.email())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.password(), user.getPassword())).willReturn(true);
        given(jwtProvider.generateAccessToken(1L)).willReturn("at");
        given(jwtProvider.generateRefreshToken(1L)).willReturn("rt");
        given(jwtProperties.refreshTokenExpiration()).willReturn(1000L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);

        // when
        AuthService.LoginResult result = authService.login(request);

        // then
        assertThat(result.tokenResponse().accessToken()).isEqualTo("at");
    }

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

    @Test
    @DisplayName("현재 비밀번호 불일치 시 예외")
    void resetPassword_fail() {
        // given
        User user = User.builder().email("test@test.com").password("encoded").nickname("n").build();
        ReflectionTestUtils.setField(user, "id", 1L);
        given(jwtProvider.getUserId("at")).willReturn(1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(passwordEncoder.matches("wrong", "encoded")).willReturn(false);

        // when & then
        assertThatThrownBy(() -> authService.resetPassword("at", "wrong", "new"))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_PASSWORD);
    }
}

