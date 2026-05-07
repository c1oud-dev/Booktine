package booktine.Booktine.domain.community.service;

import booktine.Booktine.domain.community.dto.*;
import booktine.Booktine.domain.community.entity.CommunityComment;
import booktine.Booktine.domain.community.entity.CommunityLike;
import booktine.Booktine.domain.community.entity.CommunityPost;
import booktine.Booktine.domain.community.repository.CommunityCommentRepository;
import booktine.Booktine.domain.community.repository.CommunityLikeRepository;
import booktine.Booktine.domain.community.repository.CommunityPostRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.security.AuthUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

/**
 * CommunityService의 게시글/댓글/좋아요 핵심 흐름을 검증하는 단위 테스트.
 */
@ExtendWith(MockitoExtension.class)
class CommunityServiceTest {

    @Mock
    private CommunityPostRepository postRepository;

    @Mock
    private CommunityCommentRepository commentRepository;

    @Mock
    private CommunityLikeRepository likeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CommunityService communityService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(new AuthUser(1L), null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("커뮤니티 게시글 생성 성공")
    void createPost_success() {
        // given
        User user = createUser(1L);
        CommunityPostCreateRequest request = new CommunityPostCreateRequest("제목", "내용");
        given(userRepository.getReferenceById(1L)).willReturn(user);
        given(postRepository.save(any(CommunityPost.class))).willAnswer(invocation -> {
            CommunityPost post = invocation.getArgument(0);
            ReflectionTestUtils.setField(post, "id", 10L);
            return post;
        });

        // when
        CommunityPostResponse response = communityService.createPost(request);

        // then
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("제목");
        assertThat(response.likeCount()).isZero();
    }

    @Test
    @DisplayName("커뮤니티 게시글 목록 조회 성공")
    void getPosts_success() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(11L, user, "목록제목");
        PageRequest pageable = PageRequest.of(0, 10);
        given(postRepository.findAll(pageable)).willReturn(new PageImpl<>(List.of(post)));
        given(likeRepository.findPostIdsByUserId(1L, List.of(11L))).willReturn(List.of(11L));

        // when
        Page<CommunityPostResponse> responses = communityService.getPosts(pageable);

        // then
        assertThat(responses.getContent()).hasSize(1);
        assertThat(responses.getContent().get(0).title()).isEqualTo("목록제목");
        assertThat(responses.getContent().get(0).isLiked()).isTrue();
        verify(likeRepository, times(1)).findPostIdsByUserId(1L, List.of(11L));
    }

    @Test
    @DisplayName("커뮤니티 게시글 목록이 비어 있으면 좋아요 목록 조회 생략")
    void getPosts_empty_skipsLikedPostLookup() {
        // given
        PageRequest pageable = PageRequest.of(0, 10);
        given(postRepository.findAll(pageable)).willReturn(Page.empty(pageable));

        // when
        Page<CommunityPostResponse> responses = communityService.getPosts(pageable);

        // then
        assertThat(responses.getContent()).isEmpty();
        verify(likeRepository, never()).findPostIdsByUserId(anyLong(), anyList());
    }

    @Test
    @DisplayName("커뮤니티 게시글 단건 조회 성공")
    void getPost_success() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(12L, user, "상세제목");
        given(postRepository.findWithUserById(12L)).willReturn(Optional.of(post));
        given(likeRepository.existsByPostIdAndUserId(12L, 1L)).willReturn(true);

        // when
        CommunityPostResponse response = communityService.getPost(12L);

