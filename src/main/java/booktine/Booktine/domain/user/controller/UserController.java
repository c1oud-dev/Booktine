package booktine.Booktine.domain.user.controller;

import booktine.Booktine.domain.user.dto.SignUpRequest;
import booktine.Booktine.domain.user.dto.UpdateProfileRequest;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.service.UserService;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 사용자 관련 HTTP API 엔드포인트를 제공하는 컨트롤러.
 * D8 인증 연동 전까지는 userId를 RequestParam으로 받아 사용자 기능을 테스트한다.
 */
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping
@Tag(name = "사용자", description = "사용자 관련 API")
public class UserController {

    private final UserService userService;

    /** 회원가입 요청을 처리한다. */
    @Operation(summary = "회원가입", description = "이메일과 비밀번호로 신규 계정을 생성합니다.")
    @PostMapping({"/auth/signup", "/users/signup"})
    public ApiResponse<UserResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ApiResponse.ok(userService.signUp(request));
    }

    /** 이메일 중복 여부를 확인한다. */
    @Operation(summary = "이메일 중복 확인", description = "회원가입 전에 이메일 중복 여부를 확인합니다.")
    @GetMapping("/users/check/email")
    public ApiResponse<Boolean> checkEmail(
            @RequestParam
            @NotBlank(message = "이메일은 필수입니다.")
            @Email(message = "유효한 이메일 형식이 아닙니다.")
            String email
    ) {
        return ApiResponse.ok(userService.isEmailDuplicated(email));
    }

    /** 닉네임 중복 여부를 확인한다. */
    @Operation(summary = "닉네임 중복 확인", description = "회원가입 전에 닉네임 중복 여부를 확인합니다.")
    @GetMapping("/users/check/nickname")
    public ApiResponse<Boolean> checkNickname(
            @RequestParam
            @NotBlank(message = "닉네임은 필수입니다.")
            String nickname
    ) {
        return ApiResponse.ok(userService.isNicknameDuplicated(nickname));
    }

    /** 인증 컨텍스트 기준으로 내 정보를 조회한다. */
    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 내 프로필 정보를 조회합니다.")
    @GetMapping("/users/me")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.ok(userService.getMyInfo(getCurrentUserId()));
    }

    /** 인증 컨텍스트 기준으로 내 프로필을 수정한다. */
    @Operation(summary = "내 정보 수정", description = "로그인한 사용자의 내 프로필 정보를 수정합니다.")
    @PutMapping("/users/me")
    public ApiResponse<UserResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok(userService.updateMyProfile(getCurrentUserId(), request));
    }

    /** 인증 컨텍스트 기준으로 회원탈퇴를 수행한다. */
    @Operation(summary = "회원 탈퇴", description = "로그인한 사용자의 계정을 삭제합니다.")
    @DeleteMapping("/users/me")
    public ApiResponse<Void> deleteMyAccount(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization
    ) {
        userService.deleteMyAccount(getCurrentUserId(), extractBearerToken(authorization));
        return ApiResponse.ok();
    }

    /** 인증 컨텍스트 기준으로 프로필 이미지를 업로드한다. */
    @Operation(summary = "프로필 이미지 업로드", description = "로그인한 사용자의 프로필 이미지를 업로드합니다.")
    @PostMapping("/users/me/image")
    public ApiResponse<UserResponse> uploadMyImage(@RequestParam MultipartFile image) {
        return ApiResponse.ok(userService.uploadMyImage(getCurrentUserId(), image));
    }

    /** 인증 컨텍스트 기준으로 프로필 이미지를 삭제한다. */
    @Operation(summary = "프로필 이미지 삭제", description = "로그인한 사용자의 프로필 이미지를 삭제합니다.")
    @DeleteMapping("/users/me/image")
    public ApiResponse<UserResponse> deleteMyImage() {
        return ApiResponse.ok(userService.deleteMyImage(getCurrentUserId()));
    }

    private Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }

    /** Bearer 문자열에서 실제 JWT 값을 추출한다. */
    private String extractBearerToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        return authorization.substring(7);
    }
}
