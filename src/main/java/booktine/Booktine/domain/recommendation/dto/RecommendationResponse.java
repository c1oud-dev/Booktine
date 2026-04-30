package booktine.Booktine.domain.recommendation.dto;

import booktine.Booktine.domain.recommendation.entity.Recommendation;

/**
 * 추천 도서 정보를 API 응답으로 전달하기 위한 DTO.
 * RecommendationController에서 조회/생성 응답으로 사용된다.
 */
public record RecommendationResponse(
        Long id,
        Long userId,
        String title,
        String author,
        String publisher,
        String coverImageUrl,
        String genre,
        String description,
        String isbn
) {
    /**
     * Recommendation 엔티티를 RecommendationResponse로 변환한다.
     */
    public static RecommendationResponse from(Recommendation recommendation) {
        return new RecommendationResponse(
                recommendation.getId(),
                recommendation.getUser().getId(),
                recommendation.getTitle(),
                recommendation.getAuthor(),
                recommendation.getPublisher(),
                recommendation.getCoverImageUrl(),
                recommendation.getGenre(),
                recommendation.getDescription(),
                recommendation.getIsbn()
        );
    }
}
