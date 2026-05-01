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

    private final ReminderRepository reminderRepository;
    private final SseEmitterManager sseEmitterManager;

    /**
     * 사용자 요청으로 새 리마인더를 저장한다.
     */
    @Transactional
    public ReminderResponse createReminder(Long userId, ReminderCreateRequest request) {
        Reminder reminder = Reminder.builder()
                .userId(userId)
                .reminderTime(request.reminderTime().withSecond(0).withNano(0))
                .message(request.message())
                .build();
        return ReminderResponse.from(reminderRepository.save(reminder));
    }

    /**
     * 특정 사용자의 리마인더 목록을 조회한다.
     */
    public List<ReminderResponse> getReminders(Long userId) {
        return reminderRepository.findAllByUserId(userId).stream().map(ReminderResponse::from).toList();
    }

    /**
     * 사용자 SSE 연결을 생성하고 초기 연결 이벤트를 보낸다.
     */
    public SseEmitter connect(Long userId) {
        SseEmitter emitter = sseEmitterManager.connect(userId);
        sseEmitterManager.send(userId, "리마인더 SSE 연결이 완료되었습니다.");
        return emitter;
    }

    /**
     * 사용자 소유 리마인더를 삭제한다.
     */
    @Transactional
    public void deleteReminder(Long userId, Long id) {
        Reminder reminder = reminderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.REMINDER_NOT_FOUND));
        reminderRepository.delete(reminder);
    }

    /**
     * 매 분마다 현재 시각과 일치하는 리마인더를 조회해 SSE 이벤트로 전송한다.
     */
    @Scheduled(cron = "0 * * * * *")
    public void sendReminderNotifications() {
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        List<Reminder> reminders = reminderRepository.findAllByReminderTime(now);
        for (Reminder reminder : reminders) {
            sseEmitterManager.send(reminder.getUserId(), ReminderResponse.from(reminder));
        }
    }
}
