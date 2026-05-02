package booktine.Booktine.global.security;

/**
 * 인증된 사용자 식별자만 보관하는 시큐리티 전용 principal 레코드.
 * JwtFilter가 토큰에서 추출한 userId를 담아 SecurityContextHolder에 저장할 때 사용한다.
 */
public record AuthUser(Long userId) {
}
