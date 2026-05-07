package booktine.Booktine.domain.progress.service;

import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.progress.dto.BasicStatsResponse;
import booktine.Booktine.domain.progress.dto.GenreStatsResponse;
import booktine.Booktine.domain.progress.dto.MonthlyReadCountResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class StatisticsServiceTest {

    @InjectMocks
    StatisticsService statisticsService;
    @Mock
    PostRepository postRepository;

    @Test
    @DisplayName("기본 통계 조회 성공")
    void getBasicStats_success() {
        // given
        given(postRepository.countByUserIdAndReadingStatus(eq(1L), eq(ReadingStatus.COMPLETED))).willReturn(5L);
        given(postRepository.countByUserIdAndReadingStatusAndCompletedDateBetween(
                eq(1L), eq(ReadingStatus.COMPLETED), any(), any())).willReturn(3L, 1L);

        // when
        BasicStatsResponse res = statisticsService.getBasicStats(1L);

        // then
        assertThat(res.totalFinished()).isEqualTo(5L);
        assertThat(res.currentYearFinished()).isEqualTo(3L);
        assertThat(res.currentMonthFinished()).isEqualTo(1L);
    }

    @Test
    @DisplayName("장르별 독서 비율 조회 성공")
    void getGenreStats_success() {
        // given
        given(postRepository.countCompletedGenres(1L, ReadingStatus.COMPLETED, null, null)).willReturn(List.of(
                new GenreStatsResponse("소설", 2, 0.0),
                new GenreStatsResponse("자기계발", 1, 0.0)
        ));

        // when
        List<GenreStatsResponse> res = statisticsService.getGenreStats(1L, null, null);

        // then
        assertThat(res).hasSize(2);
        assertThat(res.get(0).genre()).isEqualTo("소설");
        assertThat(res.get(0).count()).isEqualTo(2);
        assertThat(res.get(0).percentage()).isEqualTo(66.7);
    }

    @Test
    @DisplayName("연간 월별 완독 권수 조회 - 12개월 데이터 반환")
    void getAnnualCompletedCounts_returns12Months() {
        // given
        given(postRepository.countCompletedMonths(
                eq(1L), eq(ReadingStatus.COMPLETED), any(), any())).willReturn(List.of(
                new MonthlyReadCountResponse(4, 2)
        ));

        // when
        List<MonthlyReadCountResponse> res = statisticsService.getAnnualCompletedCounts(1L, 2026);

        // then
        assertThat(res).hasSize(12);
        assertThat(res.get(3).count()).isEqualTo(2); // 4월
    }

    @Test
    @DisplayName("완독 기록이 없을 때 통계 조회 시 빈 결과 반환")
    void getGenreStats_empty() {
        // given
        given(postRepository.countCompletedGenres(1L, ReadingStatus.COMPLETED, null, null)).willReturn(List.of());

        // when
        List<GenreStatsResponse> res = statisticsService.getGenreStats(1L, null, null);

        // then
        assertThat(res).isEmpty();
    }
}