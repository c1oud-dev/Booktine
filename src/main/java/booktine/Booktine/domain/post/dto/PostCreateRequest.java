package booktine.Booktine.domain.post.dto;

import booktine.Booktine.domain.post.entity.ReadingStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * 게시물 생성 요청 본문을 표현하는 DTO.
 * 컨트롤러에서 입력값 검증 후 서비스 계층으로 전달된다.
 */
@Valid
public record PostCreateRequest(
        @NotBlank(message = "제목은 필수입니다.") String title,
        @NotBlank(message = "저자는 필수입니다.") String author,
        @NotBlank(message = "장르는 필수입니다.") String genre,
        @NotBlank(message = "출판사는 필수입니다.") String publisher,
        @NotNull(message = "출판일은 필수입니다.") LocalDate publishedDate,
        @NotBlank(message = "요약은 필수입니다.") String summary,
        @NotNull(message = "독서 상태는 필수입니다.") ReadingStatus readingStatus,
        LocalDate completedDate
) {
}
