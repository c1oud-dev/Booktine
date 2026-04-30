package booktine.Booktine.domain.recommendation.controller;

import booktine.Booktine.domain.recommendation.dto.RecommendationResponse;
import booktine.Booktine.domain.recommendation.service.RecommendationService;
import booktine.Booktine.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 추천 도서 관련 HTTP API 엔드포인트를 제공하는 컨트롤러.
 * 인증 적용 전까지는 userId RequestParam 기반으로 추천/저장/조회/삭제를 처리한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * 장르 기반 추천 도서 1권을 조회한다.
     */
    @GetMapping
    public ApiResponse<RecommendationResponse> recommendByGenre(@RequestParam Long userId, @RequestParam String genre) {
        return ApiResponse.ok(recommendationService.recommendByGenre(userId, genre));
    }

    /**
     * 추천 도서를 사용자 저장 목록에 저장한다.
     */
    @PostMapping
    public ApiResponse<RecommendationResponse> saveRecommendation(
            @RequestParam Long userId,
            @RequestBody RecommendationResponse request
    ) {
        return ApiResponse.ok(recommendationService.saveRecommendation(userId, request));
    }

    /**
     * 사용자별 저장된 추천 도서 목록을 조회한다.
     */
    @GetMapping("/saved")
    public ApiResponse<List<RecommendationResponse>> getSavedRecommendations(@RequestParam Long userId) {
        return ApiResponse.ok(recommendationService.getSavedRecommendations(userId));
    }

    /**
     * 저장된 추천 도서를 삭제한다.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRecommendation(@PathVariable Long id, @RequestParam Long userId) {
        recommendationService.deleteRecommendation(userId, id);
        return ApiResponse.ok();
    }
}