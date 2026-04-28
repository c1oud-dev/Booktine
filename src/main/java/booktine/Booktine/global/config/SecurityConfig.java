package booktine.Booktine.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 스프링 시큐리티 기본 설정 클래스.
 * D8 JWT 인증 도입 전 단계로 모든 요청을 허용하고, 비밀번호 암호화를 위한 Encoder 빈을 제공한다.
 */
@Configuration
public class SecurityConfig {

    /**
     * 현재 단계에서 모든 요청을 허용하고 CSRF를 비활성화한 보안 필터 체인을 구성한다.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }

    /**
     * 사용자 비밀번호 암호화/검증에 사용하는 BCryptPasswordEncoder 빈을 등록한다.
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
