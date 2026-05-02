package booktine.Booktine.domain.auth.controller;

import booktine.Booktine.domain.auth.dto.*;
import booktine.Booktine.domain.auth.service.AuthService;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 관련 HTTP 요청을 처리하는 컨트롤러.
 * 로그인/로그아웃/토큰 재발급/이메일 인증/비밀번호 재설정 API를 제공한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@Tag(name = "인증", description = "인증 관련 API")
public class AuthController {
    private final AuthService authService;

    /** 로그인 성공 시 AT는 응답 바디로, RT는 HttpOnly 쿠키로 내려준다. */
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하고 액세스 토큰을 발급합니다.")
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthService.LoginResult result = authService.login(request);
        response.addCookie(buildRefreshTokenCookie(result.refreshToken()));
        return ApiResponse.ok(result.tokenResponse());
    }

    /** 이메일 인증 코드를 발송한다. */
    @Operation(summary = "이메일 인증 코드 발송", description = "입력한 이메일 주소로 회원가입/인증용 코드를 발송합니다.")
    @PostMapping("/email/send")
    public ApiResponse<Void> sendEmailCode(@Valid @RequestBody EmailSendRequest request) {
        authService.sendEmailCode(request);
        return ApiResponse.ok();
    }

    /** 이메일 인증 코드를 검증하고 계정을 활성화한다. */
    @Operation(summary = "이메일 인증 코드 검증", description = "이메일로 받은 인증 코드를 검증하여 인증 상태를 갱신합니다.")
    @PostMapping("/email/verify")
    public ApiResponse<Void> verifyEmailCode(@Valid @RequestBody EmailVerifyRequest request) {
        authService.verifyEmailCode(request);
        return ApiResponse.ok();
    }

    /** 이메일 인증 코드 검증 기반으로 비밀번호를 재설정한다. */
    @Operation(summary = "이메일 기반 비밀번호 재설정", description = "이메일 인증 코드 확인 후 비밀번호를 재설정합니다.")
    @PostMapping("/password/reset")
    public ApiResponse<Void> resetPasswordByEmail(@Valid @RequestBody PasswordResetByEmailRequest request) {
        authService.resetPasswordByEmail(request.email(), request.code(), request.newPassword());
        return ApiResponse.ok();
    }

    /** Authorization 헤더의 AT를 기반으로 로그아웃 처리한다. */
    @Operation(summary = "로그아웃", description = "현재 액세스 토큰을 무효화하고 리프레시 토큰 쿠키를 제거합니다.")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                    HttpServletResponse response) {
        authService.logout(extractBearerToken(authorization));
        response.addCookie(expireRefreshTokenCookie());
        return ApiResponse.ok();
    }

    /** RT 쿠키를 검증하여 새로운 AT를 발급한다. */
    @Operation(summary = "액세스 토큰 재발급", description = "리프레시 토큰 쿠키를 검증해 새 액세스 토큰을 발급합니다.")
    @PostMapping("/reissue")
    public ApiResponse<TokenResponse> reissue(HttpServletRequest request) {
        return ApiResponse.ok(authService.reissueAccessToken(extractRefreshTokenFromCookie(request)));
    }

    /** Authorization 헤더의 AT를 검증한 뒤 비밀번호를 재설정한다. */
    @Operation(summary = "비밀번호 변경", description = "현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.")
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