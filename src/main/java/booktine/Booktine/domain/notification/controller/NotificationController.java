package booktine.Booktine.domain.notification.controller;

import booktine.Booktine.domain.notification.dto.NotificationResponse;
import booktine.Booktine.domain.notification.service.NotificationService;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

/**
 * 알림 관련 API를 제공하는 컨트롤러.
 * 알림 목록 조회, 읽음 처리, SSE 연결 등을 담당한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/notifications")
@Tag(name = "알림", description = "알림 관련 API")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 현재 로그인한 사용자의 알림 목록을 조회한다.
     */
    @Operation(summary = "알림 목록 조회", description = "현재 로그인한 사용자의 알림 목록을 조회합니다.")
    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications() {
        return ApiResponse.ok(notificationService.getNotifications(SecurityUtils.getCurrentUserId()));
    }

    /**
     * SSE 연결을 생성해 실시간 알림을 수신한다.
     */
    @Operation(summary = "SSE 연결", description = "실시간 알림 수신을 위한 SSE 연결을 생성합니다.")
    @GetMapping(value = "/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> connect() {
        SseEmitter emitter = notificationService.connect(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .header("X-Accel-Buffering", "no")
                .header(HttpHeaders.CONNECTION, "keep-alive")
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(emitter);
    }

    /**
     * 읽지 않은 알림 수를 조회한다.
     */
    @Operation(summary = "읽지 않은 알림 수 조회", description = "읽지 않은 알림 수를 조회합니다.")
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        return ApiResponse.ok(notificationService.getUnreadCount(SecurityUtils.getCurrentUserId()));
    }

    /**
     * 특정 알림을 읽음 처리한다.
     */
    @Operation(summary = "알림 읽음 처리", description = "특정 알림을 읽음 처리합니다.")
    @PatchMapping("/{id}/read")
    public ApiResponse<Void> read(@PathVariable Long id) {
        notificationService.read(SecurityUtils.getCurrentUserId(), id);
        return ApiResponse.ok();
    }

    /**
     * 모든 알림을 읽음 처리한다.
     */
    @Operation(summary = "전체 알림 읽음 처리", description = "모든 알림을 읽음 처리합니다.")
    @PatchMapping("/read-all")
    public ApiResponse<Void> readAll() {
        notificationService.readAll(SecurityUtils.getCurrentUserId());
        return ApiResponse.ok();
    }
}
