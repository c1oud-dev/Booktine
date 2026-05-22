package booktine.Booktine.domain.admin.dto;

import booktine.Booktine.domain.user.entity.UserRole;
import jakarta.validation.constraints.NotNull;

/**
 * 관리자 권한으로 사용자 역할을 변경할 때 사용하는 요청 DTO.
 * AdminController의 사용자 권한 변경 API에서 요청 본문 검증과 전달에 사용된다.
 */
public record AdminUserRoleUpdateRequest(
        @NotNull
        UserRole role
) {
}
