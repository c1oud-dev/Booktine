package booktine.Booktine.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Author {
    private String name;
    private String avatar; // 프로필 사진 URL 등

    public Author() {}

    public Author(String name, String avatar) {
        this.name = name;
        this.avatar = avatar;
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
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
