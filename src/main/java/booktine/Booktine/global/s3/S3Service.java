package booktine.Booktine.global.s3;

import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/**
 * S3 이미지 파일 업로드/삭제를 담당하는 공통 서비스.
 * 사용자 프로필 이미지 및 게시물 표지 이미지 처리에서 재사용된다.
 */
@Service
@RequiredArgsConstructor
public class S3Service {

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/jpg", "image/png");

    private final S3Client s3Client;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${spring.cloud.aws.region.static}")
    private String region;

    /**
     * 전달받은 이미지를 UUID 기반 파일명으로 S3에 업로드하고 URL을 반환한다.
     */
    public String uploadImage(MultipartFile image) {
        validateImage(image);
        try {
            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(fileName)
                            .contentType(image.getContentType())
                            .contentLength(image.getSize())
                            .build(),
                    RequestBody.fromInputStream(image.getInputStream(), image.getSize())
            );
            return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + fileName;
        } catch (IOException e) {
            throw new CustomException(ErrorCode.IMAGE_UPLOAD_FAILED);
        }
    }

    /** 프로필 이미지 파일 형식 및 크기를 검증한다. */
    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
        if (!ALLOWED_CONTENT_TYPES.contains(image.getContentType())) {
            throw new CustomException(ErrorCode.INVALID_IMAGE_TYPE);
        }
        if (image.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new CustomException(ErrorCode.IMAGE_SIZE_EXCEEDED);
        }
    }

    /**
     * 이미지 URL에서 객체 키를 추출해 S3에서 삭제한다.
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        String key = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build());
    }
}
