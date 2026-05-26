package booktine.Booktine.domain.community.controller;

import booktine.Booktine.domain.community.dto.*;
import booktine.Booktine.domain.community.entity.CommunityCategory;
import booktine.Booktine.domain.community.service.CommunityService;
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
 * 커뮤니티 API를 제공하는 컨트롤러.
 * 모든 요청은 인증된 사용자만 접근하며 작성자 정보는 인증 컨텍스트에서 처리된다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/community/posts")
@Tag(name = "커뮤니티", description = "독서 커뮤니티 관련 API")
public class CommunityController {

    private final CommunityService communityService;

    /** 커뮤니티 게시글 목록을 페이지 단위로 조회한다. */
    @Operation(summary = "커뮤니티 게시글 목록 조회", description = "커뮤니티 게시글 목록을 페이지 단위로 조회합니다.")
    @GetMapping
    public ApiResponse<Page<CommunityPostResponse>> getPosts(
            @RequestParam(required = false) CommunityCategory category,
            @RequestParam(required = false) Long userId,
            Pageable pageable
    ) {
        return ApiResponse.ok(communityService.getPosts(category, userId, pageable));
    }

    /** 커뮤니티 게시글을 생성한다. */
    @Operation(summary = "커뮤니티 게시글 작성", description = "로그인한 사용자의 새 커뮤니티 게시글을 작성합니다.")
    @PostMapping
    public ApiResponse<CommunityPostResponse> createPost(@Valid @RequestBody CommunityPostCreateRequest request) {
        return ApiResponse.ok(communityService.createPost(request));
    }

    /** 커뮤니티 게시글 단건을 조회한다. */
    @Operation(summary = "커뮤니티 게시글 단건 조회", description = "게시글 ID로 커뮤니티 게시글 상세 정보를 조회합니다.")
    @GetMapping("/{postId}")
    public ApiResponse<CommunityPostResponse> getPost(@PathVariable Long postId) {
        return ApiResponse.ok(communityService.getPost(postId));
    }

    /** 커뮤니티 게시글을 수정한다. */
    @Operation(summary = "커뮤니티 게시글 수정", description = "로그인 사용자가 작성한 커뮤니티 게시글을 수정합니다.")
    @PutMapping("/{postId}")
    public ApiResponse<CommunityPostResponse> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody CommunityPostUpdateRequest request
    ) {
        return ApiResponse.ok(communityService.updatePost(postId, request));
    }

    /** 커뮤니티 게시글을 삭제한다. */
    @Operation(summary = "커뮤니티 게시글 삭제", description = "로그인 사용자가 작성한 커뮤니티 게시글을 삭제합니다.")
    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable Long postId) {
        communityService.deletePost(postId);
        return ApiResponse.ok();
    }

    /** 게시글의 댓글/대댓글 목록을 조회한다. */
    @Operation(summary = "커뮤니티 댓글 목록 조회", description = "게시글의 댓글과 대댓글 목록을 조회합니다.")
    @GetMapping("/{postId}/comments")
    public ApiResponse<List<CommunityCommentResponse>> getComments(@PathVariable Long postId) {
        return ApiResponse.ok(communityService.getComments(postId));
    }

    /** 게시글에 댓글 또는 대댓글을 작성한다. */
    @Operation(summary = "커뮤니티 댓글 작성", description = "게시글에 댓글 또는 대댓글을 작성합니다. 대댓글은 depth 2까지만 허용됩니다.")
    @PostMapping("/{postId}/comments")
    public ApiResponse<CommunityCommentResponse> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommunityCommentCreateRequest request
    ) {
        return ApiResponse.ok(communityService.createComment(postId, request));
    }

    /** 댓글 또는 대댓글을 수정한다. */
    @Operation(summary = "커뮤니티 댓글 수정", description = "로그인 사용자가 작성한 댓글 또는 대댓글을 수정합니다.")
    @PutMapping("/comments/{commentId}")
    public ApiResponse<CommunityCommentResponse> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommunityCommentUpdateRequest request
    ) {
        return ApiResponse.ok(communityService.updateComment(commentId, request));
    }

    /** 댓글 또는 대댓글을 삭제한다. */
    @Operation(summary = "커뮤니티 댓글 삭제", description = "로그인 사용자가 작성한 댓글 또는 대댓글을 삭제합니다.")
    @DeleteMapping("/comments/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable Long commentId) {
        communityService.deleteComment(commentId);
        return ApiResponse.ok();
    }

    /** 게시글에 좋아요를 추가한다. */
    @Operation(summary = "커뮤니티 게시글 좋아요", description = "로그인 사용자가 게시글에 좋아요를 추가합니다. 중복 좋아요는 허용되지 않습니다.")
    @PostMapping("/{postId}/likes")
    public ApiResponse<CommunityPostResponse> likePost(@PathVariable Long postId) {
        return ApiResponse.ok(communityService.likePost(postId));
    }

    /** 게시글 좋아요를 취소한다. */
    @Operation(summary = "커뮤니티 게시글 좋아요 취소", description = "로그인 사용자가 게시글 좋아요를 취소합니다.")
    @DeleteMapping("/{postId}/likes")
    public ApiResponse<CommunityPostResponse> unlikePost(@PathVariable Long postId) {
        return ApiResponse.ok(communityService.unlikePost(postId));
    }
}

