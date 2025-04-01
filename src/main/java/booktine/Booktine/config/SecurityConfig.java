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
    /*@Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 1) /api 이하 모든 경로 허용
                        .requestMatchers("/api/**").permitAll()
                        // 2) /posts 이하 모든 경로 허용
                        .requestMatchers("/posts/**").permitAll()
                        // 3) /progress 이하 모든 경로 허용
                        .requestMatchers("/progress/**").permitAll()
                        // 4) /images 이하 모든 경로 허용
                        .requestMatchers("/images/**").permitAll()
                        // 5) 나머지는 인증 필요
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .build();
    }*/
   /* @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()  // ← 모든 경로 허용
                )
                .build();
    }*/

    /* 1) CORS 설정 Bean */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // 허용할 Origin
        config.addAllowedOrigin("http://localhost:3000");
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

    /*// 5) CORS 설정 Bean 등록
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
    }*/

    /* 2) SecurityFilterChain 최소화 */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                // CORS 적용
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF 비활성화
                .csrf(csrf -> csrf.disable())
                // H2 Console 접근을 위해 frameOptions를 sameOrigin으로 설정
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                // 모든 요청 허용 (임시)
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .build();
    }
}
