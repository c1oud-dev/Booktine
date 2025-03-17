package booktine.Booktine.controller;


import booktine.Booktine.model.User;
import booktine.Booktine.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final UserService userService;

    public SettingsController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/settings/{email}
    @GetMapping("/{email}")
    public ResponseEntity<?> getUserSettings(@PathVariable String email) {
        Optional<User> opt = userService.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        // 게시글 수, 완독 책 수
        int postCount = userService.getPostCount(email);
        int completedCount = userService.getCompletedBookCount(email);

        // DTO or JSON
        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("password", user.getPassword()); // 만약 프론트에서 pre-populate 하길 원하면 반환 (주의: 해시값 노출)
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("aboutMe", user.getAboutMe());
        response.put("postCount", postCount);
        response.put("completedCount", completedCount);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{email}/uploadProfile")
    public ResponseEntity<?> uploadProfile(@PathVariable String email, @RequestParam("file") MultipartFile file) {
        Optional<User> opt = userService.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        try {
            // 예시: 파일을 "uploads" 폴더에 저장하고 URL을 생성 (실제 환경에 맞게 수정)
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());
            // 예: 정적 리소스로 제공되는 URL (실제 URL 구성에 맞게 조정)
            user.setAvatarUrl("/uploads/" + filename);
            userService.updateUser(user);
            return ResponseEntity.ok("Profile image updated successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading file");
        }
    }

    @PutMapping("/{email}")
    public ResponseEntity<?> updateUserSettings(@PathVariable String email, @RequestBody Map<String, Object> payload) {
        Optional<User> opt = userService.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();

        // 1) 비밀번호 확인
        String passwordConfirmation = (String) payload.get("passwordConfirmation");
        if (passwordConfirmation == null || !passwordEncoder.matches(passwordConfirmation, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호 확인이 일치하지 않습니다.");
        }

        // 2) 업데이트 가능한 필드 반영
        if (payload.containsKey("firstName")) {
            user.setFirstName((String) payload.get("firstName"));
        }
        if (payload.containsKey("lastName")) {
            user.setLastName((String) payload.get("lastName"));
        }
        if (payload.containsKey("aboutMe")) {
            user.setAboutMe((String) payload.get("aboutMe"));
        }

        // 3) 저장
        userService.updateUser(user);

        // 4) 최종 업데이트된 User를 JSON으로 반환
        return ResponseEntity.ok(user);
    }

}
