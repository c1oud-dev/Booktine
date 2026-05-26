package booktine.Booktine.domain.community.repository;

import booktine.Booktine.domain.community.entity.CommunityComment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** 커뮤니티 댓글 엔티티의 DB 접근을 담당하는 JPA 리포지토리. */
public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {

    /** 게시글 ID로 댓글과 대댓글 목록을 작성자/게시글/부모 댓글 정보와 함께 조회한다. */
    @EntityGraph(attributePaths = {"user", "post", "parent"})
    List<CommunityComment> findAllByPostIdOrderByCreatedAtAsc(Long postId);

    /** 댓글 ID로 작성자/게시글/부모 댓글 정보를 함께 조회한다. */
    @EntityGraph(attributePaths = {"user", "post", "parent"})
    Optional<CommunityComment> findWithRelationsById(Long id);

    /** 작성자 ID와 댓글 ID로 소유 댓글을 관계 정보와 함께 단건 조회한다. */
    @EntityGraph(attributePaths = {"user", "post", "parent"})
    Optional<CommunityComment> findWithRelationsByIdAndUserId(Long id, Long userId);

    /** 게시글에 달린 댓글/대댓글 개수를 조회한다. */
    long countByPostId(Long postId);

    /** 특정 댓글에 달린 대댓글 존재 여부를 조회한다. */
    boolean existsByParentId(Long parentId);

    /** 게시글에 달린 대댓글을 일괄 삭제한다. */
    void deleteAllByParentPostId(Long postId);

    /** 게시글에 달린 댓글/대댓글을 일괄 삭제한다. */
    void deleteAllByPostId(Long postId);

    /** 특정 댓글에 달린 대댓글을 일괄 삭제한다. */
    void deleteAllByParentId(Long parentId);

    /** 회원 탈퇴 시 사용자가 작성한 게시글에 달린 대댓글을 일괄 삭제한다. */
    void deleteAllByParentPostIdIn(Collection<Long> postIds);

    /** 회원 탈퇴 시 사용자가 작성한 게시글에 달린 댓글/대댓글을 일괄 삭제한다. */
    void deleteAllByPostIdIn(Collection<Long> postIds);

    /** 회원 탈퇴 시 사용자가 작성한 댓글의 대댓글을 일괄 삭제한다. */
    void deleteAllByParentUserId(Long userId);

    /** 회원 탈퇴 시 사용자가 작성한 댓글을 일괄 삭제한다. */
    void deleteAllByUserId(Long userId);

    @EntityGraph(attributePaths = {"post"})
    List<CommunityComment> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}

