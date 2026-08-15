package booktine.Booktine.domain.user.service;

import booktine.Booktine.domain.auth.service.AuthService;
import booktine.Booktine.domain.community.repository.CommunityCommentRepository;
import booktine.Booktine.domain.community.repository.CommunityLikeRepository;
import booktine.Booktine.domain.community.repository.CommunityPostRepository;
import booktine.Booktine.domain.inquiry.repository.InquiryRepository;
import booktine.Booktine.domain.memo.repository.MemoRepository;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.progress.repository.AnnualGoalRepository;
import booktine.Booktine.domain.progress.repository.MonthlyGoalRepository;
import booktine.Booktine.domain.recommendation.repository.RecommendationRepository;
import booktine.Booktine.domain.reminder.repository.ReminderRepository;
import booktine.Booktine.domain.user.dto.*;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserAuthProvider;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.s3.S3Service;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

/**
 * UserService 단위 테스트
 * Mockito를 사용해 UserRepository, BCryptPasswordEncoder, S3Service를 Mock 처리하고
 * 사용자 도메인 서비스의 핵심 비즈니스 로직을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private MemoRepository memoRepository;

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private RecommendationRepository recommendationRepository;

    @Mock
    private InquiryRepository inquiryRepository;

    @Mock
    private MonthlyGoalRepository monthlyGoalRepository;

    @Mock
    private AnnualGoalRepository annualGoalRepository;

    @Mock
    private CommunityPostRepository communityPostRepository;

    @Mock
    private CommunityCommentRepository communityCommentRepository;

    @Mock
    private CommunityLikeRepository communityLikeRepository;

    @Mock
    private AuthService authService;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private S3Service s3Service;

    /**
     * 회원가입 시 중복 검증과 저장이 정상 처리되는지 검증한다.
     */
    @Test
    @DisplayName("회원가입 성공")
    void signUp_success() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(false);
        given(authService.isSignupEmailVerified(request.email())).willReturn(true);
        given(userRepository.existsByNickname(request.nickname())).willReturn(false);
        given(passwordEncoder.encode(request.password())).willReturn("encodedPassword");

        User savedUser = User.builder()
                .email(request.email())
                .nickname(request.nickname())
                .password("encodedPassword")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();
        ReflectionTestUtils.setField(savedUser, "id", 1L);
        given(userRepository.save(any(User.class))).willReturn(savedUser);

        // when
        UserResponse response = userService.signUp(request);

        // then
        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.nickname()).isEqualTo("테스터");
        verify(userRepository, times(1)).save(any(User.class));
        verify(authService, times(1)).consumeSignupEmailVerification(request.email());
    }

    @Test
    @DisplayName("회원가입 전 이메일 미인증 시 예외 발생")
    void signUp_unverifiedEmail_throwsException() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(false);
        given(authService.isSignupEmailVerified(request.email())).willReturn(false);

        // when & then
        assertThatThrownBy(() -> userService.signUp(request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_VERIFIED);
    }

    /**
     * 회원가입 시 로컬 계정 이메일이 중복되면 예외가 발생하는지 검증한다.
     */
    @Test
    @DisplayName("이메일 중복 시 예외 발생")
    void signUp_duplicateEmail_throwsException() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.signUp(request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_EMAIL);
    }

    /**
     * 회원가입 시 닉네임이 중복되면 예외가 발생하는지 검증한다.
     */
    @Test
    @DisplayName("닉네임 중복 시 예외 발생")
    void signUp_duplicateNickname_throwsException() {
        // given
        SignUpRequest request = new SignUpRequest("test@test.com", "테스터", "password123!");
        given(userRepository.existsByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL)).willReturn(false);
        given(authService.isSignupEmailVerified(request.email())).willReturn(true);
        given(userRepository.existsByNickname(request.nickname())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.signUp(request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_NICKNAME);
    }

    @Test
    @DisplayName("이메일 중복 여부 조회 성공")
    void isEmailDuplicated_success() {
        // given
        given(userRepository.existsByEmailAndAuthProvider("test@test.com", UserAuthProvider.LOCAL))
                .willReturn(true);

        // when
        boolean duplicated = userService.isEmailDuplicated("test@test.com");

        // then
        assertThat(duplicated).isTrue();
    }

    @Test
    @DisplayName("닉네임 중복 여부 조회 성공")
    void isNicknameDuplicated_success() {
        // given
        given(userRepository.existsByNickname("테스터")).willReturn(true);

        // when
        boolean duplicated = userService.isNicknameDuplicated("테스터");

        // then
        assertThat(duplicated).isTrue();
    }

    /**
     * 사용자 식별자로 내 정보를 조회할 수 있는지 검증한다.
     */
    @Test
    @DisplayName("내 정보 조회 성공")
    void getMyInfo_success() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .nickname("테스터")
                .password("encodedPassword")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        // when
        UserResponse response = userService.getMyInfo(1L);

        // then
        assertThat(response.email()).isEqualTo("test@test.com");
        assertThat(response.nickname()).isEqualTo("테스터");
    }

    @Test
    @DisplayName("존재하지 않는 사용자 내 정보 조회 시 예외 발생")
    void getMyInfo_userNotFound_throwsException() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.getMyInfo(1L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("사용자 공개 프로필 조회 성공")
    void getUserProfile_success() {
        // given
        User user = createUser();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        // when
        UserProfileResponse response = userService.getUserProfile(1L);

        // then
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.nickname()).isEqualTo("테스터");
    }

    @Test
    @DisplayName("존재하지 않는 사용자 공개 프로필 조회 시 예외 발생")
    void getUserProfile_userNotFound_throwsException() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.getUserProfile(1L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("마이페이지 조회 성공")
    void getMyPage_success() {
        // given
        User user = createUser();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(postRepository.countByUserIdAndReadingStatus(1L, ReadingStatus.READING))
                .willReturn(2L);
        given(postRepository.countByUserIdAndReadingStatus(1L, ReadingStatus.COMPLETED))
                .willReturn(3L);
        given(postRepository.countByUserIdAndReadingStatus(1L, ReadingStatus.WISHLIST))
                .willReturn(4L);
        given(communityPostRepository.findTop5ByUserIdOrderByCreatedAtDesc(1L))
                .willReturn(List.of());
        given(communityCommentRepository.findTop10ByUserIdOrderByCreatedAtDesc(1L))
                .willReturn(List.of());

        // when
        MyPageResponse response = userService.getMyPage(1L);

        // then
        assertThat(response.readingCount()).isEqualTo(2L);
        assertThat(response.completedCount()).isEqualTo(3L);
        assertThat(response.wishCount()).isEqualTo(4L);
        assertThat(response.communityPosts()).isEmpty();
        assertThat(response.comments()).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 사용자 마이페이지 조회 시 예외 발생")
    void getMyPage_userNotFound_throwsException() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.getMyPage(1L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    /**
     * 비밀번호 검증 후 프로필 수정이 정상 반영되는지 검증한다.
     */
    @Test
    @DisplayName("내 정보 수정 성공")
    void updateMyProfile_success() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .nickname("테스터")
                .password("encodedPassword")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);

        UpdateProfileRequest request = new UpdateProfileRequest("새닉네임", "새자기소개", "password123!");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.password(), user.getPassword())).willReturn(true);
        given(userRepository.existsByNickname(request.nickname())).willReturn(false);

        // when
        UserResponse response = userService.updateMyProfile(1L, request);

        // then
        assertThat(response.nickname()).isEqualTo("새닉네임");
        assertThat(response.aboutMe()).isEqualTo("새자기소개");
    }

    @Test
    @DisplayName("내 정보 수정 시 비밀번호 불일치 예외 발생")
    void updateMyProfile_invalidPassword_throwsException() {
        // given
        User user = createUser();
        UpdateProfileRequest request = new UpdateProfileRequest(
                "새닉네임",
                "새자기소개",
                "wrongPassword"
        );
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.password(), user.getPassword())).willReturn(false);

        // when & then
        assertThatThrownBy(() -> userService.updateMyProfile(1L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_PASSWORD);
    }

    @Test
    @DisplayName("내 정보 수정 시 닉네임 중복 예외 발생")
    void updateMyProfile_duplicateNickname_throwsException() {
        // given
        User user = createUser();
        UpdateProfileRequest request = new UpdateProfileRequest(
                "중복닉네임",
                "새자기소개",
                "password123!"
        );
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(request.password(), user.getPassword())).willReturn(true);
        given(userRepository.existsByNickname(request.nickname())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.updateMyProfile(1L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_NICKNAME);
    }

    @Test
    @DisplayName("존재하지 않는 사용자 내 정보 수정 시 예외 발생")
    void updateMyProfile_userNotFound_throwsException() {
        // given
        UpdateProfileRequest request = new UpdateProfileRequest(
                "새닉네임",
                "새자기소개",
                "password123!"
        );
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.updateMyProfile(1L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    /**
     * 사용자 탈퇴 시 사용자 삭제가 수행되는지 검증한다.
     */
    @Test
    @DisplayName("회원탈퇴 성공")
    void deleteMyAccount_success() {
        // given
        User user = User.builder()
                .email("test@test.com")
                .password("encodedPassword")
                .nickname("테스터")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);

        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(communityPostRepository.findIdsByUserId(1L)).willReturn(List.of());

        // when
        userService.deleteMyAccount(1L, "access-token");

        // then
        verify(memoRepository, times(1)).deleteAllByPostUserId(1L);
        verify(postRepository, times(1)).deleteAllByUserId(1L);
        verify(userRepository, times(1)).delete(user);
        verify(authService, times(1)).revokeUserTokens(1L, "access-token", "withdrawal");
    }

    @Test
    @DisplayName("회원탈퇴 시 커뮤니티 연관 데이터 삭제 성공")
    void deleteMyAccount_withCommunityPosts_success() {
        // given
        User user = createUser();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(communityPostRepository.findIdsByUserId(1L)).willReturn(List.of(10L, 20L));

        // when
        userService.deleteMyAccount(1L, "access-token");

        // then
        verify(communityCommentRepository, times(1))
                .deleteAllByParentPostIdIn(List.of(10L, 20L));
        verify(communityCommentRepository, times(1))
                .deleteAllByPostIdIn(List.of(10L, 20L));
        verify(communityLikeRepository, times(1))
                .deleteAllByPostIdIn(List.of(10L, 20L));
        verify(communityPostRepository, times(1)).deleteAllByUserId(1L);
    }

    @Test
    @DisplayName("존재하지 않는 사용자 회원탈퇴 시 예외 발생")
    void deleteMyAccount_userNotFound_throwsException() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.deleteMyAccount(1L, "access-token"))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("프로필 이미지 업로드 성공")
    void uploadMyImage_success() {
        // given
        User user = createUser();
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "profile.png",
                "image/png",
                new byte[]{1}
        );
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(s3Service.uploadImage(image)).willReturn("https://example.com/profile.png");

        // when
        UserResponse response = userService.uploadMyImage(1L, image);

        // then
        assertThat(response.profileImageUrl()).isEqualTo("https://example.com/profile.png");
        verify(s3Service, never()).deleteImage(anyString());
    }

    @Test
    @DisplayName("기존 프로필 이미지 교체 성공")
    void uploadMyImage_existingImage_success() {
        // given
        User user = createUser();
        user.updateProfileImageUrl("https://example.com/old.png");
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "profile.png",
                "image/png",
                new byte[]{1}
        );
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(s3Service.uploadImage(image)).willReturn("https://example.com/new.png");

        // when
        UserResponse response = userService.uploadMyImage(1L, image);

        // then
        verify(s3Service, times(1)).deleteImage("https://example.com/old.png");
        assertThat(response.profileImageUrl()).isEqualTo("https://example.com/new.png");
    }

    @Test
    @DisplayName("존재하지 않는 사용자 프로필 이미지 업로드 시 예외 발생")
    void uploadMyImage_userNotFound_throwsException() {
        // given
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "profile.png",
                "image/png",
                new byte[]{1}
        );
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.uploadMyImage(1L, image))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("프로필 이미지 삭제 성공")
    void deleteMyImage_success() {
        // given
        User user = createUser();
        user.updateProfileImageUrl("https://example.com/profile.png");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        // when
        UserResponse response = userService.deleteMyImage(1L);

        // then
        verify(s3Service, times(1)).deleteImage("https://example.com/profile.png");
        assertThat(response.profileImageUrl()).isNull();
    }

    @Test
    @DisplayName("존재하지 않는 사용자 프로필 이미지 삭제 시 예외 발생")
    void deleteMyImage_userNotFound_throwsException() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.deleteMyImage(1L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    private User createUser() {
        User user = User.builder()
                .email("test@test.com")
                .nickname("테스터")
                .password("encodedPassword")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();
        ReflectionTestUtils.setField(user, "id", 1L);
        return user;
    }
}