package booktine.Booktine.domain.user.dto;

import booktine.Booktine.domain.user.entity.User;

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
    /**
     * User 엔티티를 UserResponse DTO로 변환하는 정적 팩토리 메서드
     */
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getAboutMe(),
                user.getProfileImageUrl()
        );
    }
}
