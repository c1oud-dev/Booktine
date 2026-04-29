package booktine.Booktine.domain.memo.dto;

import booktine.Booktine.domain.memo.entity.Memo;

import java.time.LocalDateTime;

/**
 * 메모 응답 데이터를 전달하는 DTO.
 * 메모 생성/조회/수정 API 응답 본문으로 사용된다.
 */
public record MemoResponse(
        Long id,
        Long postId,
        String content,
        Integer page,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    /**
     * Memo 엔티티를 MemoResponse DTO로 변환한다.
     */
    public static MemoResponse from(Memo memo) {
        return new MemoResponse(
                memo.getId(),
                memo.getPost().getId(),
                memo.getContent(),
                memo.getPage(),
                memo.getCreatedAt(),
                memo.getUpdatedAt()
        );
    }
}
