package booktine.Booktine.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 이메일 인증 코드 기반 비밀번호 재설정 요청 DTO.
 * 이메일과 인증 코드 검증 후 새 비밀번호로 재설정할 때 사용한다.
 */
public record PasswordResetByEmailRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "유효한 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "인증 코드는 필수입니다.")
        @Pattern(regexp = "\\d{6}", message = "인증 코드는 6자리 숫자여야 합니다.")
        String code,

        @NotBlank(message = "새 비밀번호는 필수입니다.")
        @Size(min = 8, max = 100, message = "비밀번호는 8자 이상 100자 이하여야 합니다.")
        String newPassword
) {
}