        // then
        assertThat(response.id()).isEqualTo(12L);
        assertThat(response.title()).isEqualTo("상세제목");
        assertThat(response.isLiked()).isTrue();
    }

    @Test
    @DisplayName("커뮤니티 게시글 수정 성공")
    void updatePost_success() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(13L, user, "수정전");
        CommunityPostUpdateRequest request = new CommunityPostUpdateRequest("수정후", "새내용");
        given(postRepository.findWithUserByIdAndUserId(13L, 1L)).willReturn(Optional.of(post));

        // when
        CommunityPostResponse response = communityService.updatePost(13L, request);

        // then
        assertThat(response.title()).isEqualTo("수정후");
        assertThat(response.content()).isEqualTo("새내용");
    }

    @Test
    @DisplayName("다른 유저 커뮤니티 게시글 수정 시 예외 발생")
    void updatePost_forbidden() {
        // given
        CommunityPostUpdateRequest request = new CommunityPostUpdateRequest("수정", "내용");
        given(postRepository.findWithUserByIdAndUserId(14L, 1L)).willReturn(Optional.empty());
        given(postRepository.existsById(14L)).willReturn(true);

        // when // then
        assertThatThrownBy(() -> communityService.updatePost(14L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FORBIDDEN);
    }

    @Test
    @DisplayName("커뮤니티 댓글 생성 성공")
    void createComment_success() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(21L, user, "게시글");
        CommunityCommentCreateRequest request = new CommunityCommentCreateRequest("댓글", null);
        given(userRepository.getReferenceById(1L)).willReturn(user);
        given(postRepository.findWithUserById(21L)).willReturn(Optional.of(post));
        given(commentRepository.save(any(CommunityComment.class))).willAnswer(invocation -> {
            CommunityComment comment = invocation.getArgument(0);
            ReflectionTestUtils.setField(comment, "id", 31L);
            return comment;
        });

        // when
        CommunityCommentResponse response = communityService.createComment(21L, request);

        // then
        assertThat(response.id()).isEqualTo(31L);
        assertThat(response.parentId()).isNull();
        assertThat(response.depth()).isEqualTo(1);
    }

    @Test
    @DisplayName("커뮤니티 대댓글 생성 성공")
    void createReply_success() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(22L, user, "게시글");
        CommunityComment parent = createComment(32L, post, user, "부모", null);
        CommunityCommentCreateRequest request = new CommunityCommentCreateRequest("대댓글", 32L);
        given(userRepository.getReferenceById(1L)).willReturn(user);
        given(postRepository.findWithUserById(22L)).willReturn(Optional.of(post));
        given(commentRepository.findWithRelationsById(32L)).willReturn(Optional.of(parent));
        given(commentRepository.save(any(CommunityComment.class))).willAnswer(invocation -> {
            CommunityComment comment = invocation.getArgument(0);
            ReflectionTestUtils.setField(comment, "id", 33L);
            return comment;
        });

        // when
        CommunityCommentResponse response = communityService.createComment(22L, request);

        // then
        assertThat(response.parentId()).isEqualTo(32L);
        assertThat(response.depth()).isEqualTo(2);
    }

    @Test
    @DisplayName("대댓글에 대댓글 작성 시 예외 발생")
    void createReply_depthExceeded() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(23L, user, "게시글");
        CommunityComment parent = createComment(34L, post, user, "부모", null);
        CommunityComment reply = createComment(35L, post, user, "대댓글", parent);
        CommunityCommentCreateRequest request = new CommunityCommentCreateRequest("대대댓글", 35L);
        given(userRepository.getReferenceById(1L)).willReturn(user);
        given(postRepository.findWithUserById(23L)).willReturn(Optional.of(post));
        given(commentRepository.findWithRelationsById(35L)).willReturn(Optional.of(reply));

        // when // then
        assertThatThrownBy(() -> communityService.createComment(23L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.COMMUNITY_REPLY_DEPTH_EXCEEDED);
    }

    @Test
    @DisplayName("커뮤니티 댓글 수정 성공")
    void updateComment_success() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(24L, user, "게시글");
        CommunityComment comment = createComment(36L, post, user, "수정전", null);
        given(commentRepository.findWithRelationsByIdAndUserId(36L, 1L)).willReturn(Optional.of(comment));

        // when
        CommunityCommentResponse response = communityService.updateComment(36L, new CommunityCommentUpdateRequest("수정후"));

        // then
        assertThat(response.content()).isEqualTo("수정후");
    }

    @Test
    @DisplayName("커뮤니티 게시글 좋아요 성공")
    void likePost_success() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(41L, user, "좋아요");
        given(likeRepository.existsByPostIdAndUserId(41L, 1L)).willReturn(false);
        given(userRepository.getReferenceById(1L)).willReturn(user);
        given(postRepository.findWithUserById(41L)).willReturn(Optional.of(post));

        // when
        CommunityPostResponse response = communityService.likePost(41L);

        // then
        verify(likeRepository, times(1)).save(any(CommunityLike.class));
        assertThat(response.likeCount()).isEqualTo(1);
        assertThat(response.isLiked()).isTrue();
    }

    @Test
    @DisplayName("커뮤니티 게시글 중복 좋아요 시 예외 발생")
    void likePost_duplicate() {
        // given
        given(likeRepository.existsByPostIdAndUserId(42L, 1L)).willReturn(true);

        // when // then
        assertThatThrownBy(() -> communityService.likePost(42L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.COMMUNITY_LIKE_ALREADY_EXISTS);
    }

    @Test
    @DisplayName("커뮤니티 게시글 좋아요 취소 성공")
    void unlikePost_success() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(43L, user, "좋아요취소");
        post.increaseLikeCount();
        CommunityLike like = CommunityLike.builder().post(post).user(user).build();
        given(postRepository.findWithUserById(43L)).willReturn(Optional.of(post));
        given(likeRepository.findByPostIdAndUserId(43L, 1L)).willReturn(Optional.of(like));

        // when
        CommunityPostResponse response = communityService.unlikePost(43L);

        // then
        verify(likeRepository, times(1)).delete(like);
        assertThat(response.likeCount()).isZero();
        assertThat(response.isLiked()).isFalse();
    }

    /** 테스트용 사용자 엔티티를 생성한다. */
    private User createUser(Long id) {
        User user = User.builder().email("user@test.com").password("pw").nickname("nick").build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    /** 테스트용 커뮤니티 게시글 엔티티를 생성한다. */
    private CommunityPost createPost(Long id, User user, String title) {
        CommunityPost post = CommunityPost.builder()
                .user(user)
                .title(title)
                .content("내용")
                .build();
        ReflectionTestUtils.setField(post, "id", id);
        return post;
    }

    /** 테스트용 커뮤니티 댓글 엔티티를 생성한다. */
    private CommunityComment createComment(Long id, CommunityPost post, User user, String content, CommunityComment parent) {
        CommunityComment comment = CommunityComment.builder()
                .post(post)
                .user(user)
                .content(content)
                .parent(parent)
                .build();
        ReflectionTestUtils.setField(comment, "id", id);
        return comment;
    }
}

