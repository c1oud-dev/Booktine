package booktine.Booktine.domain.progress.controller;

import booktine.Booktine.domain.progress.dto.MonthlyGoalCreateRequest;
import booktine.Booktine.domain.progress.dto.MonthlyGoalResponse;
import booktine.Booktine.domain.progress.service.MonthlyGoalService;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 월간 목표 API를 제공하며 인증 컨텍스트의 userId로 사용자 목표를 처리하는 컨트롤러.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/goals/monthly")
@Tag(name = "월간 목표", description = "월간 목표 관련 API")
public class MonthlyGoalController {

    private final MonthlyGoalService monthlyGoalService;

    /** 월간 목표를 생성한다. */
    @Operation(summary = "독서 목표 생성", description = "로그인한 사용자의 독서 목표를 생성합니다.")
    @PostMapping
    public ApiResponse<MonthlyGoalResponse> create(@RequestBody MonthlyGoalCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(monthlyGoalService.create(userId, request));
    }

    /** 특정 연월의 월간 목표를 조회한다. */
    @Operation(summary = "독서 목표 조회", description = "로그인한 사용자의 기간별 독서 목표를 조회합니다.")
    @GetMapping
    public ApiResponse<MonthlyGoalResponse> getGoal(@RequestParam Integer year, @RequestParam Integer month) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(monthlyGoalService.getGoal(userId, year, month));
    }

    /** 특정 연월의 월간 목표를 수정한다. */
    @Operation(summary = "독서 목표 수정", description = "로그인한 사용자의 기존 독서 목표를 수정합니다.")
    @PutMapping
    public ApiResponse<MonthlyGoalResponse> update(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestBody MonthlyGoalCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(monthlyGoalService.update(userId, year, month, request)); }
}
