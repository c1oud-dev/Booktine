package booktine.Booktine;

import org.springframework.web.filter.CorsFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@EnableJpaAuditing
@SpringBootApplication
public class BooktineApplication implements WebMvcConfigurer {

	public static void main(String[] args) {
		SpringApplication.run(BooktineApplication.class, args);
	}

	// ⚡️ 수정 후: 모든 오리진과 패턴 허용
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedOriginPatterns("*")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(true)
				.maxAge(3600);
	}

	// 업로드 이미지 매핑 (변경 없음)
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry
				.addResourceHandler("/images/**")
				.addResourceLocations("file:uploads/");
	}

	// ⚡️ SecurityFilterChain 수정 전/후

	// Security 레이어가 사용할 CORS 정책 Bean
	@Bean
    public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of(
				"https://booktine-production.up.railway.app",
				"https://booktine.vercel.app",
				"http://localhost:3000"   // 로컬 개발용
		));
		config.setAllowedOriginPatterns(List.of("*"));
		config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true);
		config.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		return source;
		}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth
						// 헬스체크 허용
						.requestMatchers("/actuator/health").permitAll()
						// preflight
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						// 인증 관련
						.requestMatchers("/api/auth/**").permitAll()

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

	@Bean
	public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(List.of("https://booktine.vercel.app", "http://localhost:3000"));
		config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true);
		config.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
		bean.setOrder(Ordered.HIGHEST_PRECEDENCE);  // 최우선으로 실행
		return bean;
	}
}
