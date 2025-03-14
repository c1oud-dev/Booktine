package booktine.Booktine.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Author {
    private String name;
    private String avatar; // 프로필 사진 URL 등
    private String email;

    public Author() {}

    public Author(String name, String avatar) {
        this.name = name;
        this.avatar = avatar;
        this.email = email;
    }

    // Getter/Setter
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getAvatar() {
        return avatar;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
