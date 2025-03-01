package booktine.Booktine.repository;

import booktine.Booktine.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * JPA 인터페이스
 */
public interface UserRepository extends JpaRepository<User, Long> {
    //findByEmail(String email) 메서드를 통해 로그인 시 사용자의 이메일을 기반으로 조회
    Optional<User> findByEmail(String email);
}
