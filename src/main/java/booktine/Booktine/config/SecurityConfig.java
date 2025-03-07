package booktine.Booktine.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * "/api/auth/**" 경로를 공개하고, 나머지는 인증을 요구하도록 구성
 */
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1) CORS 허용 설정
            .cors(Customizer.withDefaults())

                // 2) CSRF 비활성화
                .csrf(csrf -> csrf.disable())

                // 3) 특정 경로는 공개, 나머지는 인증 요구
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/posts/**").permitAll() // ← 추가
                        .anyRequest().authenticated()
                )

                // 4) HTTP Basic 인증
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }
    // 5) CORS 설정 Bean 등록
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // 허용할 출처(origin)
        config.addAllowedOrigin("http://localhost:3000");
        // 필요한 경우 '*' 대신 세부적인 메서드/헤더 지정 가능
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        // 인증정보(쿠키 등) 포함 여부
        config.setAllowCredentials(true);

        // 모든 경로에 대해 CORS 설정 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
