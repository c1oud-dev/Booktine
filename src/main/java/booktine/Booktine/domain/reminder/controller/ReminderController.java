package booktine.Booktine.domain.reminder.controller;

import booktine.Booktine.domain.reminder.dto.ReminderCreateRequest;
import booktine.Booktine.domain.reminder.dto.ReminderResponse;
import booktine.Booktine.domain.reminder.service.ReminderService;
import booktine.Booktine.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

/**
 * 독서 리마인더 관련 HTTP API 엔드포인트를 제공하는 컨트롤러.
 * D8 인증 적용 전 단계에서 userId RequestParam 기반으로 리마인더 기능을 테스트한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/reminders")
public class ReminderController {

    private final ReminderService reminderService;

    /**
     * 사용자 리마인더를 생성한다.
     */
    @PostMapping
    public ApiResponse<ReminderResponse> createReminder(@RequestParam Long userId,
                                                        @Valid @RequestBody ReminderCreateRequest request) {
        return ApiResponse.ok(reminderService.createReminder(userId, request));
    }

    /**
     * 사용자 리마인더 목록을 조회한다.
     */
    @GetMapping
    public ApiResponse<List<ReminderResponse>> getReminders(@RequestParam Long userId) {
        return ApiResponse.ok(reminderService.getReminders(userId));
    }

    /**
     * 사용자 SSE 연결을 생성한다.
     */
    @GetMapping("/connect")
    public SseEmitter connect(@RequestParam Long userId) {
        return reminderService.connect(userId);
    }

    /**
     * 사용자 소유 리마인더를 삭제한다.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteReminder(@RequestParam Long userId, @PathVariable Long id) {
        reminderService.deleteReminder(userId, id);
        return ApiResponse.ok();
    }
}