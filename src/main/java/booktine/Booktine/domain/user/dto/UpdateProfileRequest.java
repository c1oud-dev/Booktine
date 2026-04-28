package booktine.Booktine.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 내 프로필 수정 요청 본문을 표현하는 DTO.
 * 현재 비밀번호 확인과 함께 닉네임/자기소개 변경에 사용된다.
 */
public record UpdateProfileRequest(
        @NotBlank(message = "닉네임은 필수입니다.")
        @Size(max = 30, message = "닉네임은 30자 이하여야 합니다.")
        String nickname,

        @Size(max = 500, message = "자기소개는 500자 이하여야 합니다.")
        String aboutMe,

        @NotBlank(message = "현재 비밀번호는 필수입니다.")
        String password
) {
}
