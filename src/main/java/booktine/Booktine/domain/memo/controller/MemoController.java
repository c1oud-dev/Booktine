package booktine.Booktine.domain.memo.controller;

import booktine.Booktine.domain.memo.dto.MemoCreateRequest;
import booktine.Booktine.domain.memo.dto.MemoResponse;
import booktine.Booktine.domain.memo.dto.MemoUpdateRequest;
import booktine.Booktine.domain.memo.service.MemoService;
import booktine.Booktine.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

/**
 * 게시물 메모 관련 HTTP API 엔드포인트를 제공하는 컨트롤러.
 * 인증 적용 전까지 userId RequestParam으로 소유권 기반 메모 기능을 테스트한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/posts/{postId}/memos")
public class MemoController {

    private final MemoService memoService;

    /**
     * 게시물별 메모 목록을 조회한다.
     */
    @GetMapping
    public ApiResponse<Page<MemoResponse>> getMemos(@RequestParam Long userId, @PathVariable Long postId, Pageable pageable) {
        return ApiResponse.ok(memoService.getMemos(userId, postId, pageable));
    }

    /**
     * 게시물에 새로운 메모를 생성한다.
     */
    @PostMapping
    public ApiResponse<MemoResponse> createMemo(@RequestParam Long userId, @PathVariable Long postId,
                                                @RequestBody MemoCreateRequest request) {
        return ApiResponse.ok(memoService.createMemo(userId, postId, request));
    }

    /**
     * 게시물의 특정 메모를 수정한다.
     */
    @PutMapping("/{id}")
    public ApiResponse<MemoResponse> updateMemo(@RequestParam Long userId, @PathVariable Long postId,
                                                @PathVariable Long id, @RequestBody MemoUpdateRequest request) {
        return ApiResponse.ok(memoService.updateMemo(userId, postId, id, request));
    }

    /**
     * 게시물의 특정 메모를 삭제한다.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMemo(@RequestParam Long userId, @PathVariable Long postId, @PathVariable Long id) {
        memoService.deleteMemo(userId, postId, id);
        return ApiResponse.ok();
    }
}
