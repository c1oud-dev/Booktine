package booktine.Booktine.domain.recommendation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 추천 도서를 저장할 때 클라이언트 입력값을 전달하기 위한 DTO.
 * RecommendationController의 저장 API 요청 본문으로 사용된다.
 */
public record RecommendationSaveRequest(

        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
        String title,

        @NotBlank(message = "저자는 필수입니다.")
        @Size(max = 100, message = "저자는 100자 이하여야 합니다.")
        String author,

        @NotBlank(message = "출판사는 필수입니다.")
        @Size(max = 100, message = "출판사는 100자 이하여야 합니다.")
        String publisher,

        @NotBlank(message = "표지 이미지 URL은 필수입니다.")
        String coverImageUrl,

        @NotBlank(message = "장르는 필수입니다.")
        @Size(max = 50, message = "장르는 50자 이하여야 합니다.")
        String genre,

        @NotBlank(message = "설명은 필수입니다.")
        @Size(max = 5000, message = "설명은 5000자 이하여야 합니다.")
        String description,

        @NotBlank(message = "ISBN은 필수입니다.")
        @Size(max = 20, message = "ISBN은 20자 이하여야 합니다.")
        String isbn
) {
}
