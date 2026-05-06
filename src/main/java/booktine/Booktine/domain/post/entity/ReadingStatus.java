package booktine.Booktine.domain.post.entity;

import lombok.Getter;

/**
 * 독서 게시물의 진행 상태를 나타내는 열거형.
 * 게시물 생성/수정/조회 시 독서 상태를 일관된 값으로 표현하기 위해 사용된다.
 */
@Getter
public enum ReadingStatus {
    WISHLIST("읽고 싶은 책"),
    WANT_TO_READ("읽고 싶은 책"),
    READING("읽는 중"),
    COMPLETED("완독"),
    PAUSED("중단");

    private final String label;

    ReadingStatus(String label) {
        this.label = label;
    }
}
