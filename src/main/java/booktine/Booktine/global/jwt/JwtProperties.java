package booktine.Booktine.global.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * JWT 생성/검증에 필요한 설정값을 바인딩하는 프로퍼티 클래스.
 * application.properties의 app.jwt.* 값을 주입받아 JwtProvider에서 사용한다.
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String secret, long accessTokenExpiration, long refreshTokenExpiration) {
}
