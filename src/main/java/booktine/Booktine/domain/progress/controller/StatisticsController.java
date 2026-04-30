package booktine.Booktine.domain.progress.controller;

import booktine.Booktine.domain.progress.dto.BasicStatsResponse;
import booktine.Booktine.domain.progress.dto.GenreStatsResponse;
import booktine.Booktine.domain.progress.dto.MonthlyReadCountResponse;
import booktine.Booktine.domain.progress.service.StatisticsService;
import booktine.Booktine.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 독서 통계 HTTP API를 제공하는 컨트롤러.
 * JWT 적용 전 단계로 userId를 RequestParam으로 받는다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/stats")
public class StatisticsController {

    private final StatisticsService statisticsService;

    /** 기본 통계를 조회한다. */
    @GetMapping
    public ApiResponse<BasicStatsResponse> getBasicStats(@RequestParam Long userId) {
        return ApiResponse.ok(statisticsService.getBasicStats(userId));
    }

    /** 장르별 독서 비율을 조회한다. */
    @GetMapping("/genre")
    public ApiResponse<List<GenreStatsResponse>> getGenreStats(@RequestParam Long userId) {
        return ApiResponse.ok(statisticsService.getGenreStats(userId));
    }

    /** 연간 월별 독서량 추이를 조회한다. */
    @GetMapping("/annual")
    public ApiResponse<List<MonthlyReadCountResponse>> getAnnualTrend(@RequestParam Long userId,
                                                                      @RequestParam Integer year) {
        return ApiResponse.ok(statisticsService.getAnnualTrend(userId, year));
    }
}
