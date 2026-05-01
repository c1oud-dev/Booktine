package booktine.Booktine.global.config;

import booktine.Booktine.global.jwt.JwtProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT 설정 프로퍼티를 스프링 빈으로 등록하는 구성 클래스.
 * JwtProperties를 활성화하여 JwtProvider에서 주입받아 사용할 수 있도록 한다.
 */
@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class JwtConfig {
}
