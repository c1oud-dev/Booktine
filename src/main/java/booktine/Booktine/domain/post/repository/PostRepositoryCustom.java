package booktine.Booktine.domain.post.repository;

import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;

import java.util.List;

/**
 * QueryDSL 기반 Post 커스텀 쿼리 인터페이스.
 * PostRepositoryImpl에서 구현되며 PostRepository에서 상속한다.
 */
public interface PostRepositoryCustom {

    /**
     * 키워드와 독서 상태를 조건으로 게시물을 검색한다.
     */
    List<Post> searchPosts(Long userId, String keyword, ReadingStatus status);
}
