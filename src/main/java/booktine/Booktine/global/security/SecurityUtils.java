package booktine.Booktine.global.security;

import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * SecurityContextHolder에서 현재 인증 사용자 정보를 읽어오는 유틸리티 클래스.
 * 컨트롤러에서 RequestParam userId 제거 후 공통적으로 현재 userId를 꺼낼 때 사용한다.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * 현재 요청의 인증 principal에서 userId를 추출해 반환한다.
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser authUser)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        return authUser.userId();
    }
}

