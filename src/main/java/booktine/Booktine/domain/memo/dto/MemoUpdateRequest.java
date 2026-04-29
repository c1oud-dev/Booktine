package booktine.Booktine.domain.memo.dto;

/**
 * 메모 수정 요청 데이터를 전달하는 DTO.
 * 메모 수정 API에서 요청 본문으로 사용된다.
 */
public record MemoUpdateRequest(
        String content,
        Integer page
) {
}
