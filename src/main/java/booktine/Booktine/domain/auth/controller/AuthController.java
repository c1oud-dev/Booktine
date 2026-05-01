package booktine.Booktine.domain.auth.controller;

import booktine.Booktine.domain.auth.dto.LoginRequest;
import booktine.Booktine.domain.auth.dto.PasswordResetRequest;
import booktine.Booktine.domain.auth.dto.TokenResponse;
import booktine.Booktine.domain.auth.service.AuthService;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.response.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 관련 HTTP 요청을 처리하는 컨트롤러.
 * 로그인/로그아웃/토큰 재발급/비밀번호 재설정 API를 제공한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    /** 로그인 성공 시 AT는 응답 바디로, RT는 HttpOnly 쿠키로 내려준다. */
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthService.LoginResult result = authService.login(request);
        response.addCookie(buildRefreshTokenCookie(result.refreshToken()));
        return ApiResponse.ok(result.tokenResponse());
    }

    /** Authorization 헤더의 AT를 기반으로 로그아웃 처리한다. */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                    HttpServletResponse response) {
        authService.logout(extractBearerToken(authorization));
        response.addCookie(expireRefreshTokenCookie());
        return ApiResponse.ok();
    }

    /** RT 쿠키를 검증하여 새로운 AT를 발급한다. */
    @PostMapping("/reissue")
    public ApiResponse<TokenResponse> reissue(HttpServletRequest request) {
        return ApiResponse.ok(authService.reissueAccessToken(extractRefreshTokenFromCookie(request)));
    }

    /** Authorization 헤더의 AT를 검증한 뒤 비밀번호를 재설정한다. */
    @PostMapping("/password")
    public ApiResponse<Void> resetPassword(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                           @Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(extractBearerToken(authorization), request.currentPassword(), request.newPassword());
        return ApiResponse.ok();
    }

    /** Bearer 문자열에서 실제 JWT 값을 추출한다. */
    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) throw new CustomException(ErrorCode.UNAUTHORIZED);
        return authorization.substring(7);
    }

    /** 쿠키 목록에서 refreshToken 값을 추출한다. */
    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) throw new CustomException(ErrorCode.UNAUTHORIZED);
        for (Cookie cookie : cookies) if ("refreshToken".equals(cookie.getName())) return cookie.getValue();
        throw new CustomException(ErrorCode.UNAUTHORIZED);
    }

    /** refreshToken HttpOnly 쿠키를 생성한다. */
    private Cookie buildRefreshTokenCookie(String refreshToken) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        return cookie;
    }

    /** refreshToken 쿠키 만료 처리를 위한 쿠키를 생성한다. */
    private Cookie expireRefreshTokenCookie() {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;
    }
}

