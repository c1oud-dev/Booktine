package booktine.Booktine.service;

import booktine.Booktine.model.User;
import booktine.Booktine.repository.PostRepository;
import booktine.Booktine.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 회원가입과 로그인 로직 처리, BCryptPasswordEncoder를 이용해 비밀번호를 암호화
 */
@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public UserService(UserRepository userRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    // 회원가입: 첫번째, 마지막 이름, 이메일, 비밀번호를 받음
    public User registerUser(String email, String nickname, String rawPassword) throws Exception {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new Exception("Email already exists");
        }
        if (userRepository.findByNickname(nickname).isPresent()) {
            throw new Exception("Nickname already exists");
        }
        String encodedPassword = passwordEncoder.encode(rawPassword);
        // 변경된 생성자: 기존 firstName, lastName 대신 nickname을 사용
        User user = new User(nickname, email, encodedPassword);
        return userRepository.save(user);
    }


    public User registerUser(User user, String rawPassword) throws Exception {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new Exception("Email already exists");
        }
        if (userRepository.findByNickname(user.getNickname()).isPresent()) {
            throw new Exception("Nickname already exists");
        }
        String encodedPassword = passwordEncoder.encode(rawPassword);
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }


    // 로그인 검증 (AuthController에서 직접 사용할 수도 있지만, 스프링 시큐리티용은 loadUserByUsername)
    public User loginUser(String email, String rawPassword) throws Exception {
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isEmpty() || !passwordEncoder.matches(rawPassword, opt.get().getPassword())) {
            throw new Exception("Invalid email or password");
        }
        return opt.get();
    }

    // ★ UserDetailsService 구현
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }


    //이메일로 유저 조회
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    //user 업데이트
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    // 게시글 수, 완독 책 수 조회
    public int getPostCount(String email) {
        return postRepository.countByAuthor_Email(email);
    }
   public int getCompletedBookCount(String email) {
       return postRepository.countByAuthor_EmailAndReadingStatus(email, "완독");
   }

    @Transactional // ← 트랜잭션 걸어서 둘 다 실패 없이 처리되도록
    public void deleteAccount(String email, String rawPassword) throws Exception {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new Exception("존재하지 않는 사용자입니다.");
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new Exception("비밀번호가 옳지 않습니다. 암호를 다시 확인해주세요.");
        }
        postRepository.deleteByAuthorEmail(email);
        userRepository.delete(user);
    }

    public Optional<User> findByNickname(String nickname) {
        return userRepository.findByNickname(nickname);
    }

    public void resetPassword(String email, String rawNewPassword) throws Exception {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new Exception("존재하지 않는 이메일입니다.");
        }
        String encoded = passwordEncoder.encode(rawNewPassword);
        User user = optionalUser.get();
        user.setPassword(encoded);
        userRepository.save(user);
    }

}
