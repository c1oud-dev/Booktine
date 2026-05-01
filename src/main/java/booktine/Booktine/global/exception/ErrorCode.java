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
