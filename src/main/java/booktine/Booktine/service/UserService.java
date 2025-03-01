package booktine.Booktine.service;

import booktine.Booktine.dto.SignUpRequest;
import booktine.Booktine.entity.User;
import booktine.Booktine.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 회원가입 비즈니스 로직
 */
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public void createUser(SignUpRequest request) {
        // 이메일 중복 검사
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        // 비밀번호 암호화 로직(BCrypt 등) 넣을 수 있음
        // String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPassword() // 암호화 안 한 예시
        );

        userRepository.save(user);
    }
}
