package booktine.Booktine.domain.auth.service;

import booktine.Booktine.domain.auth.dto.EmailSendRequest;
import booktine.Booktine.domain.auth.dto.EmailVerifyRequest;
import booktine.Booktine.domain.auth.dto.LoginRequest;
import booktine.Booktine.domain.auth.dto.TokenResponse;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserAuthProvider;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.jwt.JwtProperties;
import booktine.Booktine.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

/** 인증 관련 비즈니스 로직을 처리하는 서비스. */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    private static final String RT_PREFIX = "RT:";
    private static final String BL_PREFIX = "BL:";
    private static final String EMAIL_CODE_PREFIX = "EMAIL_CODE:";
    private static final long EMAIL_CODE_TTL_MINUTES = 5L;
    private static final String SIGNUP_PURPOSE = "SIGNUP";
    private static final String PASSWORD_RESET_PURPOSE = "PASSWORD_RESET";

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final JwtProperties jwtProperties;
    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender javaMailSender;

    @Value("${spring.profiles.active:local}")
    private String activeProfile;

    /** 로그인 후 AT/RT 발급 및 Redis에 RT 저장을 수행한다. */
    @Transactional
    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) throw new CustomException(ErrorCode.INVALID_PASSWORD);
        if (!user.isEmailVerified()) throw new CustomException(ErrorCode.USER_NOT_VERIFIED);

        String accessToken = jwtProvider.generateAccessToken(user.getId());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());
        redisTemplate.opsForValue().set(RT_PREFIX + user.getId(), refreshToken, jwtProperties.refreshTokenExpiration(), TimeUnit.MILLISECONDS);
        return new LoginResult(new TokenResponse(accessToken), refreshToken);
    }

    /** 이메일 인증 코드를 생성해 Redis에 저장하고 메일로 발송한다. */
    @Transactional
    public void sendEmailCode(EmailSendRequest request) {
        String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        saveEmailCode(request.email(), request.purpose(), code);

        SimpleMailMessage message = createEmailCodeMessage(request.email(), code);

        if (isProdProfile()) {
            javaMailSender.send(message);
        } else {
            log.info("[로컬 환경] 이메일 발송 스킵 - 수신자: {}", request.email());
        }
    }

    /** 이메일 인증 코드를 검증하고 회원가입 목적이면 계정을 활성화한다. */
    @Transactional
    public void verifyEmailCode(EmailVerifyRequest request) {
        validateEmailCode(request.email(), request.purpose(), request.code());

        if (SIGNUP_PURPOSE.equalsIgnoreCase(request.purpose())) {
            User user = userRepository.findByEmailAndAuthProvider(request.email(), UserAuthProvider.LOCAL).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            user.verifyEmail();
        }
        deleteEmailCode(request.email(), request.purpose());
    }

    /** 이메일 인증 코드를 검증한 뒤 비밀번호를 재설정한다. */
    @Transactional
    public void resetPasswordByEmail(String email, String code, String newPassword) {
        validateEmailCode(email, PASSWORD_RESET_PURPOSE, code);

        User user = userRepository.findByEmailAndAuthProvider(email, UserAuthProvider.LOCAL).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.updatePassword(passwordEncoder.encode(newPassword));
        deleteEmailCode(email, PASSWORD_RESET_PURPOSE);
    }


    /** 로그아웃 시 RT를 삭제하고 AT를 블랙리스트에 등록한다. */
    @Transactional
    public void logout(String accessToken) {
        jwtProvider.validateToken(accessToken);
        Long userId = jwtProvider.getUserId(accessToken);
        redisTemplate.delete(RT_PREFIX + userId);
        long remainMillis = jwtProvider.getExpiration(accessToken) - System.currentTimeMillis();
        if (remainMillis > 0) redisTemplate.opsForValue().set(BL_PREFIX + accessToken, "logout", remainMillis, TimeUnit.MILLISECONDS);
    }

    /** RT를 검증하고 새 Access Token을 발급한다. */
    public TokenResponse reissueAccessToken(String refreshToken) {
        jwtProvider.validateToken(refreshToken);
        Long userId = jwtProvider.getUserId(refreshToken);
        String savedRefreshToken = redisTemplate.opsForValue().get(RT_PREFIX + userId);
        if (savedRefreshToken == null || !savedRefreshToken.equals(refreshToken)) throw new CustomException(ErrorCode.UNAUTHORIZED);
        return new TokenResponse(jwtProvider.generateAccessToken(userId));
    }

    /** Access Token의 사용자로 비밀번호를 재설정한다. */
    @Transactional
    public void resetPassword(String accessToken, String currentPassword, String newPassword) {
        jwtProvider.validateToken(accessToken);
        Long userId = jwtProvider.getUserId(accessToken);
        User user = userRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) throw new CustomException(ErrorCode.INVALID_PASSWORD);
        user.updatePassword(passwordEncoder.encode(newPassword));
    }

    /** 인증 코드 Redis Key를 생성한다. */
    private String buildEmailCodeKey(String email, String purpose) {
        return EMAIL_CODE_PREFIX + purpose + ":" + email; }

    /** 이메일 인증 코드를 Redis에 저장한다. */
    private void saveEmailCode(String email, String purpose, String code) {
        redisTemplate.opsForValue().set(buildEmailCodeKey(email, purpose), code, EMAIL_CODE_TTL_MINUTES, TimeUnit.MINUTES);
    }

    /** 이메일 인증 코드 메일 메시지를 생성한다. */
    private SimpleMailMessage createEmailCodeMessage(String email, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("[Booktine] 이메일 인증 코드");
        message.setText("인증 코드: " + code + "\n" + EMAIL_CODE_TTL_MINUTES + "분 안에 입력해 주세요.");
        return message;
    }

    /** 운영 프로필 실행 여부를 반환한다. */
    private boolean isProdProfile() {
        return "prod".equals(activeProfile);
    }

    /** Redis에 저장된 이메일 인증 코드를 검증한다. */
    private void validateEmailCode(String email, String purpose, String code) {
        String savedCode = redisTemplate.opsForValue().get(buildEmailCodeKey(email, purpose));
        if (savedCode == null) throw new CustomException(ErrorCode.EMAIL_CODE_EXPIRED);
        if (!savedCode.equals(code)) throw new CustomException(ErrorCode.EMAIL_CODE_MISMATCH);
    }

    /** 이메일 인증 코드 Redis 데이터를 삭제한다. */
    private void deleteEmailCode(String email, String purpose) {
        redisTemplate.delete(buildEmailCodeKey(email, purpose));
    }

    /** 로그인 결과를 반환하기 위한 record 타입. */
    public record LoginResult(TokenResponse tokenResponse, String refreshToken) {}
}