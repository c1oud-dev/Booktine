package booktine.Booktine.global;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Auditing 활성화 설정
 * BaseEntity의 createdAt, updatedAt 자동 기록을 위해 필요
 * 메인 클래스 대신 별도 Config로 분리하여 테스트 환경에서의 충돌 방지
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
