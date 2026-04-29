package booktine.Booktine.domain.user.controller;

import booktine.Booktine.domain.user.dto.SignUpRequest;
import booktine.Booktine.domain.user.dto.UpdateProfileRequest;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.service.UserService;
import booktine.Booktine.global.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 관련 HTTP API 엔드포인트를 제공하는 컨트롤러.
 * D8 인증 연동 전까지는 userId를 RequestParam으로 받아 사용자 기능을 테스트한다.
 */
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping
public class UserController {

    private final UserService userService;

    /**
     * 회원가입 요청을 처리한다.
     */
    @PostMapping("/auth/signup")
    public ApiResponse<UserResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ApiResponse.ok(userService.signUp(request));
    }

    /**
     * 이메일 중복 여부를 확인한다.
     */
    @GetMapping("/users/check/email")
    public ApiResponse<Boolean> checkEmail(
            @RequestParam
            @NotBlank(message = "이메일은 필수입니다.")
            @Email(message = "유효한 이메일 형식이 아닙니다.")
            String email
    ) {
        return ApiResponse.ok(userService.isEmailDuplicated(email));
    }

    /**
     * 닉네임 중복 여부를 확인한다.
     */
    @GetMapping("/users/check/nickname")
    public ApiResponse<Boolean> checkNickname(
            @RequestParam
            @NotBlank(message = "닉네임은 필수입니다.")
            String nickname
    ) {
        return ApiResponse.ok(userService.isNicknameDuplicated(nickname));
    }

    /**
     * 사용자 ID 기준으로 내 정보를 조회한다.
     */
    @GetMapping("/users/me")
    public ApiResponse<UserResponse> getMyInfo(@RequestParam Long userId) {
        return ApiResponse.ok(userService.getMyInfo(userId));
    }

    /**
     * 사용자 ID 기준으로 내 프로필을 수정한다.
     */
    @PutMapping("/users/me")
    public ApiResponse<UserResponse> updateMyProfile(
            @RequestParam Long userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ApiResponse.ok(userService.updateMyProfile(userId, request));
    }

    /**
     * 사용자 ID 기준으로 회원탈퇴를 수행한다.
     */
    @DeleteMapping("/users/me")
    public ApiResponse<Void> deleteMyAccount(@RequestParam Long userId) {
        userService.deleteMyAccount(userId);
        return ApiResponse.ok();
    }
}
