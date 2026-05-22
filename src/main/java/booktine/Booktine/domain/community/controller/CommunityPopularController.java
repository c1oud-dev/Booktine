package booktine.Booktine.domain.community.controller;

import booktine.Booktine.domain.community.dto.CommunityPostResponse;
import booktine.Booktine.domain.community.service.CommunityService;
import booktine.Booktine.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 커뮤니티 인기 게시글 API를 제공하는 컨트롤러.
 * 좋아요 수/댓글 수 기준 인기 게시글 목록을 조회한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/community/popular")
@Tag(name = "커뮤니티", description = "독서 커뮤니티 관련 API")
public class CommunityPopularController {

    private final CommunityService communityService;

    /** 좋아요 수 기준 상위 5개 인기 게시글을 조회한다. */
    @Operation(summary = "좋아요 기준 인기 게시글 조회", description = "좋아요 수 기준으로 커뮤니티 인기 게시글 상위 5개를 조회합니다.")
    @GetMapping("/likes")
    public ApiResponse<List<CommunityPostResponse>> getPopularPostsByLikes() {
        return ApiResponse.ok(communityService.getPopularPostsByLikes());
    }

    /** 댓글 수 기준 상위 5개 인기 게시글을 조회한다. */
    @Operation(summary = "댓글 기준 인기 게시글 조회", description = "댓글 수 기준으로 커뮤니티 인기 게시글 상위 5개를 조회합니다.")
    @GetMapping("/comments")
    public ApiResponse<List<CommunityPostResponse>> getPopularPostsByComments() {
        return ApiResponse.ok(communityService.getPopularPostsByComments());
    }
}

