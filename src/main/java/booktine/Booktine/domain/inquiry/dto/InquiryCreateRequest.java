package booktine.Booktine.domain.inquiry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 사용자 문의/제안 등록 요청 본문을 표현하는 DTO.
 * 푸터 문의/제안 폼에서 입력한 제목과 내용을 검증한 뒤 서비스 계층으로 전달한다.
 */
public record InquiryCreateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 100, message = "제목은 100자 이하여야 합니다.")
        String subject,
        @NotBlank(message = "문의 내용은 필수입니다.")
        @Size(max = 3000, message = "문의 내용은 3000자 이하여야 합니다.")
        String message
) {
}
