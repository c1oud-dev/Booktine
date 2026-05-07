package booktine.Booktine.domain.genre.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 관리자 장르 추가 요청 본문을 표현하는 DTO.
 * 관리자 페이지의 장르 관리 폼에서 입력한 장르명을 검증한 뒤 서비스 계층으로 전달한다.
 */
public record GenreCreateRequest(
        @NotBlank(message = "장르명은 필수입니다.")
        @Size(max = 50, message = "장르명은 50자 이하여야 합니다.")
        String name
) {
}
