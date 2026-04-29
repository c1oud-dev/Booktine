package booktine.Booktine.domain.memo.dto;

/**
 * 메모 생성 요청 데이터를 전달하는 DTO.
 * 게시물별 메모 생성 API에서 요청 본문으로 사용된다.
 */
public record MemoCreateRequest(
        String content,
        Integer page
) {
}
