package booktine.Booktine.domain.community.service;

import booktine.Booktine.domain.community.dto.*;
import booktine.Booktine.domain.community.entity.CommunityCategory;
import booktine.Booktine.domain.community.entity.CommunityComment;
import booktine.Booktine.domain.community.entity.CommunityLike;
import booktine.Booktine.domain.community.entity.CommunityPost;
import booktine.Booktine.domain.community.repository.CommunityCommentRepository;
import booktine.Booktine.domain.community.repository.CommunityLikeRepository;
import booktine.Booktine.domain.community.repository.CommunityPostRepository;
import booktine.Booktine.domain.notification.service.NotificationService;
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
import org.springframework.dao.DataIntegrityViolationException;
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

    @Mock
    private NotificationService notificationService;

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
        CommunityPostCreateRequest request = new CommunityPostCreateRequest(
                "제목",
                "내용",
                CommunityCategory.GENERAL
        );
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
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
        Page<CommunityPostResponse> responses = communityService.getPosts(null, null, pageable);

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
        Page<CommunityPostResponse> responses = communityService.getPosts(null, null, pageable);

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
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
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
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
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
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
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
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
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
        User user = createUser(1L);
        CommunityPost post = createPost(42L, user, "좋아요");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(postRepository.findWithUserById(42L)).willReturn(Optional.of(post));
        given(likeRepository.save(any(CommunityLike.class)))
                .willThrow(new DataIntegrityViolationException("duplicate"));

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

    @Test
    @DisplayName("존재하지 않는 유저의 커뮤니티 게시글 생성 시 예외 발생")
    void createPost_userNotFound() {
        // given
        CommunityPostCreateRequest request = new CommunityPostCreateRequest(
                "제목",
                "내용",
                CommunityCategory.GENERAL
        );
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when // then
        assertThatThrownBy(() -> communityService.createPost(request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("좋아요 수 기준 인기 커뮤니티 게시글 조회 성공")
    void getPopularPostsByLikes_success() {
        // given
        CommunityPost post = createPost(51L, createUser(2L), "인기 게시글");
        given(postRepository.findTop5ByIsDeletedFalseOrderByLikeCountDescCreatedAtDesc())
                .willReturn(List.of(post));
        given(likeRepository.findPostIdsByUserId(1L, List.of(51L))).willReturn(List.of(51L));

        // when
        List<CommunityPostResponse> responses = communityService.getPopularPostsByLikes();

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).isLiked()).isTrue();
    }

    @Test
    @DisplayName("댓글 수 기준 인기 커뮤니티 게시글 조회 성공")
    void getPopularPostsByComments_success() {
        // given
        CommunityPost post = createPost(52L, createUser(2L), "댓글 인기 게시글");
        given(postRepository.findTop5PopularByCommentCount()).willReturn(List.of(post));
        given(likeRepository.findPostIdsByUserId(1L, List.of(52L))).willReturn(List.of());

        // when
        List<CommunityPostResponse> responses = communityService.getPopularPostsByComments();

        // then
        assertThat(responses).extracting(CommunityPostResponse::id).containsExactly(52L);
    }

    @Test
    @DisplayName("존재하지 않는 커뮤니티 게시글 단건 조회 시 예외 발생")
    void getPost_notFound() {
        // given
        given(postRepository.findWithUserById(99L)).willReturn(Optional.empty());

        // when // then
        assertThatThrownBy(() -> communityService.getPost(99L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.COMMUNITY_POST_NOT_FOUND);
    }

    @Test
    @DisplayName("댓글이 없는 커뮤니티 게시글 삭제 성공")
    void deletePost_success() {
        // given
        CommunityPost post = createPost(53L, createUser(1L), "삭제 게시글");
        given(postRepository.findWithUserByIdAndUserId(53L, 1L)).willReturn(Optional.of(post));
        given(commentRepository.countByPostId(53L)).willReturn(0L);

        // when
        communityService.deletePost(53L);

        // then
        verify(likeRepository).deleteAllByPostId(53L);
        verify(postRepository).delete(post);
    }

    @Test
    @DisplayName("댓글이 있는 커뮤니티 게시글은 소프트 삭제")
    void deletePost_withComments_marksDeleted() {
        // given
        CommunityPost post = createPost(54L, createUser(1L), "삭제 게시글");
        given(postRepository.findWithUserByIdAndUserId(54L, 1L)).willReturn(Optional.of(post));
        given(commentRepository.countByPostId(54L)).willReturn(1L);

        // when
        communityService.deletePost(54L);

        // then
        assertThat(post.isDeleted()).isTrue();
        verify(postRepository, never()).delete(post);
    }

    @Test
    @DisplayName("커뮤니티 댓글 목록 조회 성공")
    void getComments_success() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(55L, user, "게시글");
        CommunityComment comment = createComment(56L, post, user, "댓글", null);
        given(postRepository.existsById(55L)).willReturn(true);
        given(commentRepository.findAllByPostIdOrderByCreatedAtAsc(55L)).willReturn(List.of(comment));

        // when
        List<CommunityCommentResponse> responses = communityService.getComments(55L);

        // then
        assertThat(responses).extracting(CommunityCommentResponse::id).containsExactly(56L);
    }

    @Test
    @DisplayName("존재하지 않는 게시글의 댓글 목록 조회 시 예외 발생")
    void getComments_postNotFound() {
        // given
        given(postRepository.existsById(99L)).willReturn(false);

        // when // then
        assertThatThrownBy(() -> communityService.getComments(99L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.COMMUNITY_POST_NOT_FOUND);
    }

    @Test
    @DisplayName("삭제된 게시글에 댓글 작성 시 예외 발생")
    void createComment_deletedPost() {
        // given
        User user = createUser(1L);
        CommunityPost post = createPost(57L, user, "게시글");
        post.markDeleted();
        CommunityCommentCreateRequest request = new CommunityCommentCreateRequest("댓글", null);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(postRepository.findWithUserById(57L)).willReturn(Optional.of(post));

        // when // then
        assertThatThrownBy(() -> communityService.createComment(57L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.COMMUNITY_POST_NOT_FOUND);
    }

    @Test
    @DisplayName("삭제된 커뮤니티 댓글 수정 시 예외 발생")
    void updateComment_deleted() {
        // given
        User user = createUser(1L);
        CommunityComment comment = createComment(
                58L,
                createPost(59L, user, "게시글"),
                user,
                "댓글",
                null
        );
        comment.markDeleted();
        given(commentRepository.findWithRelationsByIdAndUserId(58L, 1L)).willReturn(Optional.of(comment));

        // when // then
        assertThatThrownBy(() -> communityService.updateComment(58L, new CommunityCommentUpdateRequest("수정")))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.COMMUNITY_COMMENT_NOT_FOUND);
    }

    @Test
    @DisplayName("대댓글이 없는 커뮤니티 댓글 삭제 성공")
    void deleteComment_success() {
        // given
        User user = createUser(1L);
        CommunityComment comment = createComment(
                60L,
                createPost(61L, user, "게시글"),
                user,
                "댓글",
                null
        );
        given(commentRepository.findWithRelationsByIdAndUserId(60L, 1L)).willReturn(Optional.of(comment));
        given(commentRepository.existsByParentId(60L)).willReturn(false);

        // when
        communityService.deleteComment(60L);

        // then
        verify(commentRepository).delete(comment);
    }

    @Test
    @DisplayName("좋아요하지 않은 커뮤니티 게시글 좋아요 취소 시 예외 발생")
    void unlikePost_likeNotFound() {
        // given
        CommunityPost post = createPost(62L, createUser(1L), "좋아요 취소");
        given(postRepository.findWithUserById(62L)).willReturn(Optional.of(post));
        given(likeRepository.findByPostIdAndUserId(62L, 1L)).willReturn(Optional.empty());

        // when // then
        assertThatThrownBy(() -> communityService.unlikePost(62L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.COMMUNITY_LIKE_NOT_FOUND);
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

