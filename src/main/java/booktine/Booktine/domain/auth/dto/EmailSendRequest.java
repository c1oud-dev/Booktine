package booktine.Booktine.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 이메일 인증 코드 발송 요청 DTO.
 * 회원가입/비밀번호 재설정 흐름에서 인증 코드를 보낼 이메일과 목적을 전달한다.
 */
public record EmailSendRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "유효한 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "인증 목적은 필수입니다.")
        String purpose
) {
}
