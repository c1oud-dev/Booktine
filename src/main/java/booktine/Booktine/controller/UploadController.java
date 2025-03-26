package booktine.Booktine.controller;

import booktine.Booktine.model.User;
import booktine.Booktine.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UploadController {

    private final UserService userService;

    public UploadController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/upload-profile")
    public ResponseEntity<Map<String, String>> uploadProfile(
            @RequestParam("email") String email,
            @RequestParam("profileImage") MultipartFile file
    ) {
        try {
            // 1) 원본 파일명 가져오기 및 sanitize
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null) {
                originalFileName = "unknown";
            } else {
                originalFileName = originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_");
            }

            // 2) 최종 저장할 파일명 생성
            String fileName = System.currentTimeMillis() + "_" + originalFileName;

            // 3) uploads 디렉토리 확인 및 생성
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // 4) 파일 저장
            Path uploadPath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), uploadPath, StandardCopyOption.REPLACE_EXISTING);

            // 5) 브라우저 접근 URL 구성
            String imageUrl = "http://localhost:8083/images/" + fileName;

            // 6) DB에서 사용자 조회 후 avatarUrl 업데이트
            Optional<User> optionalUser = userService.findByEmail(email);
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                user.setAvatarUrl(imageUrl);
                userService.updateUser(user);
            } else {
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "사용자를 찾을 수 없습니다."));
            }

            // 7) 결과 반환
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "파일 업로드 실패"));
        }
    }

    @PostMapping(value = "/upload-post-background", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPostBackground(
            @RequestParam("image") MultipartFile file
    ) {
        try {
            // 1) 원본 파일명 가져오기 및 sanitize
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null) {
                originalFileName = "unknown";
            } else {
                originalFileName = originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_");
            }

            // 2) 최종 저장할 파일명 생성
            String fileName = System.currentTimeMillis() + "_" + originalFileName;

            // 3) uploads 디렉토리 확인 및 생성
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // 4) 파일 저장
            Path uploadPath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), uploadPath, StandardCopyOption.REPLACE_EXISTING);

            // 5) 브라우저에서 접근할 수 있는 URL 구성 (WebConfig에서 /images/** 매핑)
            String imageUrl = "http://localhost:8083/images/" + fileName;

            // 6) 결과 반환
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Background image upload failed"));
        }
    }

}

