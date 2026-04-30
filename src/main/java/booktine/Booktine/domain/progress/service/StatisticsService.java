package booktine.Booktine.domain.progress.service;

import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.progress.dto.BasicStatsResponse;
import booktine.Booktine.domain.progress.dto.GenreStatsResponse;
import booktine.Booktine.domain.progress.dto.MonthlyReadCountResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * 독서 진행 통계를 계산하는 서비스.
 * 기본 통계, 장르별 비율, 연간 월별 추이를 Post 데이터로 집계한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {

    private final PostRepository postRepository;

    /** 전체/올해/이번달 완독 수를 집계한 기본 통계를 반환한다. */
    public BasicStatsResponse getBasicStats(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate yearStart = LocalDate.of(now.getYear(), 1, 1);
        LocalDate yearEnd = LocalDate.of(now.getYear(), 12, 31);
        LocalDate monthStart = LocalDate.of(now.getYear(), now.getMonthValue(), 1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

        long totalFinished = postRepository.countByUserIdAndReadingStatus(userId, ReadingStatus.COMPLETED);
        long currentYearFinished = postRepository.countByUserIdAndReadingStatusAndCompletedDateBetween(
                userId, ReadingStatus.COMPLETED, yearStart, yearEnd);
        long currentMonthFinished = postRepository.countByUserIdAndReadingStatusAndCompletedDateBetween(
                userId, ReadingStatus.COMPLETED, monthStart, monthEnd);

        return new BasicStatsResponse(totalFinished, currentYearFinished, currentMonthFinished);
    }

    /** 완독 게시물을 장르별로 집계하여 비율 통계를 반환한다. */
    public List<GenreStatsResponse> getGenreStats(Long userId) {
        List<Post> posts = postRepository.findAllByUserIdAndReadingStatus(userId, ReadingStatus.COMPLETED);
        long total = posts.size();

        return posts.stream()
                .collect(Collectors.groupingBy(Post::getGenre, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .map(e -> new GenreStatsResponse(
                        e.getKey(),
                        e.getValue(),
                        total == 0 ? 0.0 : Math.round((double) e.getValue() / total * 1000) / 10.0
                ))
                .toList();
    }

    /** 특정 연도의 1~12월 완독 건수를 집계한 월별 추이를 반환한다. */
    public List<MonthlyReadCountResponse> getAnnualTrend(Long userId, Integer year) {
        LocalDate yearStart = LocalDate.of(year, 1, 1);
        LocalDate yearEnd = LocalDate.of(year, 12, 31);
        List<Post> posts = postRepository.findAllByUserIdAndReadingStatusAndCompletedDateBetween(
                userId, ReadingStatus.COMPLETED, yearStart, yearEnd);

        Map<Integer, Long> countByMonth = posts.stream()
                .collect(Collectors.groupingBy(p -> p.getCompletedDate().getMonthValue(), Collectors.counting()));

        return IntStream.rangeClosed(1, 12)
                .mapToObj(month -> new MonthlyReadCountResponse(month, countByMonth.getOrDefault(month, 0L)))
                .toList();
    }
}