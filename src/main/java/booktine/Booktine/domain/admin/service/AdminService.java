package booktine.Booktine.domain.admin.service;

import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자 전용 조회 기능을 제공하는 서비스.
 * 관리자 화면에서 사용자/게시물 목록을 페이지 단위로 조회할 때 이 서비스를 사용한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;

    /**
     * 전체 사용자 페이지를 조회한다.
     * 조회된 User 엔티티를 UserResponse DTO로 변환해 반환한다.
     */
    public Page<UserResponse> getUserPage(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    /**
     * 전체 게시물 페이지를 조회한다.
     * 조회된 Post 엔티티를 PostResponse DTO로 변환해 반환한다.
     */
    public Page<PostResponse> getPostPage(Pageable pageable) {
        return postRepository.findAll(pageable).map(PostResponse::from);
    }
}

