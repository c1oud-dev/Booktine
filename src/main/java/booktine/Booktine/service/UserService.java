package booktine.Booktine.service;

import booktine.Booktine.model.User;
import booktine.Booktine.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 회원가입과 로그인 로직 처리, BCryptPasswordEncoder를 이용해 비밀번호를 암호화
 */
@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 회원가입: 첫번째, 마지막 이름, 이메일, 비밀번호를 받음
    public User registerUser(String firstName, String lastName, String email, String rawPassword) throws Exception {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new Exception("Email already exists");
        }
        String encodedPassword = passwordEncoder.encode(rawPassword);
        // 새 User 객체 생성 시 변경된 생성자 사용
        User user = new User(firstName, lastName, email, encodedPassword);
        return userRepository.save(user);
    }

    // 로그인: 이메일과 비밀번호를 사용
    public User loginUser(String email, String rawPassword) throws Exception {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new Exception("Invalid email or password");
        }
        User user = optionalUser.get();
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new Exception("Invalid email or password");
        }
        return user;
    }
}
