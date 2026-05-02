package booktine.Booktine.domain.post.controller;

import booktine.Booktine.domain.post.dto.PostCreateRequest;
import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.post.dto.PostUpdateRequest;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.service.PostService;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 게시물 API를 제공하는 컨트롤러로,
 * 인증 컨텍스트의 userId를 기준으로 사용자 리소스를 처리한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
@Tag(name = "게시글", description = "게시글 관련 API")
public class PostController {

    private final PostService postService;

    /** 사용자 ID 기준으로 게시물 목록을 조회한다. */
    @Operation(summary = "내 게시글 목록 조회", description = "로그인한 사용자의 게시글 목록을 페이지 단위로 조회합니다.")
    @GetMapping
    public ApiResponse<Page<PostResponse>> getPosts(Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(postService.getPostsByUserId(userId, pageable));
    }

    /** 키워드와 독서 상태를 조건으로 게시물을 검색한다. */
    @Operation(summary = "게시글 검색", description = "키워드와 독서 상태 조건으로 내 게시글을 검색합니다.")
    @GetMapping("/search")
    public ApiResponse<List<PostResponse>> searchPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ReadingStatus status)
    {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(postService.searchPosts(userId, keyword, status));
    }

    /** 현재 로그인 사용자 게시물을 생성한다. */
    @Operation(summary = "게시글 작성", description = "로그인한 사용자의 새 게시글을 작성합니다.")
    @PostMapping
    public ApiResponse<PostResponse> createPost(@Valid @RequestBody PostCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(postService.createPost(userId, request));
    }

    /** 게시물 단건을 조회한다. */
    @Operation(summary = "게시글 단건 조회", description = "게시글 ID로 게시글 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ApiResponse<PostResponse> getPost(@PathVariable Long id) {
        return ApiResponse.ok(postService.getPost(id));
    }

    /** 현재 로그인 사용자 게시물을 수정한다. */
    @Operation(summary = "게시글 수정", description = "게시글 ID에 해당하는 내 게시글을 수정합니다.")
    @PutMapping("/{id}")
    public ApiResponse<PostResponse> updatePost(@PathVariable Long id, @RequestBody PostUpdateRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(postService.updatePost(userId, id, request));
    }

    /** 현재 로그인 사용자 게시물을 삭제한다. */
    @Operation(summary = "게시글 삭제", description = "게시글 ID에 해당하는 내 게시글을 삭제합니다.")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePost(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        postService.deletePost(userId, id); return ApiResponse.ok();
    }
}
