package booktine.Booktine.repository;

import booktine.Booktine.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA 인터페이스 생성
 */

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    int countByAuthor_Email(String email);
    int countByAuthor_EmailAndReadingStatus(String email, String readingStatus);

    List<Post> findByAuthor_Email(String email);
    @Modifying
    @Query("DELETE FROM Post p WHERE p.author.email = :email")
    void deleteByAuthorEmail(@Param("email") String email);
}
