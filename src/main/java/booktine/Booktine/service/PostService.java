package booktine.Booktine.service;

import booktine.Booktine.model.Author;
import booktine.Booktine.model.Post;
import booktine.Booktine.model.User;
import booktine.Booktine.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 게시글 관련 비즈니스 로직 처리
 * 게시글 생성, 목록 조회, 단건 조회, 수정, 삭제 등을 메서드로 구현
 */

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    // 1) 게시글 생성
    public Post createPost(Post post, User user) {
        // 만약 post 객체에 author 정보가 없다면, 현재 로그인한 User 정보를 이용해 채워줌
        if (post.getAuthor() == null) {
            Author author = new Author();
            author.setEmail(user.getEmail());
            // Author 클래스에 이름을 위한 필드가 있다면, 아래와 같이 설정 (예: fullName)
            author.setName(user.getFirstName() + " " + user.getLastName());
            post.setAuthor(author);
        } else {
            // 이미 author가 있으면 email이 들어 있는지 확인
            if (post.getAuthor().getEmail() == null) {
                post.getAuthor().setEmail(user.getEmail());
            }
        }
        return postRepository.save(post);
    }

    // 2) 전체 게시글 조회
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // 3) 특정 게시글 조회
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    // 4) 게시글 수정
    public Post updatePost(Long id, Post updatedPost) {
        return postRepository.findById(id)
                .map(existing -> {
                    // 필요한 필드만 갱신
                    existing.setTitle(updatedPost.getTitle());
                    existing.setAuthor(updatedPost.getAuthor());
                    existing.setGenre(updatedPost.getGenre());
                    existing.setPublisher(updatedPost.getPublisher());
                    existing.setSummary(updatedPost.getSummary());
                    existing.setReview(updatedPost.getReview());
                    existing.setStartDate(updatedPost.getStartDate());
                    existing.setEndDate(updatedPost.getEndDate());
                    existing.setReadingStatus(updatedPost.getReadingStatus());
                    existing.setInputAuthor(updatedPost.getInputAuthor());
                    existing.setMemos(updatedPost.getMemos());
                    existing.setLastModified(LocalDateTime.now()); // 최종 수정 일시 업데이트
                    return postRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Post not found with id " + id));
    }

    public int getPostCountByUser(String email) {
        return postRepository.countByAuthor_Email(email);
    }

    public int getCompletedBookCountByUser(String email) {
        return postRepository.countByAuthor_EmailAndReadingStatus(email, "완독");
    }

    // 5) 게시글 삭제
    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}
