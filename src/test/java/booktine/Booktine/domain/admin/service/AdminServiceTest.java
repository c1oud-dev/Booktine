package booktine.Booktine.domain.admin.service;

import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
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
import static org.mockito.BDDMockito.given;

/**
 * AdminService의 관리자 조회 기능을 검증하는 단위 테스트.
 * 사용자/게시물 페이지 조회 시 DTO 매핑 결과를 확인하기 위해 사용한다.
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @InjectMocks
    private AdminService adminService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    /**
     * 사용자 페이지 조회 시 UserResponse로 정상 변환되는지 검증한다.
     */
    @Test
    @DisplayName("관리자 사용자 목록 조회 성공")
    void getUserPage_success() {
        // given
        User user = createUser(1L);
        PageRequest pageable = PageRequest.of(0, 10);
        given(userRepository.findAll(pageable)).willReturn(new PageImpl<>(List.of(user)));

        // when
        Page<UserResponse> result = adminService.getUserPage(pageable);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).id()).isEqualTo(1L);
    }

    /**
     * 게시물 페이지 조회 시 PostResponse로 정상 변환되는지 검증한다.
     */
    @Test
    @DisplayName("관리자 게시물 목록 조회 성공")
    void getPostPage_success() {
        // given
        User user = createUser(1L);
        Post post = createPost(2L, user);
        PageRequest pageable = PageRequest.of(0, 10);
        given(postRepository.findAll(pageable)).willReturn(new PageImpl<>(List.of(post)));

        // when
        Page<PostResponse> result = adminService.getPostPage(pageable);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).id()).isEqualTo(2L);
    }

    /**
     * 테스트용 사용자 엔티티를 생성한다.
     */
    private User createUser(Long id) {
        User user = User.builder()
                .email("u@test.com")
                .nickname("tester")
                .password("pw")
                .build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    /**
     * 테스트용 게시물 엔티티를 생성한다.
     */
    private Post createPost(Long id, User user) {
        Post post = Post.builder()
                .title("책 제목")
                .author("저자")
                .genre("장르")
                .publisher("출판사")
                .publishedDate(LocalDate.of(2026, 1, 1))
                .summary("요약")
                .readingStatus(ReadingStatus.READING)
                .user(user)
                .build();
        ReflectionTestUtils.setField(post, "id", id);
        return post;
    }
}

