package booktine.Booktine.controller.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyData {
    private String month; // 예: "4월"
    private int count;    // 해당 월의 완독 수
}
