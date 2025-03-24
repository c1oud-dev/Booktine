package booktine.Booktine.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 예: 실제 "uploads" 폴더를 "/images/**" URL로 매핑
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:uploads/");
    }
}
