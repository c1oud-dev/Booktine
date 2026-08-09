package booktine.Booktine.domain.auth.service;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserAuthProvider;
import booktine.Booktine.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestOperations;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class SocialOAuth2UserServiceTest {

    @InjectMocks
    private SocialOAuth2UserService socialOAuth2UserService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RestOperations restOperations;

    @Test
    @DisplayName("구글 사용자 정보로 소셜 사용자를 생성한다")
    void loadUser_success() {
        // given
        socialOAuth2UserService.setRestOperations(restOperations);
        OAuth2UserRequest userRequest = createUserRequest();
        Map<String, Object> attributes = Map.of(
                "sub",
                "google-id",
                "email",
                "social@test.com",
                "name",
                "소셜사용자"
        );
        given(restOperations.exchange(
                any(RequestEntity.class),
                any(ParameterizedTypeReference.class)
        )).willReturn(ResponseEntity.ok(attributes));
        given(userRepository.findByAuthProviderAndProviderId(
                UserAuthProvider.GOOGLE,
                "google-id"
        )).willReturn(Optional.empty());
        given(userRepository.existsByNickname("소셜사용자")).willReturn(false);
        given(userRepository.save(any(User.class))).willAnswer(invocation -> {
            User user = invocation.getArgument(0);
            ReflectionTestUtils.setField(user, "id", 1L);
            return user;
        });

        // when
        OAuth2User result = socialOAuth2UserService.loadUser(userRequest);

        // then
        assertThat(result.<Long>getAttribute("userId")).isEqualTo(1L);
        assertThat(result.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
    }

    private OAuth2UserRequest createUserRequest() {
        ClientRegistration clientRegistration = ClientRegistration
                .withRegistrationId("google")
                .clientId("client-id")
                .clientSecret("client-secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://booktine.test/login/oauth2/code/google")
                .scope("profile", "email")
                .authorizationUri("https://accounts.google.com/o/oauth2/auth")
                .tokenUri("https://oauth2.googleapis.com/token")
                .userInfoUri("https://openidconnect.googleapis.com/v1/userinfo")
                .userNameAttributeName("sub")
                .clientName("Google")
                .build();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                "access-token",
                Instant.now(),
                Instant.now().plusSeconds(300),
                Set.of("profile", "email")
        );
        return new OAuth2UserRequest(clientRegistration, accessToken);
    }
}