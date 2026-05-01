package booktine.Booktine.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Redis 연동에 필요한 템플릿 빈을 등록하는 설정 클래스.
 * 인증 단계에서 RT 저장 및 AT 블랙리스트 관리에 사용된다.
 */
@Configuration
public class RedisConfig {

    /**
     * 문자열 키/값을 사용하는 Redis 템플릿을 생성한다.
     */
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
        return new StringRedisTemplate(redisConnectionFactory);
    }
}
