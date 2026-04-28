package booktine.Booktine.global.response;

/**
 * 모든 API 응답에 사용되는 공통 응답 래퍼
 * 컨트롤러에서 반환할 때 ApiResponse.ok(data) 또는 ApiResponse.fail(message) 형태로 사용
 */
public record ApiResponse<T>(boolean success, T data, String message) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(true, null, null);
    }

    public static ApiResponse<Void> fail(String message) {
        return new ApiResponse<>(false, null, message);
    }
}