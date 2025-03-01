package booktine.Booktine.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * DB에 저장할 유저 엔티티
 */

@Entity
@Table(name = "users") // 테이블명
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 예: firstName, lastName, email, password
    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;

    // 기본 생성자
    public User() {
    }

    // 생성자
    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    // Getter/Setter
    public Long getId() {
        return id;
    }

    // ... (other getters/setters)
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    // ... 생략
}
