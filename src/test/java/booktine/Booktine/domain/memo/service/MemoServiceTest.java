package booktine.Booktine.domain.memo.service;

import booktine.Booktine.domain.memo.dto.MemoCreateRequest;
import booktine.Booktine.domain.memo.dto.MemoResponse;
import booktine.Booktine.domain.memo.dto.MemoUpdateRequest;
import booktine.Booktine.domain.memo.entity.Memo;
import booktine.Booktine.domain.memo.repository.MemoRepository;
import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.user.entity.User;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MemoServiceTest {

    @InjectMocks
    MemoService memoService;

    @Mock
    MemoRepository memoRepository;

    @Mock
    PostRepository postRepository;

    @Test
    @DisplayName("메모 생성 성공")
    void createMemo_success() {
        // given
        Post post = createPost(1L, 1L);
        MemoCreateRequest req = new MemoCreateRequest("내용", 12);
        Memo memo = Memo.builder().post(post).content("내용").page(12).build();
        ReflectionTestUtils.setField(memo, "id", 10L);

        given(postRepository.findById(1L)).willReturn(Optional.of(post));
        given(memoRepository.save(any())).willReturn(memo);

        // when
        MemoResponse res = memoService.createMemo(1L, 1L, req);

        // then
        assertThat(res.id()).isEqualTo(10L);
    }

    @Test
    @DisplayName("메모 목록 조회 성공")
    void getMemos_success() {
        // given
        Post post = createPost(1L, 1L);
        Memo memo = Memo.builder().post(post).content("내용").page(1).build();
        ReflectionTestUtils.setField(memo, "id", 2L);

        given(postRepository.findById(1L)).willReturn(Optional.of(post));
        given(memoRepository.findAllByPostId(1L)).willReturn(List.of(memo));

        // when
        List<MemoResponse> res = memoService.getMemos(1L, 1L);

        // then
        assertThat(res).hasSize(1);
    }

    @Test
    @DisplayName("메모 수정 성공")
    void updateMemo_success() {
        // given
        Memo memo = createMemo(3L, 1L, 1L);
        given(memoRepository.findById(3L)).willReturn(Optional.of(memo));

        // when
        MemoResponse res = memoService.updateMemo(1L, 1L, 3L, new MemoUpdateRequest("수정", 7));

        // then
        assertThat(res.content()).isEqualTo("수정");
    }

    @Test
    @DisplayName("메모 삭제 성공")
    void deleteMemo_success() {
        // given
        Memo memo = createMemo(3L, 1L, 1L);
        given(memoRepository.findById(3L)).willReturn(Optional.of(memo));

        // when
        memoService.deleteMemo(1L, 1L, 3L);

        // then
        verify(memoRepository, times(1)).delete(memo);
    }

    @Test
    @DisplayName("본인 메모가 아닌 경우 수정 시 예외 발생")
    void updateMemo_forbidden() {
        // given
        Memo memo = createMemo(3L, 1L, 2L);
        given(memoRepository.findById(3L)).willReturn(Optional.of(memo));

        // when & then
        assertThatThrownBy(() -> memoService.updateMemo(1L, 1L, 3L, new MemoUpdateRequest("x", 1)))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FORBIDDEN);
    }

    @Test
    @DisplayName("본인 메모가 아닌 경우 삭제 시 예외 발생")
    void deleteMemo_forbidden() {
        // given
        Memo memo = createMemo(3L, 1L, 2L);
        given(memoRepository.findById(3L)).willReturn(Optional.of(memo));

        // when & then
        assertThatThrownBy(() -> memoService.deleteMemo(1L, 1L, 3L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FORBIDDEN);
    }

    private Post createPost(Long postId, Long userId) {
        User user = User.builder()
                .email("e")
                .password("p")
                .nickname("n")
                .build();
        ReflectionTestUtils.setField(user, "id", userId);

        Post post = Post.builder()
                .title("t")
                .author("a")
                .genre("g")
                .publisher("p")
                .publishedDate(LocalDate.now())
                .summary("s")
                .readingStatus(ReadingStatus.READING)
                .user(user)
                .build();
        ReflectionTestUtils.setField(post, "id", postId);

        return post;
    }

    private Memo createMemo(Long memoId, Long postId, Long userId) {
        Memo memo = Memo.builder()
                .post(createPost(postId, userId))
                .content("c")
                .page(1)
                .build();
        ReflectionTestUtils.setField(memo, "id", memoId);

        return memo;
    }
}