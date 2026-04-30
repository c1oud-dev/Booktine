package booktine.Booktine.domain.recommendation.dto;

/**
 * 알라딘 ItemSearch API 응답 item 객체를 담기 위한 DTO.
 * AladinApiClient에서 외부 응답을 파싱하고 RecommendationService로 전달할 때 사용된다.
 */
public record AladinBookResponse(
        String title,
        String author,
        String publisher,
        String cover,
        String categoryName,
        String description,
        String isbn13
) {
}
