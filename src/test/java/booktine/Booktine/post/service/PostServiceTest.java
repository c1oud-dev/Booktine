package booktine.Booktine.post.service;

import booktine.Booktine.domain.post.dto.PostCreateRequest;
import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.post.dto.PostUpdateRequest;
import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.post.service.PostService;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
                LocalDate.of(2024, 1, 1), "요약", ReadingStatus.READING, null);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        Post post = Post.builder()
                .title(request.title()).author(request.author()).genre(request.genre()).publisher(request.publisher())
                .publishedDate(request.publishedDate()).summary(request.summary()).readingStatus(request.readingStatus())
                .completedDate(request.completedDate()).user(user).build();
        ReflectionTestUtils.setField(post, "id", 10L);
        given(postRepository.save(any(Post.class))).willReturn(post);

        // when
        PostResponse response = postService.createPost(1L, request);

        // then
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.userId()).isEqualTo(1L);
        verify(postRepository, times(1)).save(any(Post.class));
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
        given(postRepository.findAllByUserId(1L)).willReturn(List.of(post));

        // when
        List<PostResponse> responses = postService.getPostsByUserId(1L);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).title()).isEqualTo("목록제목");
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
        given(postRepository.findById(21L)).willReturn(Optional.of(post));

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
                LocalDate.of(2025, 1, 1), "새요약", ReadingStatus.COMPLETED, LocalDate.of(2025, 2, 2));
        given(postRepository.findById(31L)).willReturn(Optional.of(post));

        // when
        PostResponse response = postService.updatePost(1L, 31L, request);

        // then
        assertThat(response.title()).isEqualTo("수정후");
        assertThat(response.readingStatus()).isEqualTo(ReadingStatus.COMPLETED);
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
        given(postRepository.findById(41L)).willReturn(Optional.of(post));

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
                LocalDate.of(2024, 1, 1), "요약", ReadingStatus.READING, null);
        given(postRepository.findById(51L)).willReturn(Optional.of(post));

        // when // then
        assertThatThrownBy(() -> postService.updatePost(2L, 51L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FORBIDDEN);
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
                .completedDate(null)
                .user(user)
                .build();
        ReflectionTestUtils.setField(post, "id", id);
        return post;
    }
}

