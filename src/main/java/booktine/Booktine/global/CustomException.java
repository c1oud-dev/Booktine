package booktine.Booktine.global;

/**
 * 비즈니스 로직 예외 처리에 사용하는 커스텀 예외
 * Service 레이어에서 throw new CustomException(ErrorCode.XXX) 형태로 사용
 * GlobalExceptionHandler에서 일괄 캐치하여 ApiResponse.fail()로 반환
 */
public class CustomException extends RuntimeException {

    private final ErrorCode errorCode;

    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
