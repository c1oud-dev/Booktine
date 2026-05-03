package booktine.Booktine.domain.memo.service;

import booktine.Booktine.domain.memo.dto.MemoCreateRequest;
import booktine.Booktine.domain.memo.dto.MemoResponse;
import booktine.Booktine.domain.memo.dto.MemoUpdateRequest;
import booktine.Booktine.domain.memo.entity.Memo;
import booktine.Booktine.domain.memo.repository.MemoRepository;
import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 메모 도메인의 비즈니스 로직을 처리하는 서비스.
 * 게시물 소유권을 먼저 검증한 뒤 메모 생성/조회/수정/삭제를 수행하며,
 * 권한이나 리소스가 유효하지 않은 경우 CustomException으로 예외를 표준화한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemoService {

    private final MemoRepository memoRepository;
    private final PostRepository postRepository;

    /**
     * 게시물 소유권을 검증한 뒤 새로운 메모를 생성한다.
     *
     * @param userId 요청 사용자 ID
     * @param postId 메모를 작성할 게시물 ID
     * @param request 메모 생성 요청 데이터
     * @return 생성된 메모 응답 DTO
     */
    @Transactional
    public MemoResponse createMemo(Long userId, Long postId, MemoCreateRequest request) {
        Post ownedPost = findOwnedPost(userId, postId);
        Memo memo = Memo.builder()
                .post(ownedPost)
                .content(request.content())
                .page(request.page())
                .build();

        Memo savedMemo = memoRepository.save(memo);
        return MemoResponse.from(savedMemo);
    }

    /**
     * 게시물 소유권을 검증한 뒤 해당 게시물의 메모 목록을 조회한다.
     *
     * @param userId 요청 사용자 ID
     * @param postId 조회할 게시물 ID
     * @param pageable 페이지 정보
     * @return 메모 응답 페이지
     */
    public Page<MemoResponse> getMemos(Long userId, Long postId, Pageable pageable) {
        findOwnedPost(userId, postId);
        return memoRepository.findAllByPostId(postId, pageable)
                .map(MemoResponse::from);
    }

    /**
     * 메모 소유권을 검증한 뒤 메모 내용을 수정한다.
     *
     * @param userId 요청 사용자 ID
     * @param postId 메모가 속한 게시물 ID
     * @param memoId 수정할 메모 ID
     * @param request 메모 수정 요청 데이터
     * @return 수정된 메모 응답 DTO
     */
    @Transactional
    public MemoResponse updateMemo(Long userId, Long postId, Long memoId, MemoUpdateRequest request) {
        Memo memo = findMemoById(memoId);
        validateMemoOwnership(userId, postId, memo);

        memo.update(request.content(), request.page());
        return MemoResponse.from(memo);
    }

    /**
     * 메모 소유권을 검증한 뒤 메모를 삭제한다.
     *
     * @param userId 요청 사용자 ID
     * @param postId 메모가 속한 게시물 ID
     * @param memoId 삭제할 메모 ID
     */
    @Transactional
    public void deleteMemo(Long userId, Long postId, Long memoId) {
        Memo memo = findMemoById(memoId);
        validateMemoOwnership(userId, postId, memo);
        memoRepository.delete(memo);
    }

    /**
     * 메모 ID로 메모 엔티티를 조회한다.
     *
     * @param memoId 조회할 메모 ID
     * @return 조회된 메모 엔티티
     * */
    private Memo findMemoById(Long memoId) {
        return memoRepository.findById(memoId)
                .orElseThrow(() -> new CustomException(ErrorCode.MEMO_NOT_FOUND));
    }

    /**
     * 게시물 존재 여부와 사용자 소유 여부를 함께 검증한다.
     *
     * @param userId 요청 사용자 ID
     * @param postId 검증할 게시물 ID
     * @return 소유권이 확인된 게시물 엔티티
     */
    private Post findOwnedPost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));
        if (!post.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        return post;
    }

    /**
     * 메모가 요청 게시물에 속하고 요청 사용자 소유인지 검증한다.
     *
     * @param userId 요청 사용자 ID
     * @param postId 요청 게시물 ID
     * @param memo 검증할 메모 엔티티
     */
    private void validateMemoOwnership(Long userId, Long postId, Memo memo) {
        if (!memo.getPost().getId().equals(postId)) {
            throw new CustomException(ErrorCode.MEMO_NOT_FOUND);
        }

        if (!memo.getPost().getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
    }
}
