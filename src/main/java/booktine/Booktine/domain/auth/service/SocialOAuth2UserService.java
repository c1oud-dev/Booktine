package booktine.Booktine.domain.auth.service;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserAuthProvider;
import booktine.Booktine.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * OAuth2 공급자별 사용자 정보를 파싱하고 사용자 테이블 업서트를 수행하는 서비스.
 */
@Service
@RequiredArgsConstructor
public class SocialOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    /**
     * 소셜 제공자 응답을 표준화한 뒤 회원 정보를 신규 생성 또는 업데이트하여 반환한다.
     */
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        SocialUserInfo socialUserInfo = SocialUserInfo.from(registrationId, oAuth2User.getAttributes());

        User savedUser = upsertSocialUser(socialUserInfo);
        return new DefaultOAuth2User(List.of(() -> "ROLE_USER"),
                Map.of("userId", savedUser.getId()), "userId");
    }

    /**
     * 소셜 계정 고유 식별자로 사용자를 찾아 없으면 생성하고, 있으면 기존 계정을 반환한다.
     */
    private User upsertSocialUser(SocialUserInfo socialUserInfo) {
        return userRepository.findByAuthProviderAndProviderId(socialUserInfo.provider(), socialUserInfo.providerId())
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(socialUserInfo.email())
                        .password("SOCIAL_LOGIN_USER")
                        .nickname(buildUniqueNickname(socialUserInfo.nickname()))
                        .emailVerified(true)
                        .authProvider(socialUserInfo.provider())
                        .providerId(socialUserInfo.providerId())
                        .build()));
    }

    /** 소셜 닉네임 충돌 시 providerId suffix를 붙여 고유 닉네임을 만든다. */
    private String buildUniqueNickname(String nickname) {
        if (!userRepository.existsByNickname(nickname)) return nickname;
        return nickname + "_" + System.currentTimeMillis();
    }

    /**
     * 공급자별 응답 attribute를 표준 사용자 정보로 매핑하기 위한 record.
     */
    private record SocialUserInfo(UserAuthProvider provider, String providerId, String email, String nickname) {

        /**
         * registrationId와 attributes를 기반으로 공급자별 파싱을 수행한다.
         */
        private static SocialUserInfo from(String registrationId, Map<String, Object> attributes) {
            return switch (registrationId) {
                case "google" -> new SocialUserInfo(UserAuthProvider.GOOGLE, String.valueOf(attributes.get("sub")),
                        String.valueOf(attributes.get("email")), String.valueOf(attributes.get("name")));
                case "kakao" -> {
                    Map<String, Object> account = (Map<String, Object>) attributes.get("kakao_account");
                    Map<String, Object> profile = (Map<String, Object>) account.get("profile");
                    yield new SocialUserInfo(UserAuthProvider.KAKAO, String.valueOf(attributes.get("id")),
                            String.valueOf(account.get("email")), String.valueOf(profile.get("nickname")));
                }
                case "naver" -> {
                    Map<String, Object> response = (Map<String, Object>) attributes.get("response");
                    yield new SocialUserInfo(UserAuthProvider.NAVER, String.valueOf(response.get("id")),
                            String.valueOf(response.get("email")), String.valueOf(response.get("name")));
                }
                default -> throw new IllegalArgumentException("지원하지 않는 provider 입니다: " + registrationId);
            };
        }
    }
}

