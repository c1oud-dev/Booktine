package booktine.Booktine.global.exception;

/**
 * 서비스 전역에서 사용하는 에러 코드 정의.
 * CustomException 발생 시 ErrorCode를 함께 던져 GlobalExceptionHandler에서 일괄 처리한다.
 */
public enum ErrorCode {
    INVALID_INPUT(400, "잘못된 입력입니다."),
    UNAUTHORIZED(401, "인증이 필요합니다."),
    FORBIDDEN(403, "접근 권한이 없습니다."),
    NOT_FOUND(404, "요청한 리소스를 찾을 수 없습니다."),
    USER_NOT_FOUND(404, "사용자를 찾을 수 없습니다."),
    POST_NOT_FOUND(404, "게시물을 찾을 수 없습니다."),
    COMMUNITY_POST_NOT_FOUND(404, "커뮤니티 게시글을 찾을 수 없습니다."),
    COMMUNITY_COMMENT_NOT_FOUND(404, "커뮤니티 댓글을 찾을 수 없습니다."),
    COMMUNITY_LIKE_NOT_FOUND(404, "커뮤니티 좋아요를 찾을 수 없습니다."),
    COMMUNITY_LIKE_ALREADY_EXISTS(409, "이미 좋아요를 누른 게시글입니다."),
    COMMUNITY_REPLY_DEPTH_EXCEEDED(400, "대댓글에는 대댓글을 작성할 수 없습니다."),
    MEMO_NOT_FOUND(404, "메모를 찾을 수 없습니다."),
    ANNUAL_GOAL_NOT_FOUND(404, "연간 목표를 찾을 수 없습니다."),
    ANNUAL_GOAL_ALREADY_EXISTS(409, "해당 연도의 연간 목표가 이미 존재합니다."),
    MONTHLY_GOAL_NOT_FOUND(404, "월간 목표를 찾을 수 없습니다."),
    MONTHLY_GOAL_ALREADY_EXISTS(409, "해당 월의 월간 목표가 이미 존재합니다."),
    RECOMMENDATION_NOT_FOUND(404, "추천 도서를 찾을 수 없습니다."),
    RECOMMENDATION_NOT_AVAILABLE(404, "추천 가능한 도서를 찾을 수 없습니다."),
    REMINDER_NOT_FOUND(404, "리마인더를 찾을 수 없습니다."),
    INVALID_PASSWORD(400, "비밀번호가 일치하지 않습니다."),
    DUPLICATE_EMAIL(409, "이미 사용 중인 이메일입니다."),
    DUPLICATE_NICKNAME(409, "이미 사용 중인 닉네임입니다."),
    EMAIL_CODE_EXPIRED(400, "인증 코드가 만료되었거나 존재하지 않습니다."),
    EMAIL_CODE_MISMATCH(400, "인증 코드가 일치하지 않습니다."),
    EMAIL_VERIFY_ATTEMPT_EXCEEDED(429, "이메일 인증 시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요."),
    LOGIN_ATTEMPT_EXCEEDED(429, "로그인 실패 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요."),
    USER_NOT_VERIFIED(403, "이메일 인증이 완료되지 않은 계정입니다."),
    INVALID_IMAGE_TYPE(400, "허용되지 않은 이미지 형식입니다."),
    IMAGE_SIZE_EXCEEDED(400, "이미지 파일 크기 제한을 초과했습니다."),
    IMAGE_UPLOAD_FAILED(500, "이미지 업로드에 실패했습니다."),
    INTERNAL_SERVER_ERROR(500, "서버 내부 오류가 발생했습니다.");

    private final int status;
    private final String message;

    ErrorCode(int status, String message) {
        this.status = status;
        this.message = message;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
