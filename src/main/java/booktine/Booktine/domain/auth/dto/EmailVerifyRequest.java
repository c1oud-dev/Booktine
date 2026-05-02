package booktine.Booktine.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 이메일 인증 코드 검증 요청 DTO.
 * 이메일, 인증 목적, 6자리 인증 코드를 전달받아 검증에 사용한다.
 */
public record EmailVerifyRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "유효한 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "인증 목적은 필수입니다.")
        String purpose,

        @NotBlank(message = "인증 코드는 필수입니다.")
        @Pattern(regexp = "\\d{6}", message = "인증 코드는 6자리 숫자여야 합니다.")
        String code
) {
}
