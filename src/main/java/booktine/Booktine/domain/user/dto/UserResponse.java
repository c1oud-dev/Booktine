package booktine.Booktine.domain.user.dto;

/**
 * 사용자 정보를 클라이언트에 응답할 때 사용하는 DTO.
 * 회원조회/수정 등 사용자 정보 반환 API의 표준 응답 모델로 사용된다.
 */
public record UserResponse(
        Long id,
        String email,
        String nickname,
        String aboutMe,
        String profileImageUrl
) {
}
