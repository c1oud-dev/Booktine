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

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @InjectMocks
    private AdminService adminService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Test
    @DisplayName("관리자 사용자 목록 조회 성공")
    void getUsers_success() {
        // given
        User user = User.builder().email("u@test.com").nickname("tester").password("pw").build();
        ReflectionTestUtils.setField(user, "id", 1L);
        PageRequest pageable = PageRequest.of(0, 10);
        given(userRepository.findAll(pageable)).willReturn(new PageImpl<>(List.of(user)));

        // when
        Page<UserResponse> result = adminService.getUsers(pageable);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).id()).isEqualTo(1L);
    }

    @Test
    @DisplayName("관리자 게시물 목록 조회 성공")
    void getPosts_success() {
        // given
        User user = User.builder().email("u@test.com").nickname("tester").password("pw").build();
        ReflectionTestUtils.setField(user, "id", 1L);
        Post post = Post.builder().title("책 제목").author("저자").genre("장르").publisher("출판사")
                .publishedDate(LocalDate.of(2026, 1, 1)).summary("요약")
                .readingStatus(ReadingStatus.READING).user(user).build();
        ReflectionTestUtils.setField(post, "id", 2L);
        PageRequest pageable = PageRequest.of(0, 10);
        given(postRepository.findAll(pageable)).willReturn(new PageImpl<>(List.of(post)));

        // when
        Page<PostResponse> result = adminService.getPosts(pageable);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).id()).isEqualTo(2L);
    }
}

