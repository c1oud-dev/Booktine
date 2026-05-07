package booktine.Booktine.domain.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 커뮤니티 댓글/대댓글 생성 요청 본문을 표현하는 DTO. */
public record CommunityCommentCreateRequest(
        @NotBlank(message = "내용은 필수입니다.")
        @Size(max = 5000, message = "내용은 5000자 이하여야 합니다.")
        String content,

        Long parentId
) {
}
