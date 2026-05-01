package booktine.Booktine.global.jwt;

import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/**
 * JWT Access Token/Refresh Token의 생성, 검증, 파싱을 담당하는 컴포넌트.
 * AuthService에서 토큰 발급 및 사용자 식별자 추출 시 사용된다.
 */
@Component
public class JwtProvider {

    private final JwtProperties jwtProperties;
    private Key signingKey;

    /**
     * JwtProperties를 주입받아 토큰 처리에 사용할 기본 설정을 준비한다.
     */
    public JwtProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    /**
     * 애플리케이션 시작 시 HMAC 서명 키를 초기화한다.
     */
    @PostConstruct
    public void init() {
        this.signingKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 사용자 식별자를 subject로 포함한 Access Token을 생성한다.
     */
    public String generateAccessToken(Long userId) {
        return generateToken(userId, jwtProperties.accessTokenExpiration());
    }

    /**
     * 사용자 식별자를 subject로 포함한 Refresh Token을 생성한다.
     */
    public String generateRefreshToken(Long userId) {
        return generateToken(userId, jwtProperties.refreshTokenExpiration());
    }

    /**
     * 토큰 서명과 만료 시간을 검증하고 유효하지 않으면 예외를 발생시킨다.
     */
    public void validateToken(String token) {
        try {
            Jwts.parser().verifyWith((javax.crypto.SecretKey) signingKey).build().parseSignedClaims(token);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
    }

    /**
     * 토큰에서 사용자 식별자(subject)를 추출한다.
     */
    public Long getUserId(String token) {
        Claims claims = Jwts.parser().verifyWith((javax.crypto.SecretKey) signingKey).build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 토큰의 만료 시각을 밀리초 타임스탬프로 반환한다.
     */
    public long getExpiration(String token) {
        Claims claims = Jwts.parser().verifyWith((javax.crypto.SecretKey) signingKey).build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getExpiration().getTime();
    }

    /**
     * 만료시간을 인자로 받아 공통 JWT 생성 로직을 수행한다.
     */
    private String generateToken(Long userId, long expirationMillis) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(expiration)
                .signWith(signingKey)
                .compact();
    }
}
