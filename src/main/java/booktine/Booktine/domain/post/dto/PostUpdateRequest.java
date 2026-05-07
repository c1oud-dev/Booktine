package booktine.Booktine.domain.post.dto;

import booktine.Booktine.domain.post.entity.ReadingStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * 게시물 수정 요청 본문을 표현하는 DTO.
 * 기존 게시물의 주요 메타데이터와 독서 상태를 갱신할 때 사용된다.
 */
public record PostUpdateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
        String title,

        @NotBlank(message = "저자는 필수입니다.")
        @Size(max = 100, message = "저자는 100자 이하여야 합니다.")
        String author,

        @Size(max = 50, message = "장르는 50자 이하여야 합니다.")
        String genre,

        @NotBlank(message = "출판사는 필수입니다.")
        @Size(max = 100, message = "출판사는 100자 이하여야 합니다.")
        String publisher,

        LocalDate publishedDate,

        @Size(max = 5000, message = "요약은 5000자 이하여야 합니다.")
        String summary,

        @NotNull(message = "독서 상태는 필수입니다.")
        ReadingStatus readingStatus,
        LocalDate startDate,
        LocalDate completedDate,
        Double rating,
        @Size(max = 255, message = "한줄평은 255자 이하여야 합니다.") String shortReview,
        @Min(value = 0, message = "현재 페이지는 0 이상이어야 합니다.") Integer currentPage,
        @Min(value = 1, message = "전체 페이지는 1 이상이어야 합니다.") Integer totalPage
) {
}
