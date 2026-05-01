package booktine.Booktine.domain.auth.dto;

/**
 * Access Token 응답 DTO.
 * 로그인/재발급 시 클라이언트에게 전달되는 토큰 정보를 담는다.
 */
public record TokenResponse(String accessToken) {
}
