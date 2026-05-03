package booktine.Booktine.domain.progress.controller;

import booktine.Booktine.domain.progress.dto.BasicStatsResponse;
import booktine.Booktine.domain.progress.dto.GenreStatsResponse;
import booktine.Booktine.domain.progress.dto.MonthlyReadCountResponse;
import booktine.Booktine.domain.progress.service.StatisticsService;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 독서 통계 API를 제공하며 인증 컨텍스트 userId로 통계를 조회하는 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/stats")
@Tag(name = "통계", description = "통계 관련 API")
public class StatisticsController {

    private final StatisticsService statisticsService;

    /** 기본 통계를 조회한다. */
    @Operation(summary = "기본 독서 통계 조회", description = "로그인한 사용자의 누적 독서 통계 요약 정보를 조회합니다.")
    @GetMapping
    public ApiResponse<BasicStatsResponse> getBasicStats() {
        return ApiResponse.ok(statisticsService.getBasicStats(getCurrentUserId()));
    }

    /** 장르별 독서 비율을 조회한다. */
    @Operation(summary = "장르별 독서 통계 조회", description = "로그인한 사용자의 장르별 독서 통계를 조회합니다.")
    @GetMapping("/genre")
    public ApiResponse<List<GenreStatsResponse>> getGenreStats() {
        return ApiResponse.ok(statisticsService.getGenreStats(getCurrentUserId()));
    }

    /** 연간 월별 독서량 추이를 조회한다. */
    @Operation(summary = "연간 월별 독서량 조회", description = "지정한 연도의 월별 독서량 통계를 조회합니다.")
    @GetMapping("/annual")
    public ApiResponse<List<MonthlyReadCountResponse>> getAnnualTrend(@RequestParam Integer year) {
        return ApiResponse.ok(statisticsService.getAnnualTrend(getCurrentUserId(), year));
    }

    /** 인증 컨텍스트에서 현재 사용자 ID를 조회한다. */
    private Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }
}
