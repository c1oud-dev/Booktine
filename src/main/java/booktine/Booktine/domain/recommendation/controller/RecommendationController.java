package booktine.Booktine.domain.recommendation.controller;

import booktine.Booktine.domain.recommendation.dto.AladinBookResponse;
import booktine.Booktine.domain.recommendation.dto.RecommendationResponse;
import booktine.Booktine.domain.recommendation.service.RecommendationService;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

/**
 * 추천 도서 API를 제공하며 인증 컨텍스트 userId로 추천 저장/조회/삭제를 처리하는 컨트롤러.
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
    public ApiResponse<RecommendationResponse> recommendByGenre(@RequestParam String genre) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(recommendationService.recommendByGenre(userId, genre));
    }

    /**
     * 추천 도서를 사용자 저장 목록에 저장한다.
     */
    @PostMapping
    public ApiResponse<RecommendationResponse> saveRecommendation(@RequestBody RecommendationResponse request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(recommendationService.saveRecommendation(userId, request));
    }

    /**
     * 사용자별 저장된 추천 도서 목록을 조회한다.
     */
    @GetMapping("/saved")
    public ApiResponse<Page<RecommendationResponse>> getSavedRecommendations(Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(recommendationService.getSavedRecommendations(userId, pageable));
    }

    /**
     * 키워드 기반 도서 검색 결과를 페이지네이션으로 조회한다.
     */
    @GetMapping("/search")
    public ApiResponse<Page<AladinBookResponse>> searchBooks(@RequestParam String query, Pageable pageable) {
        return ApiResponse.ok(recommendationService.searchBooks(query, pageable));
    }

    /**
     * 베스트셀러 목록을 페이지네이션으로 조회한다.
     */
    @GetMapping("/bestseller")
    public ApiResponse<Page<AladinBookResponse>> getBestsellers(Pageable pageable) {
        return ApiResponse.ok(recommendationService.getBestsellers(pageable));
    }

    /**
     * 저장된 추천 도서를 삭제한다.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRecommendation(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        recommendationService.deleteRecommendation(userId, id);
        return ApiResponse.ok();
    }
}