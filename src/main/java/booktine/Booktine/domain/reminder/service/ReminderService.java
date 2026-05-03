package booktine.Booktine.domain.reminder.service;

import booktine.Booktine.domain.reminder.dto.ReminderCreateRequest;
import booktine.Booktine.domain.reminder.dto.ReminderResponse;
import booktine.Booktine.domain.reminder.entity.Reminder;
import booktine.Booktine.domain.reminder.repository.ReminderRepository;
import booktine.Booktine.domain.reminder.sse.SseEmitterManager;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalTime;
import java.util.List;

/**
 * 리마인더 도메인 비즈니스 로직을 처리하는 서비스.
 * 리마인더 CRUD, SSE 연결 관리, 스케줄 기반 알림 전송을 담당한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReminderService {

    private static final String CONNECTED_MESSAGE = "리마인더 SSE 연결이 완료되었습니다.";

    private final ReminderRepository reminderRepository;
    private final SseEmitterManager sseEmitterManager;

    /**
     * 사용자 요청으로 새 리마인더를 저장한다.
     * 요청 시각을 분 단위로 정규화해 스케줄 알림 조회 조건을 일관되게 유지한다.
     */
    @Transactional
    public ReminderResponse createReminder(Long userId, ReminderCreateRequest request) {
        Reminder reminder = Reminder.builder()
                .userId(userId)
                .reminderTime(normalizeToMinute(request.reminderTime()))
                .message(request.message())
                .build();
        return ReminderResponse.from(reminderRepository.save(reminder));
    }

    /**
     * 특정 사용자의 리마인더 목록을 조회한다.
     * 엔티티를 응답 DTO로 변환해 외부 스펙을 고정한다.
     */
    public List<ReminderResponse> getReminders(Long userId) {
        return reminderRepository.findAllByUserId(userId)
                .stream()
                .map(ReminderResponse::from)
                .toList();
    }

    /**
     * 사용자 SSE 연결을 생성하고 초기 연결 이벤트를 전송한다.
     */
    public SseEmitter connect(Long userId) {
        SseEmitter emitter = sseEmitterManager.connect(userId);
        sseEmitterManager.send(userId, CONNECTED_MESSAGE);
        return emitter;
    }

    /**
     * 사용자 소유 리마인더를 삭제한다.
     * 사용자 소유권 검증을 통과한 경우에만 삭제를 수행한다.
     */
    @Transactional
    public void deleteReminder(Long userId, Long reminderId) {
        Reminder reminder = findUserReminder(userId, reminderId);
        reminderRepository.delete(reminder);
    }

    /**
     * 매 분 현재 시각과 일치하는 리마인더를 조회해 SSE 이벤트를 전송한다.
     */
    @Scheduled(cron = "0 * * * * *")
    public void sendReminderNotifications() {
        LocalTime currentTime = normalizeToMinute(LocalTime.now());
        List<Reminder> reminders = reminderRepository.findAllByReminderTime(currentTime);
        reminders.forEach(this::sendReminderNotification);
    }

    /**
     * 사용자와 리마인더 ID로 리마인더를 조회한다.
     * 조회 실패 시 리마인더 없음 예외를 발생시킨다.
     */
    private Reminder findUserReminder(Long userId, Long reminderId) {
        return reminderRepository.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.REMINDER_NOT_FOUND));
    }

    /**
     * 리마인더 알림 전송 시각을 분 단위로 정규화한다.
     */
    private LocalTime normalizeToMinute(LocalTime time) {
        return time.withSecond(0).withNano(0);
    }

    /**
     * 단일 리마인더를 사용자별 SSE 채널로 전송한다.
     */
    private void sendReminderNotification(Reminder reminder) {
        sseEmitterManager.send(reminder.getUserId(), ReminderResponse.from(reminder));
    }
}
