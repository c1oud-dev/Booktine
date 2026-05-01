package booktine.Booktine.domain.auth.service;

import booktine.Booktine.domain.auth.dto.LoginRequest;
import booktine.Booktine.domain.auth.dto.TokenResponse;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.jwt.JwtProperties;
import booktine.Booktine.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

/** 인증 관련 비즈니스 로직을 처리하는 서비스. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {
    private static final String RT_PREFIX = "RT:";
    private static final String BL_PREFIX = "BL:";

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final JwtProperties jwtProperties;
    private final StringRedisTemplate redisTemplate;

    /** 로그인 후 AT/RT 발급 및 Redis에 RT 저장을 수행한다. */
    @Transactional
    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) throw new CustomException(ErrorCode.INVALID_PASSWORD);

        String accessToken = jwtProvider.generateAccessToken(user.getId());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());
        redisTemplate.opsForValue().set(RT_PREFIX + user.getId(), refreshToken, jwtProperties.refreshTokenExpiration(), TimeUnit.MILLISECONDS);
        return new LoginResult(new TokenResponse(accessToken), refreshToken);
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

    /** 로그인 결과를 반환하기 위한 record 타입. */
    public record LoginResult(TokenResponse tokenResponse, String refreshToken) {}
}

