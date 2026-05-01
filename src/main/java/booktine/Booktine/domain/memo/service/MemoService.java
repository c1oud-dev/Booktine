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
 * 메모 도메인 비즈니스 로직을 담당하는 서비스.
 * 게시물 소유권 검증을 기반으로 메모 CRUD 기능을 제공한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemoService {

    private final MemoRepository memoRepository;
    private final PostRepository postRepository;

    /**
     * 게시물 존재 여부와 작성자 본인 여부를 확인한 뒤 메모를 생성한다.
     */
    @Transactional
    public MemoResponse createMemo(Long userId, Long postId, MemoCreateRequest request) {
        Post post = getOwnedPost(userId, postId);
        Memo memo = Memo.builder().post(post).content(request.content()).page(request.page()).build();
        return MemoResponse.from(memoRepository.save(memo));
    }

    /**
     * 게시물 존재 여부와 작성자 본인 여부를 확인한 뒤 메모 목록을 조회한다.
     */
    public Page<MemoResponse> getMemos(Long userId, Long postId, Pageable pageable) {
        getOwnedPost(userId, postId);
        return memoRepository.findAllByPostId(postId, pageable).map(MemoResponse::from);
    }

    /**
     * 메모가 속한 게시물의 소유권을 확인한 뒤 메모를 수정한다.
     */
    @Transactional
    public MemoResponse updateMemo(Long userId, Long postId, Long memoId, MemoUpdateRequest request) {
        Memo memo = getMemoById(memoId);
        validateMemoOwner(userId, postId, memo);
        memo.update(request.content(), request.page());
        return MemoResponse.from(memo);
    }

    /**
     * 메모가 속한 게시물의 소유권을 확인한 뒤 메모를 삭제한다.
     */
    @Transactional
    public void deleteMemo(Long userId, Long postId, Long memoId) {
        Memo memo = getMemoById(memoId);
        validateMemoOwner(userId, postId, memo);
        memoRepository.delete(memo);
    }

    /**
     * 메모 ID로 메모 엔티티를 조회한다.
     */
    private Memo getMemoById(Long memoId) {
        return memoRepository.findById(memoId).orElseThrow(() -> new CustomException(ErrorCode.MEMO_NOT_FOUND));
    }

    /**
     * 게시물 존재 여부와 요청 사용자 소유 여부를 검증한다.
     */
    private Post getOwnedPost(Long userId, Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));
        if (!post.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        return post;
    }

    /**
     * 메모가 요청 게시물에 속하며 요청 사용자 소유인지 검증한다.
     */
    private void validateMemoOwner(Long userId, Long postId, Memo memo) {
        if (!memo.getPost().getId().equals(postId)) {
            throw new CustomException(ErrorCode.MEMO_NOT_FOUND);
        }
        if (!memo.getPost().getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
    }
}
