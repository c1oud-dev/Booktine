package booktine.Booktine.domain.community.repository;

import booktine.Booktine.domain.community.entity.CommunityLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** 커뮤니티 게시글 좋아요 엔티티의 DB 접근을 담당하는 JPA 리포지토리. */
public interface CommunityLikeRepository extends JpaRepository<CommunityLike, Long> {

    /** 게시글과 사용자 조합의 좋아요 존재 여부를 조회한다. */
    boolean existsByPostIdAndUserId(Long postId, Long userId);

    /** 게시글과 사용자 조합의 좋아요를 조회한다. */
    Optional<CommunityLike> findByPostIdAndUserId(Long postId, Long userId);

    /** 사용자가 좋아요한 게시글 ID 목록을 일괄 조회한다. */
    @Query("select l.post.id from CommunityLike l where l.user.id = :userId and l.post.id in :postIds")
    List<Long> findPostIdsByUserId(@Param("userId") Long userId, @Param("postIds") Collection<Long> postIds);

    /** 게시글에 달린 좋아요를 일괄 삭제한다. */
    void deleteAllByPostId(Long postId);

    /** 회원 탈퇴 시 사용자가 누른 좋아요를 일괄 삭제한다. */
    void deleteAllByUserId(Long userId);

    /** 회원 탈퇴 시 사용자가 작성한 게시글의 좋아요를 일괄 삭제한다. */
    void deleteAllByPostIdIn(Collection<Long> postIds);
}