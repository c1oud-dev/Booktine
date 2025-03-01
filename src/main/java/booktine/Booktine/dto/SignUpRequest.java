package booktine.Booktine.dto;

/**
 * 회원가입 시 요청 바디로 받을 DTO
 */
public class SignUpRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;

    public SignUpRequest() {}

    public SignUpRequest(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    // Getter/Setter
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getEmail() {
        return lastName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPassword() {
        return password;
    }
    // ... 생략
}
