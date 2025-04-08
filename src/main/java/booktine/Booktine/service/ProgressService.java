package booktine.Booktine.service;

import booktine.Booktine.controller.dto.GenreData;
import booktine.Booktine.controller.dto.MonthlyData;
import booktine.Booktine.controller.dto.ProgressResponse;
import booktine.Booktine.model.Post;
import booktine.Booktine.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgressService {
    private final PostRepository postRepository;
    // 현재 날짜
    LocalDate now = LocalDate.now();

    public ProgressService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public ProgressResponse getProgressData(int targetYear) {
        // 1) 모든 게시물 중 '완독' 상태인 것만 필터링
        List<Post> finishedPosts = postRepository.findAll().stream()
                .filter(p -> "완독".equals(p.getReadingStatus()))
                .collect(Collectors.toList());

        // 2) 연간 달성 수, 이번달 달성 수 계산
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();



        // 연간 달성 수 (targetYear 기준)
        // 만약 targetYear가 현재 연도라면, endDate가 오늘 이후인 경우는 제외한다.
        long yearlyAchieved = finishedPosts.stream()
            .filter(p -> {
                if (p.getEndDate() == null) return false;
                LocalDate end = p.getEndDate();
                // targetYear가 과거인 경우는 조건 없이 연도 일치만 확인
                // 현재 연도인 경우에는 endDate가 오늘 이하인 경우만 포함
                return end.getYear() == targetYear && (targetYear < now.getYear() || !end.isAfter(now));
            })
            .count();

        // 이번달 달성 수 (targetYear가 현재 연도인 경우에만 계산)
        long monthlyAchieved = 0;
        if (targetYear == now.getYear()) {
            monthlyAchieved = finishedPosts.stream()
                    .filter(p -> {
                        if (p.getEndDate() == null) return false;
                        LocalDate end = p.getEndDate();
                        return end.getYear() == targetYear
                                && end.getMonthValue() == now.getMonthValue()
                                && !end.isAfter(now);
                    })
                    .count();
        }

        // 연간 독서량 (1~12월) - targetYear 기준
        List<MonthlyData> yearlyData = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            final int month = m;
            long count = finishedPosts.stream()
                    .filter(p -> {
                        if (p.getEndDate() == null) return false;
                        LocalDate end = p.getEndDate();
                        // targetYear가 현재 연도라면 오늘 이후인 날짜 제외
                        return end.getYear() == targetYear
                                && end.getMonthValue() == month
                                && (targetYear < now.getYear() || !end.isAfter(now));
                    })
                    .count();
            yearlyData.add(new MonthlyData(m + "월", (int) count));
        }

        // 4) 최근 6개월 독서량 - targetYear가 현재 연도인 경우에만 계산
        List<MonthlyData> recent6Months = new ArrayList<>();
        if (targetYear == now.getYear()) {
            LocalDate today = now;
            for (int i = 0; i < 6; i++) {
                LocalDate targetDate = today.minusMonths(i);
                int y = targetDate.getYear();
                int m = targetDate.getMonthValue();
                long count = finishedPosts.stream()
                        .filter(p -> {
                            if (p.getEndDate() == null) return false;
                            LocalDate end = p.getEndDate();
                            return end.getYear() == y
                                    && end.getMonthValue() == m
                                    && !end.isAfter(now);
                        })
                        .count();
                recent6Months.add(new MonthlyData(m + "월", (int) count));
            }
            Collections.reverse(recent6Months);
        }

        // 5) 장르별 독서 비율 - targetYear 기준
        //    전체 finishedPosts에서 장르별 개수 -> % 계산
        // 5) 장르별 독서 비율 - targetYear 기준
        Map<String, Long> genreCount = new HashMap<>();
        for (Post p : finishedPosts) {
            if (p.getGenre() == null || p.getEndDate() == null) continue;
            LocalDate end = p.getEndDate();
            // targetYear가 현재 연도라면 미래 날짜는 배제하고, 그렇지 않으면 연도 일치만 확인
            if (end.getYear() != targetYear || (targetYear == now.getYear() && end.isAfter(now))) continue;
            genreCount.put(p.getGenre(), genreCount.getOrDefault(p.getGenre(), 0L) + 1);
        }
        long totalFinished = finishedPosts.stream()
                .filter(p -> {
                    if (p.getEndDate() == null) return false;
                    LocalDate end = p.getEndDate();
                    return end.getYear() == targetYear && (targetYear < now.getYear() || !end.isAfter(now));
                })
                .count();
        List<GenreData> genreDataList = new ArrayList<>();
        for (Map.Entry<String, Long> entry : genreCount.entrySet()) {
            double percentage = (totalFinished > 0)
                    ? (entry.getValue() * 100.0 / totalFinished)
                    : 0.0;
            genreDataList.add(new GenreData(entry.getKey(), percentage));
        }

        // 6) ProgressResponse에 담아서 리턴
        return ProgressResponse.builder()
                .yearlyAchieved(yearlyAchieved)
                .monthlyAchieved(monthlyAchieved)
                .yearlyData(yearlyData)         // 1~12월 독서량
                .recent6Months(recent6Months)   // 최근 6개월 독서량
                .genreData(genreDataList)       // 장르별 비율
                .build();
    }
}
