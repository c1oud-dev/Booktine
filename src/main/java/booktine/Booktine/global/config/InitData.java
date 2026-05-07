package booktine.Booktine.global.config;

import booktine.Booktine.domain.community.entity.CommunityComment;
import booktine.Booktine.domain.community.entity.CommunityLike;
import booktine.Booktine.domain.community.entity.CommunityPost;
import booktine.Booktine.domain.community.repository.CommunityCommentRepository;
import booktine.Booktine.domain.community.repository.CommunityLikeRepository;
import booktine.Booktine.domain.community.repository.CommunityPostRepository;
import booktine.Booktine.domain.genre.entity.Genre;
import booktine.Booktine.domain.genre.repository.GenreRepository;
import booktine.Booktine.domain.inquiry.entity.Inquiry;
import booktine.Booktine.domain.inquiry.repository.InquiryRepository;
import booktine.Booktine.domain.memo.entity.Memo;
import booktine.Booktine.domain.memo.repository.MemoRepository;
import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.progress.entity.AnnualGoal;
import booktine.Booktine.domain.progress.entity.MonthlyGoal;
import booktine.Booktine.domain.progress.repository.AnnualGoalRepository;
import booktine.Booktine.domain.progress.repository.MonthlyGoalRepository;
import booktine.Booktine.domain.recommendation.entity.Recommendation;
import booktine.Booktine.domain.recommendation.repository.RecommendationRepository;
import booktine.Booktine.domain.reminder.entity.Reminder;
import booktine.Booktine.domain.reminder.repository.ReminderRepository;
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
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class InitData {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final MemoRepository memoRepository;
    private final CommunityPostRepository communityPostRepository;
    private final CommunityCommentRepository communityCommentRepository;
    private final CommunityLikeRepository communityLikeRepository;
    private final AnnualGoalRepository annualGoalRepository;
    private final MonthlyGoalRepository monthlyGoalRepository;
    private final RecommendationRepository recommendationRepository;
    private final ReminderRepository reminderRepository;
    private final GenreRepository genreRepository;
    private final InquiryRepository inquiryRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    @EventListener(ApplicationReadyEvent.class)
    public void run() {
        if (userRepository.existsByEmailAndAuthProvider("dev@booktine.com", UserAuthProvider.LOCAL)) {
            log.info("[InitData] 개발용 데이터가 이미 존재하여 삽입을 건너뜁니다.");
            return;
        }

        User user = createDevUser();
        createAdminUser();

        LocalDate today = LocalDate.now();
        createGenres();
        List<Post> posts = createPosts(user, today);
        createMemos(posts);
        createProgressGoals(user, today);
        createRecommendations(user);
        createReminders(user);

        User admin = userRepository.findByEmailAndAuthProvider("admin@booktine.com", UserAuthProvider.LOCAL).orElseThrow();
        createInquiries(user, admin);
        createCommunityData(user, admin);

        log.info("[InitData] 개발용 초기 데이터 삽입 완료. userId={}, postCount={}, memoCount=12",
                user.getId(), posts.size());
    }

    private User createDevUser() {
        return userRepository.save(User.builder()
                .email("dev@booktine.com")
                .password(passwordEncoder.encode("dev1234!"))
                .nickname("booktine-dev")
                .emailVerified(true)
                .authProvider(UserAuthProvider.LOCAL)
                .providerId("local-dev-user")
                .aboutMe("로컬 개발용 기본 사용자")
                .build());
    }

    private void createAdminUser() {
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
    }

    private void createGenres() {
        List.of("철학", "심리", "SF", "환경").forEach(name -> genreRepository.save(new Genre(name)));
    }

    private List<Post> createPosts(User user, LocalDate today) {
        return List.of(
                savePost(user, "클린 코드", "로버트 C. 마틴", "IT", "인사이트", today.minusYears(12),
                        "가독성과 유지보수성을 높이는 코드 작성 원칙", ReadingStatus.READING, today.minusWeeks(2), null, null, null, 148, 584),
                savePost(user, "이펙티브 자바", "조슈아 블로크", "IT", "인사이트", today.minusYears(6),
                        "자바 개발자가 알아야 할 실전 설계와 구현 원칙", ReadingStatus.COMPLETED, today.minusMonths(2).withDayOfMonth(3), today.minusMonths(1).withDayOfMonth(5), 5.0, "자바 API 설계 감각을 끌어올려 준 책", 416, 416),
                savePost(user, "데미안", "헤르만 헤세", "소설", "민음사", today.minusYears(25),
                        "자아를 찾아가는 성장의 여정을 다룬 작품", ReadingStatus.WISHLIST, null, null, null, null, null, 240),
                savePost(user, "아토믹 해빗", "제임스 클리어", "자기계발", "비즈니스북스", today.minusYears(7),
                        "작은 습관이 모여 큰 변화를 만든다는 메시지", ReadingStatus.COMPLETED, today.minusMonths(4).withDayOfMonth(1), today.minusMonths(3).withDayOfMonth(12), 4.5, "작은 실천을 바로 시작하게 만드는 힘이 있다", 360, 360),
                savePost(user, "돈의 심리학", "모건 하우절", "경제", "인플루엔셜", today.minusYears(4),
                        "돈을 대하는 태도와 의사결정을 설명하는 경제 에세이", ReadingStatus.COMPLETED, today.minusMonths(6).withDayOfMonth(7), today.minusMonths(5).withDayOfMonth(18), 4.0, "투자보다 태도를 돌아보게 한 경제 에세이", 304, 304),
                savePost(user, "사피엔스", "유발 하라리", "역사", "김영사", today.minusYears(8),
                        "인류의 과거와 현재를 거시적으로 조망하는 역사서", ReadingStatus.COMPLETED, today.minusMonths(9).withDayOfMonth(2), today.minusMonths(8).withDayOfMonth(9), 4.5, "큰 흐름으로 인류사를 다시 보게 한다", 636, 636),
                savePost(user, "코스모스", "칼 세이건", "과학", "사이언스북스", today.minusYears(18),
                        "우주와 생명의 경이로움을 풀어낸 과학 고전", ReadingStatus.PAUSED, today.minusMonths(1).withDayOfMonth(10), null, null, null, 220, 719),
                savePost(user, "불편한 편의점", "김호연", "소설", "나무옆의자", today.minusYears(5),
                        "편의점을 배경으로 이어지는 따뜻한 사람들의 이야기", ReadingStatus.COMPLETED, today.minusYears(1).withDayOfMonth(3), today.minusMonths(11).withDayOfMonth(22), 3.5, "가볍게 읽히지만 오래 따뜻함이 남는다", 268, 268),
                savePost(user, "타이탄의 도구들", "팀 페리스", "자기계발", "토네이도", today.minusYears(9),
                        "성과를 만드는 루틴과 사고방식을 모은 인터뷰집", ReadingStatus.READING, today.minusDays(10), null, null, null, 92, 368),
                savePost(user, "넛지", "리처드 탈러", "경제", "리더스북", today.minusYears(15),
                        "선택 설계를 통해 행동 변화를 이끄는 행동경제학 입문서", ReadingStatus.WISHLIST, null, null, null, null, null, 428)
        );
    }

    private Post savePost(User user, String title, String author, String genre, String publisher,
                          LocalDate publishedDate, String summary, ReadingStatus readingStatus,
                          LocalDate startDate, LocalDate completedDate, Double rating, String shortReview,
                          Integer currentPage, Integer totalPage) {
        return postRepository.save(Post.builder()
                .user(user)
                .title(title)
                .author(author)
                .genre(genre)
                .publisher(publisher)
                .publishedDate(publishedDate)
                .summary(summary)
                .readingStatus(readingStatus)
                .startDate(startDate)
                .completedDate(completedDate)
                .rating(rating)
                .shortReview(shortReview)
                .currentPage(currentPage)
                .totalPage(totalPage)
                .build());
    }

    private void createMemos(List<Post> posts) {
        saveMemo(posts.get(0), "의미 있는 이름은 주석보다 오래 간다.", 22);
        saveMemo(posts.get(0), "함수는 한 가지 일만 하도록 작게 유지하자.", 44);
        saveMemo(posts.get(1), "정적 팩터리 메서드는 생성자보다 의도를 잘 드러낼 수 있다.", 18);
        saveMemo(posts.get(1), "불변 객체는 동시성 버그를 줄이는 데 도움이 된다.", 96);
        saveMemo(posts.get(1), "제네릭 경고를 무시하지 말고 타입 안정성을 확인하자.", 154);
        saveMemo(posts.get(3), "습관은 신호, 열망, 반응, 보상의 순환으로 강화된다.", 51);
        saveMemo(posts.get(3), "목표보다 시스템을 설계하는 데 집중하자.", 128);
        saveMemo(posts.get(4), "부의 성과는 지능보다 행동과 시간의 영향을 크게 받는다.", 37);
        saveMemo(posts.get(5), "인지 혁명 이후 인간은 허구를 공유하며 협력 범위를 넓혔다.", 82);
        saveMemo(posts.get(6), "과학은 겸손한 질문에서 시작한다.", 210);
        saveMemo(posts.get(7), "평범한 공간이 누군가에게는 회복의 장소가 된다.", 74);
        saveMemo(posts.get(8), "반복 가능한 루틴은 의지력 의존도를 낮춘다.", 63);
    }

    private void saveMemo(Post post, String content, Integer page) {
        memoRepository.save(Memo.builder()
                .post(post)
                .content(content)
                .page(page)
                .build());
    }

    private void createInquiries(User user, User admin) {
        inquiryRepository.save(Inquiry.builder()
                .user(user)
                .subject("독서 통계에 평균 별점도 보고 싶어요")
                .message("완독한 책 기준으로 평균 별점과 높은 별점 책 목록을 확인할 수 있으면 좋겠습니다.")
                .build());
        inquiryRepository.save(Inquiry.builder()
                .user(admin)
                .subject("관리자 샘플 문의")
                .message("관리자 페이지 문의 목록 확인을 위한 개발용 샘플 데이터입니다.")
                .build());
    }

    private void createCommunityData(User user, User admin) {
        // 게시글 3개
        CommunityPost post1 = communityPostRepository.save(CommunityPost.builder()
                .user(user)
                .title("클린 코드 읽고 나서 코드 스타일이 바뀌었어요")
                .content("처음엔 어렵게 느껴졌는데 읽고 나니 변수명 하나도 신경 쓰게 되더라고요. 다들 읽으면서 어떤 부분이 가장 인상 깊으셨나요?")
                .build());

        CommunityPost post2 = communityPostRepository.save(CommunityPost.builder()
                .user(admin)
                .title("올해 독서 목표 달성하신 분 계신가요?")
                .content("저는 올해 목표가 24권인데 벌써 절반 넘었어요. 여러분은 어떻게 독서 루틴 잡으셨는지 궁금합니다!")
                .build());

        CommunityPost post3 = communityPostRepository.save(CommunityPost.builder()
                .user(user)
                .title("아토믹 해빗 실천 후기")
                .content("습관 추적을 시작한 지 3개월이 됐어요. 작은 것부터 하나씩 쌓아가는 게 생각보다 효과가 있더라고요.")
                .build());

        // 댓글 + 대댓글
        CommunityComment comment1 = communityCommentRepository.save(CommunityComment.builder()
                .post(post1)
                .user(admin)
                .content("저는 함수는 한 가지 일만 해야 한다는 원칙이 가장 와닿았어요.")
                .parent(null)
                .build());

        communityCommentRepository.save(CommunityComment.builder()
                .post(post1)
                .user(user)
                .content("맞아요! 그 원칙 적용하고 나서 리뷰할 때 훨씬 편해졌어요.")
                .parent(comment1)
                .build());

        CommunityComment comment2 = communityCommentRepository.save(CommunityComment.builder()
                .post(post2)
                .user(user)
                .content("저는 아침 30분 독서 루틴으로 목표 채우고 있어요!")
                .parent(null)
                .build());

        communityCommentRepository.save(CommunityComment.builder()
                .post(post2)
                .user(admin)
                .content("아침 루틴 좋죠. 저도 시도해봐야겠네요.")
                .parent(comment2)
                .build());

        communityCommentRepository.save(CommunityComment.builder()
                .post(post3)
                .user(admin)
                .content("3개월이나 유지하셨다니 대단해요. 어떤 습관부터 시작하셨어요?")
                .parent(null)
                .build());

        // 좋아요
        addLike(post1, admin);
        addLike(post2, user);
        addLike(post3, admin);
    }

    private void addLike(CommunityPost post, User user) {
        communityLikeRepository.save(CommunityLike.builder()
                .post(post)
                .user(user)
                .build());
        post.increaseLikeCount();
        communityPostRepository.save(post);
    }

    private void createProgressGoals(User user, LocalDate today) {
        annualGoalRepository.save(AnnualGoal.builder()
                .user(user)
                .year(today.getYear())
                .goalCount(24)
                .build());

        for (int i = 0; i < 4; i++) {
            LocalDate targetMonth = today.minusMonths(i);
            monthlyGoalRepository.save(MonthlyGoal.builder()
                    .user(user)
                    .year(targetMonth.getYear())
                    .month(targetMonth.getMonthValue())
                    .goalCount(2 + i)
                    .build());
        }
    }

    private void createRecommendations(User user) {
        saveRecommendation(user, "실용주의 프로그래머", "데이비드 토머스, 앤드류 헌트", "인사이트", "IT",
                "개발자의 실용적 태도와 문제 해결 방식을 다루는 고전", "9791158390747");
        saveRecommendation(user, "프로젝트 헤일메리", "앤디 위어", "알에이치코리아", "소설",
                "과학적 상상력과 모험이 결합된 SF 소설", "9788925588736");
        saveRecommendation(user, "원씽", "게리 켈러", "비즈니스북스", "자기계발",
                "가장 중요한 한 가지에 집중하는 법을 설명하는 책", "9791155424320");
    }

    private void saveRecommendation(User user, String title, String author, String publisher, String genre,
                                    String description, String isbn) {
        recommendationRepository.save(Recommendation.builder()
                .user(user)
                .title(title)
                .author(author)
                .publisher(publisher)
                .coverImageUrl("https://example.com/covers/" + isbn + ".jpg")
                .genre(genre)
                .description(description)
                .isbn(isbn)
                .build());
    }

    private void createReminders(User user) {
        reminderRepository.save(Reminder.builder()
                .userId(user.getId())
                .reminderTime(LocalTime.of(8, 30))
                .message("아침 독서 20분으로 하루를 시작해요.")
                .build());
        reminderRepository.save(Reminder.builder()
                .userId(user.getId())
                .reminderTime(LocalTime.of(21, 0))
                .message("자기 전 오늘 읽은 내용을 메모해 보세요.")
                .build());
    }
}

