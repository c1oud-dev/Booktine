package booktine.Booktine.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    // email을 기본키로 사용 (unique, not null)
    @Id
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false)
    private String password;

    // 프로필 문구(ABOUT ME)
    @Column(length = 1000)
    private String aboutMe;

    // 프로필 이미지 URL (또는 파일 경로)
    private String avatarUrl;

    public User() {
    }

    public User(String nickname, String email, String password) {
        this.nickname = nickname;
        this.email = email;
        this.password = password;
    }

    // getter, setter
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getAboutMe() {
        return aboutMe;
    }

    public void setAboutMe(String aboutMe) {
        this.aboutMe = aboutMe;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
}
