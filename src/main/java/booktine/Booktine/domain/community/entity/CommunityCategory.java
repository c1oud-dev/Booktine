package booktine.Booktine.domain.community.entity;

/**
 * 커뮤니티 게시글의 분류 유형을 나타내는 열거형.
 * 게시글 생성/조회 시 카테고리 선택 및 필터링 기준값으로 서비스와 컨트롤러에서 사용된다.
 */
public enum CommunityCategory {
    GENERAL,
    REVIEW,
    QUESTION,
    RECOMMEND
}
