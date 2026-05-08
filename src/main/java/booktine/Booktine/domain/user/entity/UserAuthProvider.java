package booktine.Booktine.domain.user.entity;

/**
 * 사용자 인증 수단 제공자를 정의하는 열거형.
 * 이메일 로그인(Local)과 소셜 로그인(Google) 계정을 구분할 때 사용한다.
 */
public enum UserAuthProvider {
    LOCAL,
    GOOGLE,
}
