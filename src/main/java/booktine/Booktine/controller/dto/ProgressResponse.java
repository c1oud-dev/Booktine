package booktine.Booktine.controller.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProgressResponse {
    private long yearlyAchieved;         // 올해 달성 수
    private long monthlyAchieved;        // 이번달 달성 수

    private List<MonthlyData> yearlyData;    // 1~12월 독서량
    private List<MonthlyData> recent6Months; // 최근 6개월 독서량
    private List<GenreData> genreData;       // 장르별 비율
}
