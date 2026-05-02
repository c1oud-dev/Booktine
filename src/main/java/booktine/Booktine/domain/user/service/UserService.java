package booktine.Booktine.domain.user.service;

import booktine.Booktine.domain.user.dto.SignUpRequest;
import booktine.Booktine.domain.user.dto.UpdateProfileRequest;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.entity.User;
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
 * 사용자 도메인 비즈니스 로직을 처리하는 서비스.
 * 회원가입, 중복 확인, 내 정보 조회/수정, 회원탈퇴 기능을 담당한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    /**
     * 회원가입 요청을 처리하고 BCrypt로 암호화한 비밀번호를 저장한다.
     */
    @Transactional
    public UserResponse signUp(SignUpRequest request) {
        validateEmailDuplication(request.email());
        validateNicknameDuplication(request.nickname());

        User user = User.builder()
                .email(request.email())
                .nickname(request.nickname())
                .password(passwordEncoder.encode(request.password()))
                .emailVerified(false)
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    /**
     * 전달받은 이메일의 중복 여부를 확인한다.
     */
    public boolean isEmailDuplicated(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * 전달받은 닉네임의 중복 여부를 확인한다.
     */
    public boolean isNicknameDuplicated(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    /**
     * 사용자 식별자로 내 정보를 조회한다.
     */
    public UserResponse getMyInfo(Long userId) {
        return UserResponse.from(getUserById(userId));
    }

    /**
     * 현재 비밀번호를 검증한 뒤 내 프로필 정보를 수정한다.
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
     * 사용자 식별자로 회원을 삭제한다.
     * 프로필 이미지가 존재하면 S3에서도 함께 삭제한다.
     */
    @Transactional
    public void deleteMyAccount(Long userId) {
        User user = getUserById(userId);
        if (user.getProfileImageUrl() != null) {
            s3Service.deleteImage(user.getProfileImageUrl());
        }
        userRepository.delete(user);
    }

    /**
     * 프로필 이미지를 S3에 업로드하고 URL을 저장한다.
     */
    @Transactional
    public UserResponse uploadMyImage(Long userId, MultipartFile image) {
        User user = getUserById(userId);
        if (user.getProfileImageUrl() != null) {
            s3Service.deleteImage(user.getProfileImageUrl());
        }
        user.updateProfileImageUrl(s3Service.uploadImage(image));
        return UserResponse.from(user);
    }

    /**
     * 프로필 이미지를 S3에서 삭제하고 URL을 초기화한다.
     */
    @Transactional
    public UserResponse deleteMyImage(Long userId) {
        User user = getUserById(userId);
        s3Service.deleteImage(user.getProfileImageUrl());
        user.updateProfileImageUrl(null);
        return UserResponse.from(user);
    }

    /**
     * 이메일 중복 시 예외를 발생시킨다.
     */
    private void validateEmailDuplication(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }
    }

    /**
     * 닉네임 중복 시 예외를 발생시킨다.
     */
    private void validateNicknameDuplication(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }
    }

    /**
     * 프로필 수정 시 기존 닉네임과 다른 값에 대해서만 중복 검사를 수행한다.
     */
    private void validateNicknameDuplicationOnUpdate(User user, String nickname) {
        if (!user.getNickname().equals(nickname) && userRepository.existsByNickname(nickname)) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }
    }

    /**
     * 비밀번호 불일치 시 예외를 발생시킨다.
     */
    private void validateCurrentPassword(String rawPassword, String encodedPassword) {
        if (!passwordEncoder.matches(rawPassword, encodedPassword)) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }
    }

    /**
     * 사용자 식별자로 엔티티를 조회하고 없으면 예외를 발생시킨다.
     */
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
