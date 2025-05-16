package booktine.Booktine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableJpaAuditing
public class BooktineApplication {

	public static void main(String[] args) {
		SpringApplication.run(BooktineApplication.class, args);
	}

	// 업로드 이미지 매핑 (필요 시 주석 해제 후 사용)

    @Bean
    public WebMvcConfigurer resourceConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry
                    .addResourceHandler("/uploads/**")
                    .addResourceLocations("file:uploads/")
                    .setCachePeriod(3600);
            }
        };
    }

}
