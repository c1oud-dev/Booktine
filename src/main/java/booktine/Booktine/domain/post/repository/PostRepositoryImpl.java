package booktine.Booktine.domain.post.repository;

import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.QPost;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * QueryDSL 기반 Post 커스텀 쿼리 구현체.
 * 게시물 키워드 검색 및 독서 상태 필터 조건 처리에 사용된다.
 */
@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    /** 유저 ID 기준으로 키워드(제목, 저자)와 독서 상태를 조건으로 게시물을 검색한다. */
    @Override
    public List<Post> searchPosts(Long userId, String keyword, ReadingStatus status) {
        QPost post = QPost.post;
        return queryFactory
                .selectFrom(post)
                .where(buildSearchConditions(post, userId, keyword, status))
                .orderBy(post.createdAt.desc())
                .fetch();
    }

    /**
     * 게시물 검색에 필요한 동적 조건을 구성한다.
     */
    private BooleanBuilder buildSearchConditions(QPost post, Long userId, String keyword, ReadingStatus status) {
        BooleanBuilder conditions = new BooleanBuilder();
        conditions.and(post.user.id.eq(userId));

        if (hasKeyword(keyword)) {
            conditions.and(
                    post.title.containsIgnoreCase(keyword)
                            .or(post.author.containsIgnoreCase(keyword))
            );
        }

        if (status != null) {
            conditions.and(post.readingStatus.eq(status));
        }
        return conditions;
    }

    /**
     * 키워드 검색 조건 적용 여부를 판별한다.
     */
    private boolean hasKeyword(String keyword) {
        return keyword != null && !keyword.isBlank();
    }
}
