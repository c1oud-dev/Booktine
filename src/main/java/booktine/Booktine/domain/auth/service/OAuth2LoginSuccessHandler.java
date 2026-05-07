package booktine.Booktine.domain.auth.service;

import booktine.Booktine.global.jwt.JwtProperties;
import booktine.Booktine.global.jwt.JwtProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * OAuth2 로그인 성공 시 JWT를 발급하고 프론트엔드 Redirect URL로 토큰을 전달하는 핸들러.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private static final String RT_PREFIX = "RT:";

    private final JwtProvider jwtProvider;
    private final JwtProperties jwtProperties;
    private final StringRedisTemplate redisTemplate;
    @Value("${app.oauth2.redirect-url}")
    private String oauth2RedirectUrl;

    /**
     * 인증된 사용자 식별자로 AT/RT를 발급하고 RT는 HttpOnly 쿠키, AT는 query parameter로 전달한다.
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        Long userId = Long.valueOf(String.valueOf(principal.getAttribute("userId")));
        String accessToken = jwtProvider.generateAccessToken(userId);
        String refreshToken = jwtProvider.generateRefreshToken(userId);
        redisTemplate.opsForValue().set(RT_PREFIX + userId, refreshToken, jwtProperties.refreshTokenExpiration(), TimeUnit.MILLISECONDS);
        response.addCookie(buildRefreshTokenCookie(refreshToken, jwtProperties.refreshTokenExpiration()));

        String redirectUrl = UriComponentsBuilder.fromUriString(oauth2RedirectUrl)
                .queryParam("accessToken", accessToken)
                .build().toUriString();
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    /** 일반 로그인과 동일한 refreshToken HttpOnly 쿠키를 생성한다. */
    private Cookie buildRefreshTokenCookie(String refreshToken, long maxAgeMillis) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) Math.min(maxAgeMillis / 1000, Integer.MAX_VALUE));
        return cookie;
    }
}

