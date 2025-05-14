package booktine.Booktine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


@EnableJpaAuditing
@SpringBootApplication
public class BooktineApplication implements WebMvcConfigurer {

	public static void main(String[] args) {
		SpringApplication.run(BooktineApplication.class, args);
	}

	// 업로드 이미지 매핑 (변경 없음)
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry
				.addResourceHandler("/images/**")
				.addResourceLocations("file:uploads/");
	}

	// ⚡️ SecurityFilterChain 수정 전/후

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				// ✅ CorsConfig의 정책을 Security 필터 체인에 연결
				.cors(Customizer.withDefaults())
				// ✅ CSRF 끄고
				.csrf(csrf -> csrf.disable())
				// ✅ 프리플라이트 요청 허용
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						// … 기타 인증 없이 열릴 경로(auth, static 등) …
						.anyRequest().authenticated()
				);
		return http.build();
	}
}
