package booktine.Booktine.global.security;

import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * 인증은 되었지만 권한이 부족한 사용자의 접근을 403 ApiResponse.fail 응답으로 변환하는 핸들러.
 * Spring Security 인가 단계에서 AccessDeniedException 발생 시 공통 오류 포맷을 유지하기 위해 사용한다.
 */
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    /**
     * ApiResponse JSON 직렬화를 위해 ObjectMapper를 주입받는다.
     */
    public CustomAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * 권한 부족 접근 시 403 상태코드와 실패 메시지를 JSON 본문으로 작성한다.
     */
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.fail(ErrorCode.FORBIDDEN.getMessage())));
    }
}

