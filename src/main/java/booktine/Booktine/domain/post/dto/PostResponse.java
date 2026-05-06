package booktine.Booktine.domain.post.dto;

import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 게시물 조회 결과를 반환하는 응답 DTO.
 * 단건/목록 API에서 클라이언트가 화면 렌더링에 필요한 데이터를 전달받는다.
 */
public record PostResponse(
        Long id,
        Long userId,
        String title,
        String coverImageUrl,
        String author,
        String genre,
        String publisher,
        LocalDate publishedDate,
        String summary,
        ReadingStatus readingStatus,
        LocalDate completedDate,
        Integer currentPage,
        Integer totalPage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * Post 엔티티를 PostResponse DTO로 변환하는 정적 팩토리 메서드
     */
    public static PostResponse from(Post post) {
        return new PostResponse(
                post.getId(),
                post.getUser().getId(),
                post.getTitle(),
                post.getCoverImageUrl(),
                post.getAuthor(),
                post.getGenre(),
                post.getPublisher(),
                post.getPublishedDate(),
                post.getSummary(),
                post.getReadingStatus(),
                post.getCompletedDate(),
                post.getCurrentPage(),
                post.getTotalPage(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
