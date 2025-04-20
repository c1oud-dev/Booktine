package booktine.Booktine.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
//@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 예: 실제 "uploads" 폴더를 "/images/**" URL로 매핑
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:uploads/");
    }
    // CORS 전역 설정 추가
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")              // ← 전체 경로로 확대
                .allowedOriginPatterns(
                        "https://*.github.io",
                        "https://c1oud-dev.github.io",
                        "http://localhost:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
