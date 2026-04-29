package booktine.Booktine.domain.post.service;

import booktine.Booktine.domain.post.dto.PostCreateRequest;
import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.post.dto.PostUpdateRequest;
import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 게시물 도메인 비즈니스 로직을 처리하는 서비스.
 * 게시물 CRUD와 사용자 소유권 검증을 담당한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /**
     * 사용자 ID 기준으로 게시물을 생성한다.
     */
    @Transactional
    public PostResponse createPost(Long userId, PostCreateRequest request) {
        User user = getUserById(userId);
        Post post = Post.builder()
                .title(request.title())
                .coverImageUrl(null)
                .author(request.author())
                .genre(request.genre())
                .publisher(request.publisher())
                .publishedDate(request.publishedDate())
                .summary(request.summary())
                .readingStatus(request.readingStatus())
                .completedDate(request.completedDate()).user(user).build();

        return PostResponse.from(postRepository.save(post));
    }

    /**
     * 사용자 ID 기준으로 게시물 목록을 조회한다.
     */
    public List<PostResponse> getPostsByUserId(Long userId) {
        return postRepository.findAllByUserId(userId).stream()
                .map(PostResponse::from)
                .toList();
    }

    /**
     * 게시물 ID 기준으로 상세 정보를 조회한다.
     */
    public PostResponse getPost(Long postId) {
        return PostResponse.from(getPostById(postId));
    }

    /**
     * 게시물 소유권을 검증한 뒤 정보를 수정한다.
     */
    @Transactional
    public PostResponse updatePost(Long userId, Long postId, PostUpdateRequest request) {
        Post post = getPostById(postId);
        validatePostOwner(userId, post);
        post.update(request.title(), request.author(), request.genre(), request.publisher(),
                request.publishedDate(), request.summary(), request.readingStatus(), request.completedDate());
        return PostResponse.from(post);
    }

    /**
     * 게시물 소유권을 검증한 뒤 게시물을 삭제한다.
     */
    @Transactional
    public void deletePost(Long userId, Long postId) {
        Post post = getPostById(postId);
        validatePostOwner(userId, post);
        postRepository.delete(post);
    }

    /**
     * 게시물 ID로 엔티티를 조회하고 없으면 예외를 발생시킨다.
     */
    private Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));
    }

    /**
     * 사용자 ID로 사용자 엔티티를 조회하고 없으면 예외를 발생시킨다.
     */
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * 게시물 소유자와 요청 사용자 ID를 비교해 접근 권한을 검증한다.
     */
    private void validatePostOwner(Long userId, Post post) {
        if (!post.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
    }
}
