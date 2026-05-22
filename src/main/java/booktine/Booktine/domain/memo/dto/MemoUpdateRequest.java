package booktine.Booktine.domain.memo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 메모 수정 요청 데이터를 전달하는 DTO.
 * 메모 수정 API에서 요청 본문으로 사용된다.
 */
public record MemoUpdateRequest(
        @NotBlank(message = "메모 내용은 필수입니다.")
        @Size(max = 2000, message = "메모 내용은 2000자 이하여야 합니다.")
        String content,
        @NotNull(message = "페이지는 필수입니다.")
        @Min(value = 1, message = "페이지는 1 이상이어야 합니다.")
        Integer page
) {
}
