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
import booktine.Booktine.domain.user.dto.SignUpRequest;
import booktine.Booktine.domain.user.dto.UpdateProfileRequest;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserAuthProvider;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 사용자 도메인의 핵심 비즈니스 로직을 처리하는 서비스.
 * 회원가입, 중복 검사, 내 정보 조회/수정, 프로필 이미지 관리, 회원 탈퇴 시나리오에서 사용된다.
 * 컨트롤러가 전달한 요청 데이터를 검증하고, 예외 정책(ErrorCode 기반)을 일관되게 적용한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final MemoRepository memoRepository;
    private final ReminderRepository reminderRepository;
    private final RecommendationRepository recommendationRepository;
    private final InquiryRepository inquiryRepository;
    private final MonthlyGoalRepository monthlyGoalRepository;
    private final AnnualGoalRepository annualGoalRepository;
    private final CommunityPostRepository communityPostRepository;
    private final CommunityCommentRepository communityCommentRepository;
    private final CommunityLikeRepository communityLikeRepository;
    private final AuthService authService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    /**
     * 회원가입 요청을 처리한다.
     * 로컬 계정 기준으로 이메일/닉네임 중복을 확인한 뒤 비밀번호를 암호화하여 사용자 엔티티를 저장한다.
     */
    @Transactional
    public UserResponse signUp(SignUpRequest request) {
        validateEmailDuplication(request.email());
        validateSignupEmailVerification(request.email());
        validateNicknameDuplication(request.nickname());

        User user = User.builder()
                .email(request.email())
                .nickname(request.nickname())
                .password(passwordEncoder.encode(request.password()))
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();

        UserResponse response = toUserResponse(userRepository.save(user));
        authService.consumeSignupEmailVerification(request.email());
        return response;
    }

    /**
     * 로컬 계정 기준 이메일 중복 여부를 조회한다.
     * 회원가입 전 사전 중복 확인 API에서 사용된다.
     */
    public boolean isEmailDuplicated(String email) {
        return userRepository.existsByEmailAndAuthProvider(email, UserAuthProvider.LOCAL);
    }

    /**
     * 닉네임 중복 여부를 조회한다.
     * 회원가입 및 프로필 변경 전 사전 중복 확인 API에서 사용된다.
     */
    public boolean isNicknameDuplicated(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    /**
     * 사용자 식별자 기준으로 내 정보를 조회한다.
     * 사용자가 존재하지 않으면 USER_NOT_FOUND 예외를 발생시킨다.
     */
    public UserResponse getMyInfo(Long userId) {
        return toUserResponse(getUserById(userId));
    }

    /**
     * 내 프로필(닉네임, 자기소개)을 수정한다.
     * 현재 비밀번호를 먼저 검증하고, 닉네임이 변경되는 경우에만 중복 검사를 수행한다.
     */
    @Transactional
    public UserResponse updateMyProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);

        validateCurrentPassword(request.password(), user.getPassword());
        validateNicknameDuplicationOnUpdate(user, request.nickname());

        user.updateProfile(request.nickname(), request.aboutMe());
        return toUserResponse(user);
    }

    /**
     * 사용자 계정을 삭제한다.
     * 계정에 프로필 이미지가 연결되어 있으면 S3 파일을 먼저 삭제한 뒤 사용자 엔티티를 제거한다.
     */
    @Transactional
    public void deleteMyAccount(Long userId) {
        deleteMyAccount(userId, null);
    }

    /**
     * 사용자 계정을 삭제하고 Redis에 남은 인증 토큰도 무효화한다.
     * 사용자와 FK로 연결된 하위 데이터를 먼저 제거하여 DB 제약 조건 위반을 방지한다.
     */
    @Transactional
    public void deleteMyAccount(Long userId, String accessToken) {
        User user = getUserById(userId);
        deleteUserRelations(userId);
        deleteProfileImageIfExists(user);
        userRepository.delete(user);
        authService.revokeUserTokens(userId, accessToken, "withdrawal");
    }

    /**
     * 회원 탈퇴 시 users를 참조하는 데이터를 FK 의존 순서에 맞춰 삭제한다.
     */
    private void deleteUserRelations(Long userId) {
        recommendationRepository.deleteAllByUserId(userId);
        reminderRepository.deleteAllByUserId(userId);
        inquiryRepository.deleteAllByUserId(userId);
        monthlyGoalRepository.deleteAllByUserId(userId);
        annualGoalRepository.deleteAllByUserId(userId);

        deleteCommunityRelations(userId);

        memoRepository.deleteAllByPostUserId(userId);
        postRepository.deleteAllByUserId(userId);
    }

    /**
     * 커뮤니티 게시글/댓글/좋아요는 상호 참조가 있어 댓글과 좋아요를 먼저 삭제한 뒤 게시글을 삭제한다.
     */
    private void deleteCommunityRelations(Long userId) {
        communityLikeRepository.deleteAllByUserId(userId);

        List<Long> communityPostIds = communityPostRepository.findIdsByUserId(userId);
        if (!communityPostIds.isEmpty()) {
            communityCommentRepository.deleteAllByParentPostIdIn(communityPostIds);
            communityCommentRepository.deleteAllByPostIdIn(communityPostIds);
            communityLikeRepository.deleteAllByPostIdIn(communityPostIds);
            communityPostRepository.deleteAllByUserId(userId);
        }

        communityCommentRepository.deleteAllByParentUserId(userId);
        communityCommentRepository.deleteAllByUserId(userId);
    }

    /**
     * 프로필 이미지를 업로드하여 사용자 정보에 반영한다.
     * 기존 이미지가 있으면 S3에서 제거한 후 새 이미지를 업로드해 URL을 저장한다.
     */
    @Transactional
    public UserResponse uploadMyImage(Long userId, MultipartFile image) {
        User user = getUserById(userId);

        deleteProfileImageIfExists(user);
        String uploadedImageUrl = s3Service.uploadImage(image);
        user.updateProfileImageUrl(uploadedImageUrl);

        return toUserResponse(user);
    }

    /**
     * 프로필 이미지를 삭제한다.
     * 이미지가 존재하는 경우에만 S3 파일을 삭제하고, 사용자 엔티티의 이미지 URL을 null로 초기화한다.
     */
    @Transactional
    public UserResponse deleteMyImage(Long userId) {
        User user = getUserById(userId);
        deleteProfileImageIfExists(user);
        user.updateProfileImageUrl(null);
        return toUserResponse(user);
    }

    /**
     * 회원가입 전 이메일 인증 완료 여부를 검증한다.
     */
    private void validateSignupEmailVerification(String email) {
        if (!authService.isSignupEmailVerified(email)) {
            throw new CustomException(ErrorCode.USER_NOT_VERIFIED);
        }
    }

    /**
     * 사용자 응답에 프로필과 독서 현황 집계를 함께 담는다.
     */
    private UserResponse toUserResponse(User user) {
        long readingCount = postRepository.countByUserIdAndReadingStatus(user.getId(), ReadingStatus.READING);
        long completedCount = postRepository.countByUserIdAndReadingStatus(user.getId(), ReadingStatus.COMPLETED);
        return UserResponse.from(user, readingCount, completedCount);
    }

    /**
     * 이메일이 이미 사용 중이면 DUPLICATE_EMAIL 예외를 발생시킨다.
     */
    private void validateEmailDuplication(String email) {
        if (userRepository.existsByEmailAndAuthProvider(email, UserAuthProvider.LOCAL)) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }
    }

    /**
     * 닉네임이 이미 사용 중이면 DUPLICATE_NICKNAME 예외를 발생시킨다.
     */
    private void validateNicknameDuplication(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }
    }

    /**
     * 프로필 수정에서 닉네임이 실제로 변경되는 경우에만 중복 검사를 수행한다.
     * 변경 대상 닉네임이 이미 존재하면 DUPLICATE_NICKNAME 예외를 발생시킨다.
     */
    private void validateNicknameDuplicationOnUpdate(User user, String nickname) {
        if (!user.getNickname().equals(nickname) && userRepository.existsByNickname(nickname)) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }
    }

    /**
     * 입력한 현재 비밀번호와 저장된 해시 비밀번호를 비교한다.
     * 불일치하면 INVALID_PASSWORD 예외를 발생시킨다.
     */
    private void validateCurrentPassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }
    }

    /**
     * 사용자 식별자로 사용자 엔티티를 조회한다.
     * 조회 결과가 없으면 USER_NOT_FOUND 예외를 발생시킨다.
     */
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * 사용자 프로필 이미지가 존재하면 S3에서 해당 이미지를 삭제한다.
     * 중복된 S3 삭제 로직을 공통 메서드로 분리해 가독성과 유지보수성을 높인다.
     */
    private void deleteProfileImageIfExists(User user) {
        String currentProfileImageUrl = user.getProfileImageUrl();
        if (currentProfileImageUrl != null) {
            s3Service.deleteImage(currentProfileImageUrl);
        }
    }
}
