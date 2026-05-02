package booktine.Booktine.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger(OpenAPI) 문서의 공통 메타데이터와 인증 스키마를 정의하는 설정 클래스.
 * Springdoc가 애플리케이션 시작 시 본 설정을 읽어 Swagger UI에 API 설명과 JWT 인증 입력 UI를 제공한다.
 */
@Configuration
public class SwaggerConfig {

    /**
     * API 기본 정보와 Bearer JWT 인증 헤더 스키마를 포함한 OpenAPI 스펙 빈을 생성한다.
     */
    @Bean
    public OpenAPI openAPI() {
        String jwtSchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Booktine API")
                        .description("Booktine 백엔드 API 문서")
                        .version("v1"))
                .addSecurityItem(new SecurityRequirement().addList(jwtSchemeName))
                .components(new Components()
                        .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
                                .name("Authorization")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .in(SecurityScheme.In.HEADER)));
    }
}