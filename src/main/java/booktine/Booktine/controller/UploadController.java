package booktine.Booktine.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UploadController {

    @PostMapping("/upload-profile")
    public ResponseEntity<Map<String, String>> uploadProfile(
            @RequestParam("profileImage") MultipartFile file
    ) {
        try {
            // 1) 파일을 서버 로컬 경로 혹은 S3 등 원하는 위치에 저장
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            // 예: 로컬 디스크 "uploads" 폴더에 저장
            Path uploadPath = Paths.get("uploads").resolve(fileName);
            Files.copy(file.getInputStream(), uploadPath, StandardCopyOption.REPLACE_EXISTING);

            // 2) 브라우저에서 접근할 수 있는 URL을 구성
            //    - 만약 정적 리소스 매핑(/images/**)을 했다면 "http://localhost:8083/images/파일명" 형태
            //    - S3 등에 업로드했다면 해당 S3 URL
            String imageUrl = "http://localhost:8083/images/" + fileName;

            // 3) 클라이언트로 반환
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "파일 업로드 실패"));
        }
    }
}

