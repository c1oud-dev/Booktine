package booktine.Booktine.domain.progress.service;

import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.progress.dto.BasicStatsResponse;
import booktine.Booktine.domain.progress.dto.GenreStatsResponse;
import booktine.Booktine.domain.progress.dto.MonthlyReadCountResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
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
        LocalDate yearStart = getYearStart(now.getYear());
        LocalDate yearEnd = getYearEnd(now.getYear());
        LocalDate monthStart = getMonthStart(now);
        LocalDate monthEnd = getMonthEnd(monthStart);

        long totalFinished = postRepository.countByUserIdAndReadingStatus(userId, ReadingStatus.COMPLETED);
        long currentYearFinished = postRepository.countByUserIdAndReadingStatusAndCompletedDateBetween(
                userId, ReadingStatus.COMPLETED, yearStart, yearEnd);
        long currentMonthFinished = postRepository.countByUserIdAndReadingStatusAndCompletedDateBetween(
                userId, ReadingStatus.COMPLETED, monthStart, monthEnd);

        return new BasicStatsResponse(totalFinished, currentYearFinished, currentMonthFinished);
    }

    /** 완독 게시물을 장르별로 집계하여 비율 통계를 반환한다. */
    public List<GenreStatsResponse> getGenreStats(Long userId, Integer year, Integer month) {
        LocalDate from = null;
        LocalDate to = null;

        if (year != null) {
            from = month == null ? getYearStart(year) : LocalDate.of(year, month, 1);
            to = month == null ? getYearEnd(year) : getMonthEnd(from);
        }

        List<GenreStatsResponse> genreCounts = postRepository.countCompletedGenres(userId, ReadingStatus.COMPLETED, from, to);
        long total = genreCounts.stream()
                .mapToLong(GenreStatsResponse::count)
                .sum();

        return genreCounts.stream()
                .map(genre -> new GenreStatsResponse(
                        genre.genre(),
                        genre.count(),
                        total == 0 ? 0.0 : Math.round((double) genre.count() / total * 1000) / 10.0
                ))
                .toList();
    }

    /** 특정 연도의 1~12월 완독 건수를 집계한 월별 추이를 반환한다. */
    public List<MonthlyReadCountResponse> getAnnualTrend(Long userId, Integer year) {
        return getAnnualCompletedCounts(userId, year);
    }

    /** 특정 연도의 1~12월 완독 권수를 집계해 반환한다. */
    public List<MonthlyReadCountResponse> getAnnualCompletedCounts(Long userId, Integer year) {
        LocalDate yearStart = getYearStart(year);
        LocalDate yearEnd = getYearEnd(year);
        List<MonthlyReadCountResponse> completedCounts = postRepository.countCompletedMonths(
                userId, ReadingStatus.COMPLETED, yearStart, yearEnd);

        return IntStream.rangeClosed(1, 12)
                .mapToObj(month -> new MonthlyReadCountResponse(month, getCountForMonth(completedCounts, month)))
                .toList();
    }

    /** 집계 결과에서 특정 월의 완독 권수를 반환한다. */
    private long getCountForMonth(List<MonthlyReadCountResponse> completedCounts, int month) {
        return completedCounts.stream()
                .filter(count -> count.month() == month)
                .mapToLong(MonthlyReadCountResponse::count)
                .findFirst()
                .orElse(0L);
    }

    /** 전달받은 연도의 시작일(1월 1일)을 반환한다. */
    private LocalDate getYearStart(int year) {
        return LocalDate.of(year, 1, 1);
    }

    /** 전달받은 연도의 종료일(12월 31일)을 반환한다. */
    private LocalDate getYearEnd(int year) {
        return LocalDate.of(year, 12, 31);
    }

    /** 전달받은 날짜 기준 월의 시작일을 반환한다. */
    private LocalDate getMonthStart(LocalDate date) {
        return LocalDate.of(date.getYear(), date.getMonthValue(), 1);
    }

    /** 전달받은 월 시작일 기준 월의 종료일을 반환한다. */
    private LocalDate getMonthEnd(LocalDate monthStart) {
        return monthStart.withDayOfMonth(monthStart.lengthOfMonth());
    }
}