package booktine.Booktine.domain.community.service;

import booktine.Booktine.domain.community.dto.*;
import booktine.Booktine.domain.community.entity.CommunityCategory;
import booktine.Booktine.domain.community.entity.CommunityComment;
import booktine.Booktine.domain.community.entity.CommunityLike;
import booktine.Booktine.domain.community.entity.CommunityPost;
import booktine.Booktine.domain.community.repository.CommunityCommentRepository;
import booktine.Booktine.domain.community.repository.CommunityLikeRepository;
import booktine.Booktine.domain.community.repository.CommunityPostRepository;
import booktine.Booktine.domain.notification.entity.NotificationType;
import booktine.Booktine.domain.notification.service.NotificationService;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 커뮤니티 도메인의 핵심 비즈니스 로직을 처리하는 서비스.
 * 게시글 CRUD, 댓글/대댓글 CRUD, 좋아요 추가/취소 및 작성자 검증을 담당한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommunityService {

    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final CommunityLikeRepository likeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /** 인증 컨텍스트의 사용자 기준으로 커뮤니티 게시글을 생성한다. */
    @Transactional
    public CommunityPostResponse createPost(CommunityPostCreateRequest request) {
        User user = userRepository.findById(getCurrentUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        CommunityPost post = CommunityPost.builder()
                .user(user)
                .title(request.title())
                .content(request.content())
                .category(request.category())
                .build();

        return CommunityPostResponse.from(postRepository.save(post));
    }

    /** 커뮤니티 게시글 목록을 페이지 단위로 조회한다. */
    public Page<CommunityPostResponse> getPosts(CommunityCategory category, Long authorUserId, Pageable pageable) {
        Long currentUserId = getCurrentUserId();
        Page<CommunityPost> posts;
        if (authorUserId != null) {
            posts = postRepository.findAllByUserId(authorUserId, pageable);
        } else if (category == null) {
            posts = postRepository.findAll(pageable);
        } else {
            posts = postRepository.findAllByCategory(category, pageable);
        }
        List<Long> postIds = posts.getContent().stream()
                .map(CommunityPost::getId)
                .toList();
        Set<Long> likedPostIds = postIds.isEmpty()
                ? Set.of()
                : new HashSet<>(likeRepository.findPostIdsByUserId(currentUserId, postIds));

        return posts.map(post -> CommunityPostResponse.from(post, likedPostIds.contains(post.getId())));
    }

    /** 좋아요 수 기준으로 인기 커뮤니티 게시글 상위 5개를 조회한다. */
    public List<CommunityPostResponse> getPopularPostsByLikes() {
        Long userId = getCurrentUserId();
        List<CommunityPost> posts = postRepository.findTop5ByIsDeletedFalseOrderByLikeCountDescCreatedAtDesc();
        List<Long> postIds = posts.stream()
                .map(CommunityPost::getId)
                .toList();
        Set<Long> likedPostIds = postIds.isEmpty()
                ? Set.of()
                : new HashSet<>(likeRepository.findPostIdsByUserId(userId, postIds));

        return posts.stream()
                .map(post -> CommunityPostResponse.from(post, likedPostIds.contains(post.getId())))
                .toList();
    }

    /** 댓글 수 기준으로 인기 커뮤니티 게시글 상위 5개를 조회한다. */
    public List<CommunityPostResponse> getPopularPostsByComments() {
        Long userId = getCurrentUserId();
        List<CommunityPost> posts = postRepository.findTop5PopularByCommentCount();
        List<Long> postIds = posts.stream()
                .map(CommunityPost::getId)
                .toList();
        Set<Long> likedPostIds = postIds.isEmpty()
                ? Set.of()
                : new HashSet<>(likeRepository.findPostIdsByUserId(userId, postIds));

        return posts.stream()
                .map(post -> CommunityPostResponse.from(post, likedPostIds.contains(post.getId())))
                .toList();
    }

    /** 커뮤니티 게시글 단건을 조회한다. */
    public CommunityPostResponse getPost(Long postId) {
        Long userId = getCurrentUserId();
        CommunityPost post = getPostWithUserById(postId);
        return CommunityPostResponse.from(post, likeRepository.existsByPostIdAndUserId(postId, userId));
    }

    /** 인증 컨텍스트의 사용자가 작성한 커뮤니티 게시글을 수정한다. */
    @Transactional
    public CommunityPostResponse updatePost(Long postId, CommunityPostUpdateRequest request) {
        CommunityPost post = getOwnedPost(getCurrentUserId(), postId);
        if (post.isDeleted()) {
            throw new CustomException(ErrorCode.COMMUNITY_POST_NOT_FOUND);
        }
        post.updateDetails(request.title(), request.content());
        return CommunityPostResponse.from(post);
    }

    /** 인증 컨텍스트의 사용자가 작성한 커뮤니티 게시글을 삭제한다. */
    @Transactional
    public void deletePost(Long postId) {
        CommunityPost post = getOwnedPost(getCurrentUserId(), postId);
        likeRepository.deleteAllByPostId(postId);
        if (commentRepository.countByPostId(postId) > 0) {
            post.markDeleted();
            return;
        }
        postRepository.delete(post);
    }

    /** 게시글에 달린 댓글과 대댓글 목록을 조회한다. */
    public List<CommunityCommentResponse> getComments(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new CustomException(ErrorCode.COMMUNITY_POST_NOT_FOUND);
        }
        return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(CommunityCommentResponse::from)
                .toList();
    }

    /** 인증 컨텍스트의 사용자 기준으로 댓글 또는 대댓글을 생성한다. */
    @Transactional
    public CommunityCommentResponse createComment(Long postId, CommunityCommentCreateRequest request) {
        User user = userRepository.findById(getCurrentUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        CommunityPost post = getPostWithUserById(postId);
        if (post.isDeleted()) {
            throw new CustomException(ErrorCode.COMMUNITY_POST_NOT_FOUND);
        }
        CommunityComment parent = resolveParent(postId, request.parentId());
        CommunityComment comment = CommunityComment.builder()
                .post(post)
                .user(user)
                .content(request.content())
                .parent(parent)
                .build();

        CommunityComment saved = commentRepository.save(comment);
        if (!post.getUser().getId().equals(user.getId())) {
            notificationService.sendNotification(post.getUser().getId(), post.getId(), NotificationType.COMMENT, user.getNickname() + "님이 회원님의 게시글에 댓글을 남겼습니다.");
        }
        return CommunityCommentResponse.from(saved);
    }

    /** 인증 컨텍스트의 사용자가 작성한 댓글 또는 대댓글을 수정한다. */
    @Transactional
    public CommunityCommentResponse updateComment(Long commentId, CommunityCommentUpdateRequest request) {
        CommunityComment comment = getOwnedComment(getCurrentUserId(), commentId);
        if (comment.isDeleted()) {
            throw new CustomException(ErrorCode.COMMUNITY_COMMENT_NOT_FOUND);
        }
        comment.updateContent(request.content());
        return CommunityCommentResponse.from(comment);
    }

    /** 인증 컨텍스트의 사용자가 작성한 댓글 또는 대댓글을 삭제한다. */
    @Transactional
    public void deleteComment(Long commentId) {
        CommunityComment comment = getOwnedComment(getCurrentUserId(), commentId);
        if (commentRepository.existsByParentId(commentId)) {
            comment.markDeleted();
            return;
        }
        commentRepository.delete(comment);
    }

    /** 인증 컨텍스트의 사용자가 게시글에 좋아요를 추가한다. */
    @Transactional
    public CommunityPostResponse likePost(Long postId) {
        Long userId = getCurrentUserId();
        if (likeRepository.existsByPostIdAndUserId(postId, userId)) {
            throw new CustomException(ErrorCode.COMMUNITY_LIKE_ALREADY_EXISTS);
        }

        User user = userRepository.findById(getCurrentUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        CommunityPost post = getPostWithUserById(postId);

        if (post.isDeleted()) {
            throw new CustomException(ErrorCode.COMMUNITY_POST_NOT_FOUND);
        }

        try {
            likeRepository.save(CommunityLike.builder().post(post).user(user).build());
        } catch (DataIntegrityViolationException e) {
            throw new CustomException(ErrorCode.COMMUNITY_LIKE_ALREADY_EXISTS);
        }
        post.increaseLikeCount();
        if (!post.getUser().getId().equals(userId)) {
            notificationService.sendNotification(post.getUser().getId(), post.getId(), NotificationType.LIKE, user.getNickname() + "님이 회원님의 게시글을 좋아합니다.");
        }
        return CommunityPostResponse.from(post, true);
    }

    /** 인증 컨텍스트의 사용자가 게시글 좋아요를 취소한다. */
    @Transactional
    public CommunityPostResponse unlikePost(Long postId) {
        Long userId = getCurrentUserId();
        CommunityPost post = getPostWithUserById(postId);
        if (post.isDeleted()) {
            throw new CustomException(ErrorCode.COMMUNITY_POST_NOT_FOUND);
        }
        CommunityLike like = likeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMUNITY_LIKE_NOT_FOUND));

        likeRepository.delete(like);
        post.decreaseLikeCount();
        return CommunityPostResponse.from(post, false);
    }

    /** 대댓글 생성 대상 부모 댓글을 조회하고 depth 2 제한을 검증한다. */
    private CommunityComment resolveParent(Long postId, Long parentId) {
        if (parentId == null) {
            return null;
        }

        CommunityComment parent = commentRepository.findWithRelationsById(parentId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMUNITY_COMMENT_NOT_FOUND));
        if (!parent.getPost().getId().equals(postId)) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
        if (parent.isDeleted()) {
            throw new CustomException(ErrorCode.COMMUNITY_COMMENT_NOT_FOUND);
        }
        if (parent.isReply()) {
            throw new CustomException(ErrorCode.COMMUNITY_REPLY_DEPTH_EXCEEDED);
        }
        return parent;
    }

    /** 게시글 ID로 게시글 엔티티를 조회하고 없으면 예외를 발생시킨다. */
    private CommunityPost getPostWithUserById(Long postId) {
        return postRepository.findWithUserById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMUNITY_POST_NOT_FOUND));
    }

    /** 사용자 소유 게시글을 조회하고 미존재와 권한 부족을 구분한다. */
    private CommunityPost getOwnedPost(Long userId, Long postId) {
        return postRepository.findWithUserByIdAndUserId(postId, userId)
                .orElseThrow(() -> resolveMissingPost(postId));
    }

    /** 사용자 소유 댓글을 조회하고 미존재와 권한 부족을 구분한다. */
    private CommunityComment getOwnedComment(Long userId, Long commentId) {
        return commentRepository.findWithRelationsByIdAndUserId(commentId, userId)
                .orElseThrow(() -> resolveMissingComment(commentId));
    }

    /** 게시글 미존재와 권한 부족을 구분해 예외를 생성한다. */
    private CustomException resolveMissingPost(Long postId) {
        if (postRepository.existsById(postId)) {
            return new CustomException(ErrorCode.FORBIDDEN);
        }
        return new CustomException(ErrorCode.COMMUNITY_POST_NOT_FOUND);
    }

    /** 댓글 미존재와 권한 부족을 구분해 예외를 생성한다. */
    private CustomException resolveMissingComment(Long commentId) {
        if (commentRepository.existsById(commentId)) {
            return new CustomException(ErrorCode.FORBIDDEN);
        }
        return new CustomException(ErrorCode.COMMUNITY_COMMENT_NOT_FOUND);
    }

    /** 현재 인증 컨텍스트에서 사용자 ID를 조회한다. */
    private Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }
}