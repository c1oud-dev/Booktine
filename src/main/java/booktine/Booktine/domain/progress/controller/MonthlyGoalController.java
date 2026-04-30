package booktine.Booktine.domain.progress.controller;

import booktine.Booktine.domain.progress.dto.MonthlyGoalCreateRequest;
import booktine.Booktine.domain.progress.dto.MonthlyGoalResponse;
import booktine.Booktine.domain.progress.service.MonthlyGoalService;
import booktine.Booktine.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 월간 목표 HTTP API를 제공하는 컨트롤러.
 * JWT 적용 전 단계로 userId를 RequestParam으로 받는다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/goals/monthly")
public class MonthlyGoalController {

    private final MonthlyGoalService monthlyGoalService;

    /** 월간 목표를 설정한다. */
    @PostMapping
    public ApiResponse<MonthlyGoalResponse> create(@RequestParam Long userId,
                                                   @RequestBody MonthlyGoalCreateRequest request) {
        return ApiResponse.ok(monthlyGoalService.create(userId, request));
    }

    /** 특정 연월의 월간 목표를 조회한다. */
    @GetMapping
    public ApiResponse<MonthlyGoalResponse> getGoal(@RequestParam Long userId,
                                                    @RequestParam Integer year,
                                                    @RequestParam Integer month) {
        return ApiResponse.ok(monthlyGoalService.getGoal(userId, year, month));
    }

    /** 특정 연월의 월간 목표를 수정한다. */
    @PutMapping
    public ApiResponse<MonthlyGoalResponse> update(@RequestParam Long userId,
                                                   @RequestParam Integer year,
                                                   @RequestParam Integer month,
                                                   @RequestBody MonthlyGoalCreateRequest request) {
        return ApiResponse.ok(monthlyGoalService.update(userId, year, month, request));
    }
}
