package booktine.Booktine.domain.admin.controller;

import booktine.Booktine.domain.admin.service.AdminService;
import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 관리자 기능 관련 HTTP API 엔드포인트를 제공하는 컨트롤러.
 * D9 보안 적용 전까지는 권한 검증 없이 조회 기능만 노출한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@Tag(name = "관리자", description = "관리자 관련 API")
public class AdminController {

    private final AdminService adminService;

    /**
     * 전체 사용자 목록을 조회한다.
     */
    @Operation(summary = "전체 사용자 조회", description = "관리자 용도로 전체 사용자 목록을 페이지 단위로 조회합니다.")
    @GetMapping("/users")
    public ApiResponse<Page<UserResponse>> getUsers(Pageable pageable) {
        return ApiResponse.ok(adminService.getUsers(pageable));
    }

    /**
     * 전체 게시물 목록을 조회한다.
     */
    @Operation(summary = "전체 게시물 조회", description = "관리자 용도로 전체 게시물 목록을 페이지 단위로 조회합니다.")
    @GetMapping("/posts")
    public ApiResponse<Page<PostResponse>> getPosts(Pageable pageable) {
        return ApiResponse.ok(adminService.getPosts(pageable));
    }
}

