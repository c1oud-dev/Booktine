package booktine.Booktine.repository;

import booktine.Booktine.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA 인터페이스 생성
 */

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // 필요에 따라 쿼리 메서드 추가 가능
    int countByAuthorEmail(String email);
    int countByAuthorEmailAndReadingStatus(String email, String readingStatus);

}
