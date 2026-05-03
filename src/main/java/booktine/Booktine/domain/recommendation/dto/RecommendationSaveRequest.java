package booktine.Booktine.domain.recommendation.dto;

/**
 * 추천 도서를 저장할 때 클라이언트 입력값을 전달하기 위한 DTO.
 * RecommendationController의 저장 API 요청 본문으로 사용된다.
 */
public record RecommendationSaveRequest(
        String title,
        String author,
        String publisher,
        String coverImageUrl,
        String genre,
        String description,
        String isbn
) {
}
