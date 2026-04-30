package booktine.Booktine.domain.progress.controller;

import booktine.Booktine.domain.progress.dto.AnnualGoalCreateRequest;
import booktine.Booktine.domain.progress.dto.AnnualGoalResponse;
import booktine.Booktine.domain.progress.service.AnnualGoalService;
import booktine.Booktine.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 연간 목표 HTTP API를 제공하는 컨트롤러.
 * JWT 적용 전 단계로 userId를 RequestParam으로 받는다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/goals/annual")
public class AnnualGoalController {

    private final AnnualGoalService annualGoalService;

    /** 연간 목표를 설정한다. */
    @PostMapping
    public ApiResponse<AnnualGoalResponse> create(@RequestParam Long userId,
                                                  @RequestBody AnnualGoalCreateRequest request) {
        return ApiResponse.ok(annualGoalService.create(userId, request));
    }

    /** 특정 연도의 연간 목표를 조회한다. */
    @GetMapping
    public ApiResponse<AnnualGoalResponse> getGoal(@RequestParam Long userId,
                                                   @RequestParam Integer year) {
        return ApiResponse.ok(annualGoalService.getGoal(userId, year));
    }

    /** 특정 연도의 연간 목표를 수정한다. */
    @PutMapping
    public ApiResponse<AnnualGoalResponse> update(@RequestParam Long userId,
                                                  @RequestParam Integer year,
                                                  @RequestBody AnnualGoalCreateRequest request) {
        return ApiResponse.ok(annualGoalService.update(userId, year, request));
    }
}
