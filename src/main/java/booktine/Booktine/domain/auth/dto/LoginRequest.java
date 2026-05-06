package booktine.Booktine.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 로그인 요청 바디를 표현하는 DTO.
 * AuthController의 /auth/login 엔드포인트에서 사용된다.
 */
public record LoginRequest(
        @Email(message = "유효한 이메일 형식이어야 합니다.")
        @NotBlank(message = "이메일은 필수입니다.")
        String email,
        @NotBlank(message = "비밀번호는 필수입니다.")
        String password,

        Boolean keepLogin
) {
}
