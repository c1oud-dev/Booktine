package booktine.Booktine.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GenreData {
    private String label;   // 장르명
    private double value;   // 장르별 비율(%)
}
