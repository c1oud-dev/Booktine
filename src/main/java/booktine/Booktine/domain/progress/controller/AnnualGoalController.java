package booktine.Booktine.domain.progress.controller;

import booktine.Booktine.domain.progress.dto.AnnualGoalCreateRequest;
import booktine.Booktine.domain.progress.dto.AnnualGoalResponse;
import booktine.Booktine.domain.progress.service.AnnualGoalService;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 연간 목표 API를 제공하며 인증 컨텍스트의 userId로 사용자 목표를 처리하는 컨트롤러.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/goals/annual")
@Tag(name = "연간 목표", description = "연간 목표 관련 API")
public class AnnualGoalController {

    private final AnnualGoalService annualGoalService;

    /** 연간 목표를 생성한다. */
    @Operation(summary = "독서 목표 생성", description = "로그인한 사용자의 독서 목표를 생성합니다.")
    @PostMapping
    public ApiResponse<AnnualGoalResponse> create(@Valid @RequestBody AnnualGoalCreateRequest request) {
        return ApiResponse.ok(annualGoalService.create(getCurrentUserId(), request));
    }

    /** 특정 연도의 연간 목표를 조회한다. */
    @Operation(summary = "독서 목표 조회", description = "로그인한 사용자의 기간별 독서 목표를 조회합니다.")
    @GetMapping
    public ApiResponse<AnnualGoalResponse> getGoal(@RequestParam Integer year) {
        return ApiResponse.ok(annualGoalService.getGoal(getCurrentUserId(), year));
    }

    /** 특정 연도의 연간 목표를 수정한다. */
    @Operation(summary = "독서 목표 수정", description = "로그인한 사용자의 기존 독서 목표를 수정합니다.")
    @PutMapping
    public ApiResponse<AnnualGoalResponse> update(@Valid @RequestParam Integer year, @RequestBody AnnualGoalCreateRequest request) {
        return ApiResponse.ok(annualGoalService.update(getCurrentUserId(), year, request));
    }

    /** 인증 컨텍스트에서 현재 사용자 ID를 조회한다. */
    private Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }
}
