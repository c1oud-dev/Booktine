package booktine.Booktine.domain.progress.service;

import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.progress.dto.BasicStatsResponse;
import booktine.Booktine.domain.progress.dto.GenreStatsResponse;
import booktine.Booktine.domain.progress.dto.MonthlyReadCountResponse;
import booktine.Booktine.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
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
        given(postRepository.findAllByUserIdAndReadingStatus(1L, ReadingStatus.COMPLETED)).willReturn(List.of(
                post("소설", LocalDate.of(2026, 1, 1)),
                post("소설", LocalDate.of(2026, 2, 1)),
                post("자기계발", LocalDate.of(2026, 3, 1))
        ));

        // when
        List<GenreStatsResponse> res = statisticsService.getGenreStats(1L);

        // then
        assertThat(res).hasSize(2);
        assertThat(res.get(0).genre()).isEqualTo("소설");
        assertThat(res.get(0).count()).isEqualTo(2);
    }

    @Test
    @DisplayName("연간 독서량 추이 조회 - 12개월 데이터 반환")
    void getAnnualTrend_returns12Months() {
        // given
        given(postRepository.findAllByUserIdAndReadingStatusAndCompletedDateBetween(
                eq(1L), eq(ReadingStatus.COMPLETED), any(), any())).willReturn(List.of(
                post("소설", LocalDate.of(2026, 1, 1)),
                post("소설", LocalDate.of(2026, 3, 1))
        ));

        // when
        List<MonthlyReadCountResponse> res = statisticsService.getAnnualTrend(1L, 2026);

        // then
        assertThat(res).hasSize(12);
        assertThat(res.get(0).count()).isEqualTo(1); // 1월
        assertThat(res.get(1).count()).isEqualTo(0); // 2월
        assertThat(res.get(2).count()).isEqualTo(1); // 3월
    }

    @Test
    @DisplayName("완독 기록이 없을 때 통계 조회 시 빈 결과 반환")
    void getGenreStats_empty() {
        // given
        given(postRepository.findAllByUserIdAndReadingStatus(1L, ReadingStatus.COMPLETED)).willReturn(List.of());

        // when
        List<GenreStatsResponse> res = statisticsService.getGenreStats(1L);

        // then
        assertThat(res).isEmpty();
    }

    private Post post(String genre, LocalDate completedDate) {
        return Post.builder()
                .title("t").author("a").genre(genre).publisher("p")
                .publishedDate(LocalDate.now()).summary("s")
                .readingStatus(ReadingStatus.COMPLETED).completedDate(completedDate)
                .user(user()).build();
    }

    private User user() {
        User user = User.builder().email("e").password("p").nickname("n").build();
        ReflectionTestUtils.setField(user, "id", 1L);
        return user;
    }
}