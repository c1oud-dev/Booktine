package booktine.Booktine.domain.admin.controller;

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
 * 관리자 조회 API를 제공하는 컨트롤러.
 * 관리자 페이지에서 사용자/게시물 목록을 확인할 때 이 컨트롤러 엔드포인트를 호출한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@Tag(name = "관리자", description = "관리자 관련 API")
public class AdminController {

    private final AdminService adminService;

    /**
     * 전체 사용자 목록 페이지를 조회한다.
     * 페이징 조건(page, size, sort)에 맞는 사용자 목록을 ApiResponse로 감싸 반환한다.
     */
    @Operation(summary = "전체 사용자 조회", description = "관리자 용도로 전체 사용자 목록을 페이지 단위로 조회합니다.")
    @GetMapping("/users")
    public ApiResponse<Page<UserResponse>> getUserPage(Pageable pageable) {
        return ApiResponse.ok(adminService.getUserPage(pageable));
    }

    /**
     * 전체 게시물 목록 페이지를 조회한다.
     * 페이징 조건(page, size, sort)에 맞는 게시물 목록을 ApiResponse로 감싸 반환한다.
     */
    @Operation(summary = "전체 게시물 조회", description = "관리자 용도로 전체 게시물 목록을 페이지 단위로 조회합니다.")
    @GetMapping("/posts")
    public ApiResponse<Page<PostResponse>> getPostPage(Pageable pageable) {
        return ApiResponse.ok(adminService.getPostPage(pageable));
    }

    @Operation(summary = "관리 장르 목록 조회", description = "관리자가 추가한 장르 목록을 조회합니다.")
    @GetMapping("/genres")
    public ApiResponse<List<GenreResponse>> getGenres() {
        return ApiResponse.ok(adminService.getGenres());
    }

    @Operation(summary = "장르 추가", description = "관리자가 새 장르를 추가합니다.")
    @PostMapping("/genres")
    public ApiResponse<GenreResponse> createGenre(@Valid @RequestBody GenreCreateRequest request) {
        return ApiResponse.ok(adminService.createGenre(request));
    }

    @Operation(summary = "장르 삭제", description = "관리자가 추가한 장르를 삭제합니다.")
    @DeleteMapping("/genres/{id}")
    public ApiResponse<Void> deleteGenre(@PathVariable Long id) {
        adminService.deleteGenre(id);
        return ApiResponse.ok();
    }

    @Operation(summary = "문의 목록 조회", description = "관리자가 사용자 문의/제안 목록을 페이지 단위로 조회합니다.")
    @GetMapping("/inquiries")
    public ApiResponse<Page<InquiryResponse>> getInquiryPage(Pageable pageable) {
        return ApiResponse.ok(adminService.getInquiryPage(pageable));
    }
}

