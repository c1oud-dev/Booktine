package booktine.Booktine.domain.user.repository;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * User 엔티티의 영속성 처리를 담당하는 Repository.
 * 사용자 중복 검사 및 이메일 기반 조회를 서비스 계층에 제공한다.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일 중복 여부를 확인한다.
     */
    boolean existsByEmailAndAuthProvider(String email, UserAuthProvider authProvider);

    /**
     * 닉네임 중복 여부를 확인한다.
     */
    boolean existsByNickname(String nickname);

    /**
     * 이메일로 사용자 정보를 조회한다.
     */
    Optional<User> findByEmailAndAuthProvider(String email, UserAuthProvider authProvider);

    /**
     * 소셜 제공자와 제공자 사용자 식별자로 사용자 정보를 조회한다.
     */
    Optional<User> findByAuthProviderAndProviderId(UserAuthProvider authProvider, String providerId);
}
