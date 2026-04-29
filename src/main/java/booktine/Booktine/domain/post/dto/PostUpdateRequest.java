package booktine.Booktine.domain.post.dto;

import booktine.Booktine.domain.post.entity.ReadingStatus;

import java.time.LocalDate;

/**
 * 게시물 수정 요청 본문을 표현하는 DTO.
 * 기존 게시물의 주요 메타데이터와 독서 상태를 갱신할 때 사용된다.
 */
public record PostUpdateRequest(
        String title,
        String author,
        String genre,
        String publisher,
        LocalDate publishedDate,
        String summary,
        ReadingStatus readingStatus,
        LocalDate completedDate
) {
}
