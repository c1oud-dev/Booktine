package booktine.Booktine.global.config;

import booktine.Booktine.domain.memo.entity.Memo;
import booktine.Booktine.domain.memo.repository.MemoRepository;
import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.progress.entity.MonthlyGoal;
import booktine.Booktine.domain.progress.repository.MonthlyGoalRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserAuthProvider;
import booktine.Booktine.domain.user.entity.UserRole;
import booktine.Booktine.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class InitData {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final MemoRepository memoRepository;
    private final MonthlyGoalRepository monthlyGoalRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    @EventListener(ApplicationReadyEvent.class)
    public void run() {
        if (userRepository.existsByEmailAndAuthProvider("dev@booktine.com", UserAuthProvider.LOCAL)) {
            log.info("[InitData] 개발용 데이터가 이미 존재하여 삽입을 건너뜁니다.");
            return;
        }

        User user = userRepository.save(User.builder()
                .email("dev@booktine.com")
                .password(passwordEncoder.encode("dev1234!"))
                .nickname("booktine-dev")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId("local-dev-user")
                .aboutMe("로컬 개발용 기본 사용자")
                .build());

        User admin = userRepository.save(User.builder()
                .email("admin@booktine.com")
                .password(passwordEncoder.encode("admin1234!"))
                .nickname("booktine-admin")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId("local-admin-user")
                .aboutMe("로컬 개발용 관리자")
                .build());
        admin.updateRole(UserRole.ROLE_ADMIN);

        Post readingPost = postRepository.save(Post.builder()
                .user(user)
                .title("클린 코드")
                .author("로버트 C. 마틴")
                .genre("IT")
                .publisher("인사이트")
                .publishedDate(LocalDate.of(2013, 12, 24))
                .summary("가독성과 유지보수성을 높이는 코드 작성 원칙")
                .readingStatus(ReadingStatus.READING)
                .build());

        Post completedPost = postRepository.save(Post.builder()
                .user(user)
                .title("아토믹 해빗")
                .author("제임스 클리어")
                .genre("자기계발")
                .publisher("비즈니스북스")
                .publishedDate(LocalDate.of(2019, 7, 24))
                .summary("작은 습관이 모여 큰 변화를 만든다는 메시지")
                .readingStatus(ReadingStatus.COMPLETED)
                .completedDate(LocalDate.now().minusDays(3))
                .build());

        Post unreadPost = postRepository.save(Post.builder()
                .user(user)
                .title("데미안")
                .author("헤르만 헤세")
                .genre("소설")
                .publisher("민음사")
                .publishedDate(LocalDate.of(2000, 12, 20))
                .summary("자아를 찾아가는 성장의 여정을 다룬 작품")
                .readingStatus(ReadingStatus.WISHLIST)
                .build());

        memoRepository.save(Memo.builder()
                .post(completedPost)
                .content("반복 가능한 작은 행동부터 시작하자.")
                .page(42)
                .build());

        memoRepository.save(Memo.builder()
                .post(completedPost)
                .content("환경 설계가 습관 유지에 큰 영향을 준다.")
                .page(128)
                .build());

        LocalDate now = LocalDate.now();
        monthlyGoalRepository.save(MonthlyGoal.builder()
                .user(user)
                .year(now.getYear())
                .month(now.getMonthValue())
                .goalCount(3)
                .build());

        log.info("[InitData] 개발용 초기 데이터 삽입 완료. userId={}, postIds=[{},{},{}]",
                user.getId(), readingPost.getId(), completedPost.getId(), unreadPost.getId());
    }
}

