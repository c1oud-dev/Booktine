package booktine.Booktine.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "users") // 테이블명
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email; // 이메일(로그인 ID로 사용)

    @Column(nullable = false)
    private String password; // 암호화된 비밀번호

    private String role = "ROLE_USER"; // 기본 권한(예: ROLE_USER)

    // 필요한 필드(이름, 닉네임 등) 추가 가능
    private String firstName;
    private String lastName;

    public org.springframework.security.core.userdetails.UserDetails buildUserDetails() {
        return org.springframework.security.core.userdetails.User
                .withUsername(this.email)
                .password(this.password)
                .roles(this.role.replace("ROLE_", "")) // "ROLE_USER" -> "USER"
                .build();
    }
}
