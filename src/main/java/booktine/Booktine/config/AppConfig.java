package booktine.Booktine.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class AppConfig implements WebMvcConfigurer {
    private static final Logger log = LoggerFactory.getLogger(AppConfig.class);

    @PostConstruct
    public void onStartup() {
        log.info("✅ AppConfig loaded: CORS + SecurityFilterChain are active");
    }
    // 1) 정적 리소스 매핑 (기존 기능 그대로)
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/images/**")
                .addResourceLocations("file:uploads/");
    }

    // 2) 전역 CORS 설정 (WebMvcConfigurer)
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "http://localhost:3000",
                        "https://*.github.io",
                        "https://booktine-production.up.railway.app"
                )
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    // 3) SecurityFilterChain — 여기서 .and() 나 deprecated cors() 를 모두 제거
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 이 줄 하나로 WebMvcConfigurer#addCorsMappings 호출
                .cors(withDefaults())
                // CSRF 비활성화
                .csrf(csrf -> csrf.disable())
                // 인가 규칙
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();
    }
}
