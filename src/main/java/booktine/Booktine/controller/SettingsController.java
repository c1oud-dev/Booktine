package booktine.Booktine.controller;


import booktine.Booktine.model.User;
import booktine.Booktine.repository.PostRepository;
import booktine.Booktine.service.PostService;
import booktine.Booktine.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final UserService userService;

    @Autowired
    private PostService postService;

    @Autowired
    private PostRepository postRepository;

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
        // 게시글 수, 완독 책 수 (사용자별)
        int postCount = postRepository.countByAuthor_Email(email);
        int completedCount = postRepository.countByAuthor_EmailAndReadingStatus(email, "완독");

        // DTO or JSON
        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("nickname", user.getNickname());
        response.put("password", user.getPassword()); // 만약 프론트에서 pre-populate 하길 원하면 반환 (주의: 해시값 노출)
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("aboutMe", user.getAboutMe());
        response.put("postCount", postCount);
        response.put("completedCount", completedCount);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{email}/uploadProfile")
    public ResponseEntity<?> uploadProfile(
            @PathVariable String email,
            @RequestParam("file") MultipartFile file
    ) {
        Optional<User> opt = userService.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        try {
            // ——— 이전 업로드 파일 삭제 ———
           String oldUrl = user.getAvatarUrl();
           if (oldUrl != null && !oldUrl.isBlank()) {
                   Path oldFile = Paths.get("uploads",
                               oldUrl.substring(oldUrl.lastIndexOf('/') + 1));
                   Files.deleteIfExists(oldFile);
            }
            // 새 파일 저장
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(filename);
            Files.write(filePath, file.getBytes());

            // 새 URL을 도메인 객체에 저장
            String newUrl = "/uploads/" + filename;
            user.setAvatarUrl(newUrl);
            userService.updateUser(user);

   // JSON으로 새 avatarUrl을 반환
           return ResponseEntity.ok(Map.of("avatarUrl", newUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error uploading file"));
        }
    }


    @PutMapping("/{email}")
    public ResponseEntity<?> updateUserSettings(@PathVariable String email, @RequestBody Map<String, Object> payload) {
        Optional<User> opt = userService.findByEmail(email);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();

        // payload가 오직 avatarUrl만 포함한 경우, 비밀번호 확인 건너뛰기
        if (!(payload.size() == 1 && payload.containsKey("avatarUrl"))) {
            String passwordConfirmation = (String) payload.get("passwordConfirmation");
            if (passwordConfirmation == null || !passwordEncoder.matches(passwordConfirmation, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호 확인이 일치하지 않습니다.");
            }
        }

        // 업데이트 가능한 필드 반영
        if (payload.containsKey("nickname")) {
            user.setNickname((String) payload.get("nickname"));
        }
        if (payload.containsKey("aboutMe")) {
            user.setAboutMe((String) payload.get("aboutMe"));
        }
        if (payload.containsKey("avatarUrl")) {
            user.setAvatarUrl((String) payload.get("avatarUrl"));
        }

        userService.updateUser(user);

        return ResponseEntity.ok(user);
    }

}
