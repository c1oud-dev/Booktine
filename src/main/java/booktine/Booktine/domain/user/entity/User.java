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
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_provider_email", columnNames = {"auth_provider", "email"}),
        @UniqueConstraint(name = "uk_users_provider_provider_id", columnNames = {"auth_provider", "provider_id"})
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 20)
    private UserAuthProvider authProvider;

    @Column(name = "provider_id")
    private String providerId;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(nullable = false)
    private boolean emailVerified;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role = UserRole.ROLE_USER;

    @Column(columnDefinition = "TEXT")
    private String aboutMe;

    private String profileImageUrl;

    /**
     * 회원가입 시 새 사용자 엔티티를 생성하기 위한 빌더 생성자.
     */
    @Builder
    public User(String email, String password, String nickname, boolean emailVerified,
                String aboutMe, String profileImageUrl, UserAuthProvider authProvider, String providerId) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.emailVerified = emailVerified;
        this.aboutMe = aboutMe;
        this.profileImageUrl = profileImageUrl;
        this.authProvider = authProvider;
        this.providerId = providerId;
        this.role = UserRole.ROLE_USER;
    }

    /**
     * 내 정보 수정 시 닉네임과 자기소개를 변경한다.
     */
    public void updateProfile(String nickname, String aboutMe) {
        this.nickname = nickname;
        this.aboutMe = aboutMe;
    }

    /**
     * 프로필 이미지 URL을 변경한다.
     */
    public void updateProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    /**
     * 사용자 비밀번호를 변경한다.
     */
    public void updatePassword(String password) {
        this.password = password;
    }

    /**
     * 이메일 인증 완료 상태로 계정을 활성화한다.
     * */
    public void verifyEmail() {
        this.emailVerified = true;
    }

    /**
     * 관리자 계정 시드/운영 도구에서 사용자 권한을 변경한다.
     */
    public void updateRole(UserRole role) {
        this.role = role;
    }
}
