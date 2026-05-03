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
 * 게시물 상세 화면에서 사용하는 메모 CRUD API를 제공하며,
 * 각 요청은 인증 사용자 ID를 기준으로 서비스 계층에서 소유권 검증을 수행한다.
 * */
@RestController
@RequiredArgsConstructor
@RequestMapping("/posts/{postId}/memos")
@Tag(name = "메모", description = "메모 관련 API")
public class MemoController {

    private final MemoService memoService;

    /** 특정 게시물의 메모 목록을 페이지 단위로 조회한다.
     *
     * @param postId 조회 대상 게시물 ID
     * @param pageable 페이지 정보
     * @return 메모 목록 페이지 응답
     */
    @Operation(summary = "게시물 메모 목록 조회", description = "특정 게시물에 작성된 메모 목록을 페이지 단위로 조회합니다.")
    @GetMapping
    public ApiResponse<Page<MemoResponse>> getMemos(@PathVariable Long postId, Pageable pageable) {
        return ApiResponse.ok(memoService.getMemos(getCurrentUserId(), postId, pageable));
    }

    /**
     * 특정 게시물에 새로운 메모를 생성한다.
     *
     * @param postId 생성 대상 게시물 ID
     * @param request 메모 생성 요청 데이터
     * @return 생성된 메모 응답
     */
    @Operation(summary = "게시물 메모 작성", description = "특정 게시물에 새로운 메모를 작성합니다.")
    @PostMapping
    public ApiResponse<MemoResponse> createMemo(@PathVariable Long postId, @RequestBody MemoCreateRequest request) {
        return ApiResponse.ok(memoService.createMemo(getCurrentUserId(), postId, request));
    }

    /**
     * 특정 게시물의 메모를 수정한다.
     *
     * @param postId 게시물 ID
     * @param memoId 수정할 메모 ID
     * @param request 메모 수정 요청 데이터
     * @return 수정된 메모 응답
     */
    @Operation(summary = "게시물 메모 수정", description = "특정 게시물의 메모 내용을 수정합니다.")
    @PutMapping("/{memoId}")
    public ApiResponse<MemoResponse> updateMemo(@PathVariable Long postId,
                                                @PathVariable Long memoId,
                                                @RequestBody MemoUpdateRequest request) {
        return ApiResponse.ok(memoService.updateMemo(getCurrentUserId(), postId, memoId, request));
    }

    /**
     * 특정 게시물의 메모를 삭제한다.
     *
     * @param postId 게시물 ID
     * @param memoId 삭제할 메모 ID
     * @return 본문 없는 성공 응답
     */
    @Operation(summary = "게시물 메모 삭제", description = "특정 게시물의 메모를 삭제합니다.")
    @DeleteMapping("/{memoId}")
    public ApiResponse<Void> deleteMemo(@PathVariable Long postId, @PathVariable Long memoId) {
        memoService.deleteMemo(getCurrentUserId(), postId, memoId);
        return ApiResponse.ok();
    }

    /**
     * 현재 인증된 사용자 ID를 조회한다.
     *
     * @return 인증 사용자 ID
     */
    private Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }
}
