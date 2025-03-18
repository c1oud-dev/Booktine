package booktine.Booktine.controller;

import booktine.Booktine.controller.dto.RecommendedBook;
import booktine.Booktine.service.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recommend")
public class RecommendationController {
    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * 예: GET /recommend?genre=소설
     *     -> 소설 장르 중 랜덤 한 권 반환
     */
    @GetMapping
    public RecommendedBook recommendBook(@RequestParam(value="genre", required=false) String genre) {
        return recommendationService.getRandomBookByGenre(genre);
    }
}
