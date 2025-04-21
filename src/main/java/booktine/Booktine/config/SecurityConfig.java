package booktine.Booktine.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * "/api/auth/**" 경로를 공개하고, 나머지는 인증을 요구하도록 구성
 */
@Configuration
public class SecurityConfig {

    /* 1) CORS 설정 Bean */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // 허용할 Origin
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:3000",
            "https://cloud-dev.github.io",
            "https://*.github.io",
            "https://booktine-production.up.railway.app",  // ← 배포된 프론트 도메인
            "https://*.railway.app" // ← 필요 시 모든 railway.app 서브도메인
        ));
        // 모든 메서드(GET, POST, PUT, DELETE...) 허용
        config.addAllowedMethod("*");
        // 모든 헤더 허용
        config.addAllowedHeader("*");
        // 인증정보(쿠키 등) 포함 여부
        config.setAllowCredentials(true);

        // 모든 경로에 대해 CORS 설정 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /* 2) SecurityFilterChain 최소화 */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            // CORS 적용
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // CSRF 비활성화
            .csrf(csrf -> csrf.disable())
            // /api/auth/** 은 누구나, 나머지 요청은 로그인(세션) 필요
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .build();
    }
}
