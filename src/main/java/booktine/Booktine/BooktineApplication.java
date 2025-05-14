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
				.cors(Customizer.withDefaults())
				.csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth
						// 헬스체크 허용
						.requestMatchers("/actuator/health").permitAll()

						.requestMatchers(HttpMethod.POST, "/api/auth/signup").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
						.requestMatchers(HttpMethod.GET,  "/api/auth/check-email").permitAll()
						.requestMatchers(HttpMethod.GET,  "/api/auth/check-nickname").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()

						// preflight
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// ⚡️ 정적 리소스 허용 패턴 추가
						.requestMatchers(
								"/",
								"/index.html",
								"/**/*.js",
								"/**/*.css",
								"/**/*.png",
								"/favicon.ico"
						).permitAll()

						.anyRequest().authenticated()
				);
		return http.build();
	}
}
