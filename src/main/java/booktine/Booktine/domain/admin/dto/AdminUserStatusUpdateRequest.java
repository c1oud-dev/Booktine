package booktine.Booktine.domain.admin.dto;

import jakarta.validation.constraints.NotNull;

/**
 * 관리자 권한으로 사용자 계정 상태(정지 여부)를 변경할 때 사용하는 요청 DTO.
 * AdminController의 사용자 상태 변경 API에서 요청 본문 검증과 전달에 사용된다.
 */
public record AdminUserStatusUpdateRequest(
        @NotNull
        Boolean suspended
) {
}
