package booktine.Booktine.domain.user.service;

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
    private final BCryptPasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    /**
     * 회원가입 요청을 처리한다.
     * 로컬 계정 기준으로 이메일/닉네임 중복을 확인한 뒤 비밀번호를 암호화하여 사용자 엔티티를 저장한다.
     */
    @Transactional
    public UserResponse signUp(SignUpRequest request) {
        validateEmailDuplication(request.email());
        String nickname = resolveNickname(request);
        validateNicknameDuplication(nickname);

        User user = User.builder()
                .email(request.email())
                .nickname(nickname)
                .password(passwordEncoder.encode(request.password()))
                .emailVerified(false)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId(null)
                .build();

        return UserResponse.from(userRepository.save(user));
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
        return UserResponse.from(getUserById(userId));
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
        return UserResponse.from(user);
    }

    /**
     * 사용자 계정을 삭제한다.
     * 계정에 프로필 이미지가 연결되어 있으면 S3 파일을 먼저 삭제한 뒤 사용자 엔티티를 제거한다.
     */
    @Transactional
    public void deleteMyAccount(Long userId) {
        User user = getUserById(userId);
        deleteProfileImageIfExists(user);
        userRepository.delete(user);
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

        return UserResponse.from(user);
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
        return UserResponse.from(user);
    }

    /**
     * 닉네임이 비어 있는 회원가입 요청은 이메일 로컬 파트를 기본 닉네임으로 사용한다.
     */
    private String resolveNickname(SignUpRequest request) {
        if (request.nickname() != null && !request.nickname().isBlank()) {
            return request.nickname();
        }
        String emailLocalPart = request.email().split("@", 2)[0];
        return emailLocalPart.length() <= 30 ? emailLocalPart : emailLocalPart.substring(0, 30);
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
