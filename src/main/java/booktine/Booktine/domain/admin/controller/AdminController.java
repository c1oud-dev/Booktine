package booktine.Booktine.domain.admin.controller;

import booktine.Booktine.domain.admin.dto.AdminReminderResponse;
import booktine.Booktine.domain.admin.dto.AdminStatsResponse;
import booktine.Booktine.domain.admin.dto.AdminUserRoleUpdateRequest;
import booktine.Booktine.domain.admin.dto.AdminUserStatusUpdateRequest;
import booktine.Booktine.domain.admin.service.AdminService;
import booktine.Booktine.domain.genre.dto.GenreCreateRequest;
import booktine.Booktine.domain.genre.dto.GenreResponse;
import booktine.Booktine.domain.inquiry.dto.InquiryResponse;
import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 전용 API를 제공하는 컨트롤러.
 * 관리자 페이지에서 사용자/게시물/문의/장르/통계/리마인더 등 운영 기능 호출 시 사용된다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@Tag(name = "관리자", description = "관리자 관련 API")
public class AdminController {

    private final AdminService adminService;

    /** 전체 사용자 목록을 페이지 단위로 조회한다. */
    @Operation(summary = "전체 사용자 조회", description = "관리자 권한으로 전체 사용자 목록을 페이지 단위로 조회합니다.")
    @GetMapping("/users")
    public ApiResponse<Page<UserResponse>> getUserPage(Pageable pageable) {
        return ApiResponse.ok(adminService.getUserPage(pageable));
    }

    /** 전체 독서 노트 목록을 페이지 단위로 조회한다. */
    @Operation(summary = "전체 게시물 조회", description = "관리자 권한으로 전체 독서 노트 목록을 페이지 단위로 조회합니다.")
    @GetMapping("/posts")
    public ApiResponse<Page<PostResponse>> getPostPage(Pageable pageable) {
        return ApiResponse.ok(adminService.getPostPage(pageable));
    }

    /** 관리 장르 목록을 조회한다. */
    @Operation(summary = "관리 장르 목록 조회", description = "관리자가 등록한 장르 목록을 조회합니다.")
    @GetMapping("/genres")
    public ApiResponse<List<GenreResponse>> getGenres() {
        return ApiResponse.ok(adminService.getGenres());
    }

    /** 새 관리 장르를 생성한다. */
    @Operation(summary = "장르 추가", description = "관리자가 새 장르를 추가합니다.")
    @PostMapping("/genres")
    public ApiResponse<GenreResponse> createGenre(@Valid @RequestBody GenreCreateRequest request) {
        return ApiResponse.ok(adminService.createGenre(request));
    }

    /** 관리 장르를 삭제한다. */
    @Operation(summary = "장르 삭제", description = "관리자가 장르를 삭제합니다.")
    @DeleteMapping("/genres/{id}")
    public ApiResponse<Void> deleteGenre(@PathVariable Long id) {
        adminService.deleteGenre(id);
        return ApiResponse.ok();
    }

    /** 문의/제안 목록을 페이지 단위로 조회한다. */
    @Operation(summary = "문의 목록 조회", description = "관리자가 문의/제안 목록을 페이지 단위로 조회합니다.")
    @GetMapping("/inquiries")
    public ApiResponse<Page<InquiryResponse>> getInquiryPage(Pageable pageable) {
        return ApiResponse.ok(adminService.getInquiryPage(pageable));
    }

    /** 관리자 권한으로 커뮤니티 게시글을 삭제한다. */
    @Operation(summary = "커뮤니티 게시글 삭제", description = "관리자가 커뮤니티 게시글을 삭제합니다.")
    @DeleteMapping("/community/{id}")
    public ApiResponse<Void> deleteCommunity(@PathVariable Long id) {
        adminService.deleteCommunityPost(id);
        return ApiResponse.ok();
    }

    /** 관리자 권한으로 사용자 권한을 변경한다. */
    @Operation(summary = "사용자 권한 변경", description = "관리자가 사용자 권한을 변경합니다.")
    @PatchMapping("/users/{id}/role")
    public ApiResponse<UserResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserRoleUpdateRequest request
    ) {
        return ApiResponse.ok(adminService.updateUserRole(id, request));
    }

    /** 관리자 권한으로 사용자 계정 상태를 변경한다. */
    @Operation(summary = "사용자 상태 변경", description = "관리자가 사용자 계정 정지 상태를 변경합니다.")
    @PatchMapping("/users/{id}/status")
    public ApiResponse<UserResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserStatusUpdateRequest request
    ) {
        return ApiResponse.ok(adminService.updateUserStatus(id, request));
    }

    /** 관리자 대시보드 통계를 조회한다. */
    @Operation(summary = "관리자 통계 조회", description = "관리자 대시보드에서 사용하는 통계 데이터를 조회합니다.")
    @GetMapping("/stats")
    public ApiResponse<AdminStatsResponse> getStats() {
        return ApiResponse.ok(adminService.getStats());
    }

    /** 관리자 리마인더 현황 목록을 조회한다. */
    @Operation(summary = "리마인더 현황 조회", description = "관리자가 전체 리마인더 현황을 조회합니다.")
    @GetMapping("/reminders")
    public ApiResponse<List<AdminReminderResponse>> getReminders() {
        return ApiResponse.ok(adminService.getReminders());
    }
}

