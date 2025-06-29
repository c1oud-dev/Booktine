package booktine.Booktine.controller;


import booktine.Booktine.model.User;
import booktine.Booktine.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 회원가입/로그인 등 인증 관련 API 엔드포인트
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000"}, allowCredentials = "true")
public class AuthController {

    @Autowired private UserService userService;
    @Autowired private AuthenticationManager authManager;

    @Autowired
    private AuthenticationManager authenticationManager;

    static class ResetPasswordRequest {
        private String email;
        private String newPassword;
        // getters/setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) auth.getPrincipal();

        return ResponseEntity.ok(
                Map.of(
                        "email", user.getEmail(),
                        "nickname", user.getNickname()
                )
        );
    }


    // 회원가입 엔드포인트
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            User user = new User();
            user.setEmail(request.getEmail());
            user.setNickname(request.getNickname());
            user.setAvatarUrl("default_avatar.png");
            user.setAboutMe("");

            userService.registerUser(user, request.getPassword()); //실제 DB에 저장

            return ResponseEntity
                    .ok()
                    .header("Content-Type", "text/plain;charset=UTF-8")
                    .body("회원가입이 성공적으로 되었습니다!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 로그인 엔드포인트
    /*@PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(request.getEmail(), request.getPassword());
            // 실제 서비스에서는 토큰 발행 또는 세션 처리를 진행
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }*/


    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest req,
            HttpServletRequest servletReq
    ) {
        try {
            // 1) 도메인 User로 인증 검사 (비밀번호 일치 여부 확인)
            User domainUser = userService.loginUser(req.getEmail(), req.getPassword());

            // 2) 세션 생성 및 SecurityContext에 인증 등록
            List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    domainUser.getEmail(),    // principal
                    null,                     // credentials은 이미 검증됐으므로 null
                    authorities
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            servletReq.getSession(true)
                    .setAttribute(
                            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                            SecurityContextHolder.getContext()
                    );

            // 3) 도메인 User 객체를 클라이언트에 반환
            return ResponseEntity.ok(domainUser);

        } catch (Exception e) {
            // 인증 실패
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = userService.findByEmail(email).isPresent();
        if (exists) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("중복된 이메일입니다.");
        } else {
            return ResponseEntity.ok("사용 가능한 이메일입니다.");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (userService.findByEmail(request.getEmail()).isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("존재하지 않는 이메일입니다.");
        }
        // TODO: 여기에 임시 비밀번호 발급 및 이메일 전송 로직 구현
        return ResponseEntity.ok("비밀번호 재설정 이메일을 발송했습니다.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getEmail(), request.getNewPassword());
            return ResponseEntity.ok("비밀번호가 재설정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@RequestParam String email, @RequestBody Map<String, String> body) {
        String password = body.get("password");
        try {
            userService.deleteAccount(email, password);
            return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<?> checkNickname(@RequestParam String nickname) {
        boolean exists = userService.findByNickname(nickname).isPresent();
        if (exists) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("중복된 닉네임입니다.");
        } else {
            return ResponseEntity.ok("사용 가능한 닉네임입니다.");
        }
    }

}

// 간단한 요청 DTO 클래스 (내부 static class 또는 별도 파일로 분리 가능)
class SignupRequest {
    private String nickname;
    private String email;
    private String password;

    // getter, setter


    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

class LoginRequest {
    private String email;
    private String password;

    // getter, setter

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

class ForgotPasswordRequest {
    private String email;
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}




