package booktine.Booktine.repository;

import booktine.Booktine.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA 인터페이스 생성
 */

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // 필요에 따라 쿼리 메서드 추가 가능
    // 특정 이메일을 가진 유저가 작성한 게시물 수
    int countByAuthor_Email(String email);
    int countByAuthor_EmailAndReadingStatus(String email, String readingStatus);


}
