package booktine.Booktine.domain.progress.controller;

import booktine.Booktine.domain.progress.dto.AnnualGoalCreateRequest;
import booktine.Booktine.domain.progress.dto.AnnualGoalResponse;
import booktine.Booktine.domain.progress.service.AnnualGoalService;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 연간 목표 API를 제공하며 인증 컨텍스트의 userId로 사용자 목표를 처리하는 컨트롤러.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/goals/annual")
public class AnnualGoalController {

    private final AnnualGoalService annualGoalService;

    /** 연간 목표를 생성한다. */
    @PostMapping
    public ApiResponse<AnnualGoalResponse> create(@RequestBody AnnualGoalCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(annualGoalService.create(userId, request));
    }

    /** 특정 연도의 연간 목표를 조회한다. */
    @GetMapping
    public ApiResponse<AnnualGoalResponse> getGoal(@RequestParam Integer year) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(annualGoalService.getGoal(userId, year));
    }

    /** 특정 연도의 연간 목표를 수정한다. */
    @PutMapping
    public ApiResponse<AnnualGoalResponse> update(@RequestParam Integer year, @RequestBody AnnualGoalCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(annualGoalService.update(userId, year, request));
    }
}
