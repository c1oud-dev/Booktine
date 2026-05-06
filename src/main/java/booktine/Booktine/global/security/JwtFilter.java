package booktine.Booktine.global.security;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import booktine.Booktine.global.jwt.JwtProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * 요청마다 Authorization Bearer Access Token을 검증하고 인증 정보를 SecurityContext에 저장하는 필터.
 * SecurityConfig에서 UsernamePasswordAuthenticationFilter 앞단에 연결되어 인증이 필요한 모든 요청에서 동작한다.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String BLACKLIST_PREFIX = "BL:";

    private final JwtProvider jwtProvider;
    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;

    /**
     * JWT 파싱/검증과 블랙리스트 확인을 위해 JwtProvider, Redis 템플릿을 주입받는다.
     */
    public JwtFilter(JwtProvider jwtProvider, StringRedisTemplate redisTemplate, UserRepository userRepository) {
        this.jwtProvider = jwtProvider;
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
    }

    /**
     * Authorization 헤더에서 Bearer 토큰을 읽어 검증하고 사용자 인증 정보를 컨텍스트에 저장한다.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = resolveToken(request);

        if (token != null) {
            jwtProvider.validateToken(token);
            validateBlacklistedToken(token);
            Long userId = jwtProvider.getUserId(token);
            User user = userRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            AuthUser authUser = new AuthUser(userId);

            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    authUser,
                    null,
                    List.of(new SimpleGrantedAuthority(user.getRole().name()))
            );
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Redis 블랙리스트에 등록된 토큰인지 확인하고, 등록된 토큰이면 인증 예외를 발생시킨다.
     */
    private void validateBlacklistedToken(String token) {
        if (Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token))) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
    }

    /**
     * Authorization 헤더에서 Bearer 접두사를 제거한 토큰 문자열을 반환한다.
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        String queryToken = request.getParameter("access_token");
        if (StringUtils.hasText(queryToken) && request.getRequestURI().equals("/reminders/connect")) {
            return queryToken;
        }

        return null;
    }
}

