package booktine.Booktine.controller;

import booktine.Booktine.model.Post;
import booktine.Booktine.model.User;
import booktine.Booktine.service.PostService;
import booktine.Booktine.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 *  게시글 관련 API 엔드포인트를 제공
 *  service를 주입받아, POST /posts, GET /posts, GET /posts/{id}, PUT /posts/{id}, DELETE /posts/{id} 등을 처리
 */

@RestController
@RequestMapping("/posts")
public class PostController {
    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    // 1) 게시글 생성
    /*@PostMapping
    public Post createPost(@RequestBody Post post) {
        // 예시: 실제 환경에서는 Spring Security 등에서 현재 사용자 정보를 가져와야 합니다.
        User currentUser = new User();
        currentUser.setEmail("test@example.com");
        currentUser.setFirstName("Test");
        currentUser.setLastName("User");

        return postService.createPost(post, currentUser);
    }*/
    @PostMapping
    public Post createPost(@RequestBody Post post) {
        // 클라이언트가 보내는 post 객체 내의 author.email이 있다면 사용합니다.
        String authorEmail = (post.getAuthor() != null && post.getAuthor().getEmail() != null)
                ? post.getAuthor().getEmail()
                : null;
        if(authorEmail == null) {
            throw new RuntimeException("Author email is required to create a post.");
        }
        // 실제 환경에서는 SecurityContext 등에서 사용자 정보를 가져와야 함.
        Optional<User> optionalUser = userService.findByEmail(authorEmail);
        if(optionalUser.isEmpty()){
            throw new RuntimeException("User not found with email: " + authorEmail);
        }
        User currentUser = optionalUser.get();
        return postService.createPost(post, currentUser);
    }

    // 2) 전체 게시글 조회
    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    // 3) 특정 게시글 조회
    @GetMapping("/{id}")
    public Post getPostById(@PathVariable Long id) {
        return postService.getPostById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id " + id));
    }

    // 4) 게시글 수정
    @PutMapping("/{id}")
    public Post updatePost(@PathVariable Long id, @RequestBody Post post) {
        return postService.updatePost(id, post);
    }

    // 5) 게시글 삭제
    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Long id) {
        postService.deletePost(id);
    }
}
