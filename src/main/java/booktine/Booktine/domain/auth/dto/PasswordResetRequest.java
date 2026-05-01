package booktine.Booktine.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 비밀번호 재설정 요청 바디를 표현하는 DTO.
 * AuthController의 /auth/password 엔드포인트에서 사용된다.
 */
public record PasswordResetRequest(
        @NotBlank(message = "현재 비밀번호는 필수입니다.")
        String currentPassword,
        @NotBlank(message = "새 비밀번호는 필수입니다.")
        String newPassword
) {
}