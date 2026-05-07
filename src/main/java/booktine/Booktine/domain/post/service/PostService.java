package booktine.Booktine.domain.post.service;

import booktine.Booktine.domain.post.dto.PostCreateRequest;
import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.post.dto.PostUpdateRequest;
import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 게시물 도메인의 핵심 비즈니스 로직을 처리하는 서비스.
 * 게시물 CRUD, 사용자 소유권 검증, 검색 처리 흐름에서 사용된다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    /** 사용자 ID 기준으로 게시물을 생성하고 응답 DTO로 반환한다. */
    @Transactional
    public PostResponse createPost(Long userId, PostCreateRequest request) {
        User user = userRepository.getReferenceById(userId);
        validateReadingDetails(request.readingStatus(), request.startDate(), request.completedDate(),
                request.rating(), request.shortReview(), request.currentPage(), request.totalPage());
        Post post = buildPost(request, user);

        return PostResponse.from(postRepository.save(post));
    }

    /** 사용자 ID 기준으로 게시물 목록을 조회한다. */
    public Page<PostResponse> getPostsByUserId(Long userId, Pageable pageable) {
        return postRepository.findAllByUserId(userId, pageable)
                .map(PostResponse::from);
    }

    /** 게시물 ID 기준으로 상세 정보를 조회한다. */
    public PostResponse getPost(Long postId) {
        return PostResponse.from(getPostWithUserById(postId));
    }

    /** 게시물 소유권을 검증한 뒤 수정 요청 내용을 반영한다. */
    @Transactional
    public PostResponse updatePost(Long userId, Long postId, PostUpdateRequest request) {
        Post post = getOwnedPost(userId, postId);
        validateReadingDetails(request.readingStatus(), request.startDate(), request.completedDate(),
                request.rating(), request.shortReview(), request.currentPage(), request.totalPage());
        post.updateDetails(
                request.title(),
                request.author(),
                request.genre(),
                request.publisher(),
                request.publishedDate(),
                request.summary(),
                request.readingStatus(),
                request.startDate(),
                request.completedDate(),
                request.rating(),
                request.shortReview(),
                request.currentPage(),
                request.totalPage()
        );
        return PostResponse.from(post);
    }

    /** 게시물 소유권을 검증한 뒤 게시물을 삭제한다. */
    @Transactional
    public void deletePost(Long userId, Long postId) {
        postRepository.delete(getOwnedPost(userId, postId));
    }

    /** 키워드와 독서 상태를 조건으로 게시물을 검색한다. */
    public List<PostResponse> searchPosts(Long userId, String keyword, ReadingStatus status) {
        return postRepository.searchPosts(userId, keyword, status).stream()
                .map(PostResponse::from)
                .toList();
    }

    /**
     * 게시물 생성에 필요한 요청값과 사용자 정보를 기반으로 엔티티를 구성한다.
     */
    private Post buildPost(PostCreateRequest request, User user) {
        return Post.builder()
                .title(request.title())
                .coverImageUrl(null)
                .author(request.author())
                .genre(request.genre())
                .publisher(request.publisher())
                .publishedDate(request.publishedDate())
                .summary(request.summary())
                .readingStatus(request.readingStatus())
                .startDate(request.startDate())
                .completedDate(request.completedDate())
                .rating(request.rating())
                .shortReview(request.shortReview())
                .currentPage(request.currentPage())
                .totalPage(request.totalPage())
                .user(user)
                .build();
    }

    /** 독서 상태별 날짜, 별점, 한줄평, 페이지 입력 규칙을 검증한다. */
    private void validateReadingDetails(ReadingStatus readingStatus, LocalDate startDate,
                                        LocalDate completedDate, Double rating, String shortReview,
                                        Integer currentPage, Integer totalPage) {
        validatePageRange(currentPage, totalPage);
        validateDateRange(startDate, completedDate);
        validateWishlistDetails(readingStatus, startDate, completedDate, rating, shortReview, currentPage);
        validateCompletedDetails(readingStatus, completedDate, rating, shortReview);
    }

    /** 읽고 싶은 책 상태에는 실제 독서 진행 정보가 포함될 수 없다. */
    private void validateWishlistDetails(ReadingStatus readingStatus, LocalDate startDate,
                                         LocalDate completedDate, Double rating, String shortReview,
                                         Integer currentPage) {
        if (readingStatus == ReadingStatus.WISHLIST
                && (startDate != null || completedDate != null || rating != null || hasText(shortReview) || currentPage != null)) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
    }

    /** 완독 상태의 완료일 필수 여부와 완독 전용 회고 입력 규칙을 검증한다. */
    private void validateCompletedDetails(ReadingStatus readingStatus, LocalDate completedDate,
                                          Double rating, String shortReview) {
        if (readingStatus == ReadingStatus.COMPLETED && completedDate == null) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
        if (readingStatus != ReadingStatus.COMPLETED && (rating != null || hasText(shortReview))) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
        validateRating(rating);
    }

    /** 별점은 0.5 단위, 0.5~5.0 범위로 입력할 수 있다. */
    private void validateRating(Double rating) {
        if (rating == null) {
            return;
        }

        double doubledRating = rating * 2;
        boolean isHalfStep = Math.abs(doubledRating - Math.round(doubledRating)) < 0.000001;
        if (rating < 0.5 || rating > 5.0 || !isHalfStep) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
    }

    /** 완료일이 시작일보다 빠르면 잘못된 입력 예외를 발생시킨다. */
    private void validateDateRange(LocalDate startDate, LocalDate completedDate) {
        if (startDate != null && completedDate != null && completedDate.isBefore(startDate)) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
    }

    /** 현재 페이지가 전체 페이지를 초과하면 잘못된 입력 예외를 발생시킨다. */
    private void validatePageRange(Integer currentPage, Integer totalPage) {
        if (currentPage != null && totalPage != null && currentPage > totalPage) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
    }

    /** 문자열에 공백 외 내용이 있는지 확인한다. */
    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    /** 게시물 ID로 게시물 엔티티를 조회하고 없으면 예외를 발생시킨다. */
    private Post getPostWithUserById(Long postId) {
        return postRepository.findWithUserById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));
    }

    /** 사용자 소유 게시물을 한 번의 조회로 검증하고 반환한다. */
    private Post getOwnedPost(Long userId, Long postId) {
        return postRepository.findWithUserByIdAndUserId(postId, userId)
                .orElseThrow(() -> resolveMissingOwnedPost(postId));
    }

    /** 게시물 미존재와 권한 부족을 구분해 기존 API 오류 의미를 유지한다. */
    private CustomException resolveMissingOwnedPost(Long postId) {
        if (postRepository.existsById(postId)) {
            return new CustomException(ErrorCode.FORBIDDEN);
        }
        return new CustomException(ErrorCode.POST_NOT_FOUND);
    }
}
