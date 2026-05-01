package booktine.Booktine.domain.post.controller;

import booktine.Booktine.domain.post.dto.PostCreateRequest;
import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.post.dto.PostUpdateRequest;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.service.PostService;
import booktine.Booktine.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 게시물 관련 HTTP API 엔드포인트를 제공하는 컨트롤러.
 * D8 인증 연동 전까지는 RequestParam userId를 사용해 임시 사용자 식별을 수행한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    /**
     * 사용자 ID 기준으로 게시물 목록을 조회한다.
     */
    @GetMapping
    public ApiResponse<Page<PostResponse>> getPosts(@RequestParam Long userId, Pageable pageable) {
        return ApiResponse.ok(postService.getPostsByUserId(userId, pageable));
    }

    /**
     * 키워드와 독서 상태를 조건으로 게시물을 검색한다.
     */
    @GetMapping("/search")
    public ApiResponse<List<PostResponse>> searchPosts(
            @RequestParam Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ReadingStatus status
    ) {
        return ApiResponse.ok(postService.searchPosts(userId, keyword, status));
    }

    /**
     * 사용자 ID 기준으로 게시물을 생성한다.
     */
    @PostMapping
    public ApiResponse<PostResponse> createPost(@RequestParam Long userId, @Valid @RequestBody PostCreateRequest request) {
        return ApiResponse.ok(postService.createPost(userId, request));
    }

    /**
     * 게시물 ID 기준으로 게시물 상세를 조회한다.
     */
    @GetMapping("/{id}")
    public ApiResponse<PostResponse> getPost(@PathVariable Long id) {
        return ApiResponse.ok(postService.getPost(id));
    }

    /**
     * 사용자 ID와 게시물 ID 기준으로 게시물을 수정한다.
     */
    @PutMapping("/{id}")
    public ApiResponse<PostResponse> updatePost(
            @RequestParam Long userId,
            @PathVariable Long id,
            @RequestBody PostUpdateRequest request
    ) {
        return ApiResponse.ok(postService.updatePost(userId, id, request));
    }

    /**
     * 사용자 ID와 게시물 ID 기준으로 게시물을 삭제한다.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePost(@RequestParam Long userId, @PathVariable Long id) {
        postService.deletePost(userId, id);
        return ApiResponse.ok();
    }
}
