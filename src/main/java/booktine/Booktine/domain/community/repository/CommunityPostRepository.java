package booktine.Booktine.domain.community.repository;

import booktine.Booktine.domain.community.entity.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/** 커뮤니티 게시글 엔티티의 DB 접근을 담당하는 JPA 리포지토리. */
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    /** 커뮤니티 게시글 목록을 작성자 정보와 함께 조회한다. */
    @Override
    @EntityGraph(attributePaths = "user")
    Page<CommunityPost> findAll(Pageable pageable);

    /** 커뮤니티 게시글 단건을 작성자 정보와 함께 조회한다. */
    @EntityGraph(attributePaths = "user")
    Optional<CommunityPost> findWithUserById(Long id);

    /** 작성자 ID와 게시글 ID로 소유 게시글을 작성자 정보와 함께 단건 조회한다. */
    @EntityGraph(attributePaths = "user")
    Optional<CommunityPost> findWithUserByIdAndUserId(Long id, Long userId);

    /** 회원 탈퇴 시 사용자가 작성한 커뮤니티 게시글 ID를 조회한다. */
    @Query("select p.id from CommunityPost p where p.user.id = :userId")
    List<Long> findIdsByUserId(@Param("userId") Long userId);

    /** 회원 탈퇴 시 사용자가 작성한 커뮤니티 게시글을 일괄 삭제한다. */
    void deleteAllByUserId(Long userId);
}
