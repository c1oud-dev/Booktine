package booktine.Booktine.domain.user.entity;

import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 계정 정보를 저장하는 JPA 엔티티.
 * 회원가입/내 정보 조회/수정/탈퇴 등 사용자 도메인 기능 전반에서 영속 객체로 사용된다.
 */
@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(columnDefinition = "TEXT")
    private String aboutMe;

    private String profileImageUrl;

    /**
     * 회원가입 시 새 사용자 엔티티를 생성하기 위한 빌더 생성자.
     */
    @Builder
    public User(String email, String password, String nickname, String aboutMe, String profileImageUrl) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.aboutMe = aboutMe;
        this.profileImageUrl = profileImageUrl;
    }

    /**
     * 내 정보 수정 시 닉네임과 자기소개를 변경한다.
     */
    public void updateProfile(String nickname, String aboutMe) {
        this.nickname = nickname;
        this.aboutMe = aboutMe;
    }
}
