package booktine.Booktine.domain.auth.service;

import booktine.Booktine.global.jwt.JwtProperties;
import booktine.Booktine.global.jwt.JwtProvider;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OAuth2LoginSuccessHandlerTest {

    @Mock
    JwtProvider jwtProvider;
    @Mock
    JwtProperties jwtProperties;
    @Mock
    StringRedisTemplate redisTemplate;
    @Mock
    ValueOperations<String, String> valueOperations;
    @Mock
    Authentication authentication;
    @Mock
    OAuth2User oauth2User;

    @Test
    @DisplayName("OAuth2 로그인 성공 시 RT는 HttpOnly 쿠키로, AT만 쿼리 파라미터로 전달")
    void onAuthenticationSuccess_setsRefreshTokenCookieAndRedirectsWithAccessTokenOnly() throws Exception {
        // given
        OAuth2LoginSuccessHandler handler = new OAuth2LoginSuccessHandler(jwtProvider, jwtProperties, redisTemplate);
        ReflectionTestUtils.setField(handler, "oauth2RedirectUrl", "https://booktine.example.com/oauth2/callback");
        given(authentication.getPrincipal()).willReturn(oauth2User);
        given(oauth2User.getAttribute("userId")).willReturn(1L);
        given(jwtProvider.generateAccessToken(1L)).willReturn("access-token");
        given(jwtProvider.generateRefreshToken(1L)).willReturn("refresh-token");
        given(jwtProperties.refreshTokenExpiration()).willReturn(1209600000L);
        given(redisTemplate.opsForValue()).willReturn(valueOperations);

        // when
        MockHttpServletResponse response = new MockHttpServletResponse();
        handler.onAuthenticationSuccess(new MockHttpServletRequest(), response, authentication);

        // then
        verify(valueOperations).set("RT:1", "refresh-token", 1209600000L, TimeUnit.MILLISECONDS);
        assertThat(response.getRedirectedUrl()).isEqualTo("https://booktine.example.com/oauth2/callback?accessToken=access-token");
        assertThat(response.getRedirectedUrl()).doesNotContain("refreshToken");

        Cookie refreshTokenCookie = response.getCookie("refreshToken");
        assertThat(refreshTokenCookie).isNotNull();
        assertThat(refreshTokenCookie.getValue()).isEqualTo("refresh-token");
        assertThat(refreshTokenCookie.isHttpOnly()).isTrue();
        assertThat(refreshTokenCookie.getPath()).isEqualTo("/");
        assertThat(refreshTokenCookie.getMaxAge()).isEqualTo(1209600);
    }
}

