package booktine.Booktine.domain.memo.controller;

import booktine.Booktine.domain.memo.dto.MemoCreateRequest;
import booktine.Booktine.domain.memo.dto.MemoResponse;
import booktine.Booktine.domain.memo.dto.MemoUpdateRequest;
import booktine.Booktine.domain.memo.service.MemoService;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

/**
 * 메모 API를 제공하는 컨트롤러로,
 * 인증 컨텍스트의 userId를 기준으로 소유권을 검증한다.
 * */
@RestController
@RequiredArgsConstructor
@RequestMapping("/posts/{postId}/memos")
@Tag(name = "메모", description = "메모 관련 API")
public class MemoController {

    private final MemoService memoService;

    /** 게시물별 메모 목록을 조회한다. */
    @Operation(summary = "게시물 메모 목록 조회", description = "특정 게시물에 작성된 메모 목록을 페이지 단위로 조회합니다.")
    @GetMapping
    public ApiResponse<Page<MemoResponse>> getMemos(@PathVariable Long postId, Pageable pageable) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(memoService.getMemos(userId, postId, pageable));
    }

    /** 게시물에 새로운 메모를 생성한다. */
    @Operation(summary = "게시물 메모 작성", description = "특정 게시물에 새로운 메모를 작성합니다.")
    @PostMapping
    public ApiResponse<MemoResponse> createMemo(@PathVariable Long postId, @RequestBody MemoCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(memoService.createMemo(userId, postId, request));
    }

    /** 게시물의 특정 메모를 수정한다. */
    @Operation(summary = "게시물 메모 수정", description = "특정 게시물의 메모 내용을 수정합니다.")
    @PutMapping("/{id}")
    public ApiResponse<MemoResponse> updateMemo(@PathVariable Long postId, @PathVariable Long id,
                                                @RequestBody MemoUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.ok(memoService.updateMemo(userId, postId, id, request));
    }

    /** 게시물의 특정 메모를 삭제한다. */
    @Operation(summary = "게시물 메모 삭제", description = "특정 게시물의 메모를 삭제합니다.")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMemo(@PathVariable Long postId, @PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        memoService.deleteMemo(userId, postId, id);
        return ApiResponse.ok();
    }
}
