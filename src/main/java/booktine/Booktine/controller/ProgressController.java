package booktine.Booktine.controller;

import booktine.Booktine.controller.dto.ProgressResponse;
import booktine.Booktine.service.ProgressService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    // Progress 페이지에 필요한 통계 데이터를 모두 내려주는 예시
    @GetMapping
    public ProgressResponse getProgressData(@RequestParam(value = "year", required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return progressService.getProgressData(targetYear);
    }

}
