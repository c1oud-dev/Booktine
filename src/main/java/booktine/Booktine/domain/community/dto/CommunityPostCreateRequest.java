package booktine.Booktine.domain.community.dto;

import booktine.Booktine.domain.community.entity.CommunityCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** 커뮤니티 게시글 생성 요청 본문을 표현하는 DTO. */
public record CommunityPostCreateRequest(
        @NotBlank(message = "제목은 필수입니다.")
        @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
        String title,

        @NotBlank(message = "내용은 필수입니다.")
        @Size(max = 10000, message = "내용은 10000자 이하여야 합니다.")
        String content,

        @NotNull(message = "카테고리는 필수입니다.")
        CommunityCategory category
) {
}
