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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

/**
 * PostService 단위 테스트.
 * Mockito 기반으로 리포지토리를 Mock 처리하여 게시물 서비스 로직을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @InjectMocks
    private PostService postService;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    /**
     * 게시물 생성이 정상 동작하는지 검증한다.
     */
    @Test
    @DisplayName("게시물 생성 성공")
    void createPost_success() {
        // given
        User user = createUser(1L);
        PostCreateRequest request = new PostCreateRequest("제목", "저자", "장르", "출판사",
                LocalDate.of(2024, 1, 1), "요약", ReadingStatus.READING, null, null, null, null, 12, 320);
        given(userRepository.getReferenceById(1L)).willReturn(user);

        Post post = Post.builder()
                .title(request.title()).author(request.author()).genre(request.genre()).publisher(request.publisher())
                .publishedDate(request.publishedDate()).summary(request.summary()).readingStatus(request.readingStatus())
                .completedDate(request.completedDate()).currentPage(request.currentPage()).totalPage(request.totalPage()).user(user).build();
        ReflectionTestUtils.setField(post, "id", 10L);
        given(postRepository.save(any(Post.class))).willReturn(post);

        // when
        PostResponse response = postService.createPost(1L, request);

        // then
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.currentPage()).isEqualTo(12);
        assertThat(response.totalPage()).isEqualTo(320);
        verify(postRepository, times(1)).save(any(Post.class));
    }

    @Test
    @DisplayName("완독이 아닌 상태에서 별점을 입력하면 예외 발생")
    void createPost_ratingForNotCompleted_throwsException() {
        // given
        User user = createUser(1L);
        PostCreateRequest request = new PostCreateRequest("제목", "저자", "장르", "출판사",
                LocalDate.of(2024, 1, 1), "요약", ReadingStatus.READING, null, null, 4.0, "한줄평", 12, 320);
        given(userRepository.getReferenceById(1L)).willReturn(user);

        // when // then
        assertThatThrownBy(() -> postService.createPost(1L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_INPUT);
    }

    @Test
    @DisplayName("0.5 단위가 아닌 별점을 입력하면 예외 발생")
    void createPost_invalidRatingStep_throwsException() {
        // given
        User user = createUser(1L);
        PostCreateRequest request = new PostCreateRequest("제목", "저자", "장르", "출판사",
                LocalDate.of(2024, 1, 1), "요약", ReadingStatus.COMPLETED, null, null, 4.2, "한줄평", 12, 320);
        given(userRepository.getReferenceById(1L)).willReturn(user);

        // when // then
        assertThatThrownBy(() -> postService.createPost(1L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_INPUT);
    }

    /**
     * 사용자별 게시물 목록 조회가 정상 동작하는지 검증한다.
     */
    @Test
    @DisplayName("게시물 목록 조회 성공")
    void getPostsByUserId_success() {
        // given
        User user = createUser(1L);
        Post post = createPost(11L, user, "목록제목");
        PageRequest pageable = PageRequest.of(0, 10);
        given(postRepository.findAllByUserId(1L, pageable)).willReturn(new PageImpl<>(List.of(post)));

        // when
        Page<PostResponse> responses = postService.getPostsByUserId(1L, pageable);

        // then
        assertThat(responses.getContent()).hasSize(1);
        assertThat(responses.getContent().get(0).title()).isEqualTo("목록제목");
    }

    /**
     * 게시물 상세 조회가 정상 동작하는지 검증한다.
     */
    @Test
    @DisplayName("게시물 상세 조회 성공")
    void getPost_success() {
        // given
        User user = createUser(1L);
        Post post = createPost(21L, user, "상세제목");
        given(postRepository.findWithUserById(21L)).willReturn(java.util.Optional.of(post));

        // when
        PostResponse response = postService.getPost(21L);

        // then
        assertThat(response.id()).isEqualTo(21L);
        assertThat(response.title()).isEqualTo("상세제목");
    }

    /**
     * 게시물 수정이 정상 동작하는지 검증한다.
     */
    @Test
    @DisplayName("게시물 수정 성공")
    void updatePost_success() {
        // given
        User user = createUser(1L);
        Post post = createPost(31L, user, "수정전");
        PostUpdateRequest request = new PostUpdateRequest("수정후", "새저자", "새장르", "새출판사",
                LocalDate.of(2025, 1, 1), "새요약", ReadingStatus.COMPLETED, LocalDate.of(2025, 1, 3), LocalDate.of(2025, 2, 2), 4.5, "좋아요", 320, 320);
        given(postRepository.findWithUserByIdAndUserId(31L, 1L)).willReturn(java.util.Optional.of(post));

        // when
        PostResponse response = postService.updatePost(1L, 31L, request);

        // then
        assertThat(response.title()).isEqualTo("수정후");
        assertThat(response.readingStatus()).isEqualTo(ReadingStatus.COMPLETED);
        assertThat(response.currentPage()).isEqualTo(320);
        assertThat(response.totalPage()).isEqualTo(320);
        assertThat(response.startDate()).isEqualTo(LocalDate.of(2025, 1, 3));
        assertThat(response.rating()).isEqualTo(4.5);
        assertThat(response.shortReview()).isEqualTo("좋아요");
    }

    /**
     * 게시물 삭제가 정상 동작하는지 검증한다.
     */
    @Test
    @DisplayName("게시물 삭제 성공")
    void deletePost_success() {
        // given
        User user = createUser(1L);
        Post post = createPost(41L, user, "삭제대상");
        given(postRepository.findWithUserByIdAndUserId(41L, 1L)).willReturn(java.util.Optional.of(post));

        // when
        postService.deletePost(1L, 41L);

        // then
        verify(postRepository, times(1)).delete(post);
    }

    /**
     * 타 사용자 게시물 접근 시 예외가 발생하는지 검증한다.
     */
    @Test
    @DisplayName("다른 유저 게시물 접근 시 예외 발생")
    void updatePost_forbidden() {
        // given
        User owner = createUser(1L);
        Post post = createPost(51L, owner, "권한게시물");
        PostUpdateRequest request = new PostUpdateRequest("수정시도", "저자", "장르", "출판사",
                LocalDate.of(2024, 1, 1), "요약", ReadingStatus.READING, null, null, null, null, 12, 320);
        given(postRepository.findWithUserByIdAndUserId(51L, 2L)).willReturn(java.util.Optional.empty());
        given(postRepository.existsById(51L)).willReturn(true);

        // when // then
        assertThatThrownBy(() -> postService.updatePost(2L, 51L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FORBIDDEN);
    }

    @Test
    @DisplayName("현재 페이지가 전체 페이지보다 크면 예외 발생")
    void updatePost_invalidPageRange_throwsException() {
        // given
        User user = createUser(1L);
        Post post = createPost(61L, user, "페이지검증");
        PostUpdateRequest request = new PostUpdateRequest("수정", "저자", "장르", "출판사",
                LocalDate.of(2024, 1, 1), "요약", ReadingStatus.READING, null, null, null, null, 101, 100);
        given(postRepository.findWithUserByIdAndUserId(61L, 1L)).willReturn(java.util.Optional.of(post));

        // when // then
        assertThatThrownBy(() -> postService.updatePost(1L, 61L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_INPUT);
    }

    /**
     * 테스트용 사용자 엔티티를 생성한다.
     */
    private User createUser(Long id) {
        User user = User.builder().email("user@test.com").password("pw").nickname("nick").build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    /**
     * 테스트용 게시물 엔티티를 생성한다.
     */
    private Post createPost(Long id, User user, String title) {
        Post post = Post.builder()
                .title(title)
                .author("저자")
                .genre("장르")
                .publisher("출판사")
                .publishedDate(LocalDate.of(2024, 1, 1))
                .summary("요약")
                .readingStatus(ReadingStatus.READING)
                .startDate(null)
                .completedDate(null)
                .rating(null)
                .shortReview(null)
                .currentPage(30)
                .totalPage(300)
                .user(user)
                .build();
        ReflectionTestUtils.setField(post, "id", id);
        return post;
    }

    @Test
    @DisplayName("키워드로 게시물 검색 성공")
    void searchPosts_byKeyword() {
        // given
        User user = createUser(1L);
        Post post = createPost(1L, user, "제목");
        given(postRepository.searchPosts(1L, "제목", null)).willReturn(List.of(post));

        // when
        List<PostResponse> res = postService.searchPosts(1L, "제목", null);

        // then
        assertThat(res).hasSize(1);
    }

    @Test
    @DisplayName("독서 상태로 게시물 필터 성공")
    void searchPosts_byStatus() {
        // given
        User user = createUser(1L);
        Post post = createPost(1L, user, "제목");
        given(postRepository.searchPosts(1L, null, ReadingStatus.READING)).willReturn(List.of(post));

        // when
        List<PostResponse> res = postService.searchPosts(1L, null, ReadingStatus.READING);

        // then
        assertThat(res).hasSize(1);
    }
}

