package booktine.Booktine.domain.user.dto;

import booktine.Booktine.domain.user.entity.User;

/**
 * 공개 사용자 프로필 조회 결과를 반환하는 DTO.
 * 커뮤니티 화면에서 작성자 정보를 모달로 노출할 때 사용한다.
 */
public record UserProfileResponse(
        Long id,
        String nickname,
        String profileImageUrl,
        String aboutMe
) {
    /**
     * User 엔티티를 공개 프로필 DTO로 변환한다.
     */
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getNickname(),
                user.getProfileImageUrl(),
                user.getAboutMe()
        );
    }
}
