package booktine.Booktine.domain.community.repository;

import booktine.Booktine.domain.community.entity.CommunityLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** 커뮤니티 게시글 좋아요 엔티티의 DB 접근을 담당하는 JPA 리포지토리. */
public interface CommunityLikeRepository extends JpaRepository<CommunityLike, Long> {

    /** 게시글과 사용자 조합의 좋아요 존재 여부를 조회한다. */
    boolean existsByPostIdAndUserId(Long postId, Long userId);

    /** 게시글과 사용자 조합의 좋아요를 조회한다. */
    Optional<CommunityLike> findByPostIdAndUserId(Long postId, Long userId);

    /** 게시글에 달린 좋아요를 일괄 삭제한다. */
    void deleteAllByPostId(Long postId);
}