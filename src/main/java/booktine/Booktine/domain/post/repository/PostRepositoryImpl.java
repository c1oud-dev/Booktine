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
 * 키워드 검색 및 독서 상태 필터 기능을 제공한다.
 */
@RequiredArgsConstructor
public class PostRepositoryImpl implements PostRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    /**
     * 유저 ID 기준으로 키워드(제목, 저자)와 독서 상태를 조건으로 게시물을 검색한다.
     * keyword, status 모두 null이면 전체 목록을 반환한다.
     */
    @Override
    public List<Post> searchPosts(Long userId, String keyword, ReadingStatus status) {
        QPost post = QPost.post;
        BooleanBuilder builder = new BooleanBuilder();

        builder.and(post.user.id.eq(userId));

        if (keyword != null && !keyword.isBlank()) {
            builder.and(
                    post.title.containsIgnoreCase(keyword)
                            .or(post.author.containsIgnoreCase(keyword))
            );
        }

        if (status != null) {
            builder.and(post.readingStatus.eq(status));
        }

        return queryFactory
                .selectFrom(post)
                .where(builder)
                .orderBy(post.createdAt.desc())
                .fetch();
    }
}
