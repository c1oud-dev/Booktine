package booktine.Booktine.domain.reminder.service;

import booktine.Booktine.domain.reminder.dto.ReminderCreateRequest;
import booktine.Booktine.domain.reminder.dto.ReminderResponse;
import booktine.Booktine.domain.reminder.entity.Reminder;
import booktine.Booktine.domain.reminder.repository.ReminderRepository;
import booktine.Booktine.domain.reminder.sse.SseEmitterManager;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * ReminderService 단위 테스트.
 * Mockito를 사용해 리포지토리와 SSE 매니저를 모킹하고 리마인더 비즈니스 로직을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {

    @InjectMocks
    private ReminderService reminderService;

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private SseEmitterManager sseEmitterManager;

    /**
     * 리마인더 생성 로직이 정상 동작하는지 검증한다.
     */
    @Test
    @DisplayName("리마인더 생성 성공")
    void createReminder_success() {
        // given
        ReminderCreateRequest request = new ReminderCreateRequest(LocalTime.of(21, 30), "독서할 시간이에요");
        Reminder reminder = Reminder.builder().userId(1L).reminderTime(LocalTime.of(21, 30)).message("독서할 시간이에요").build();
        ReflectionTestUtils.setField(reminder, "id", 10L);
        given(reminderRepository.save(any(Reminder.class))).willReturn(reminder);

        // when
        ReminderResponse response = reminderService.createReminder(1L, request);

        // then
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.userId()).isEqualTo(1L);
    }

    /**
     * 사용자 리마인더 목록 조회가 정상 동작하는지 검증한다.
     */
    @Test
    @DisplayName("리마인더 목록 조회 성공")
    void getReminders_success() {
        // given
        Reminder reminder = Reminder.builder().userId(1L).reminderTime(LocalTime.of(8, 0)).message("아침 독서").build();
        ReflectionTestUtils.setField(reminder, "id", 1L);
        given(reminderRepository.findAllByUserId(1L)).willReturn(List.of(reminder));

        // when
        List<ReminderResponse> responses = reminderService.getReminders(1L);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).message()).isEqualTo("아침 독서");
    }

    /**
     * SSE 연결 생성 시 매니저가 호출되는지 검증한다.
     */
    @Test
    @DisplayName("리마인더 SSE 연결 성공")
    void connect_success() {
        // given
        SseEmitter emitter = new SseEmitter();
        given(sseEmitterManager.connect(1L)).willReturn(emitter);

        // when
        SseEmitter response = reminderService.connect(1L);

        // then
        assertThat(response).isSameAs(emitter);
        verify(sseEmitterManager, times(1)).send(1L, "리마인더 SSE 연결이 완료되었습니다.");
    }

    /**
     * 리마인더 삭제가 정상 동작하는지 검증한다.
     */
    @Test
    @DisplayName("리마인더 삭제 성공")
    void deleteReminder_success() {
        // given
        Reminder reminder = Reminder.builder().userId(1L).reminderTime(LocalTime.of(10, 0)).message("삭제 대상").build();
        ReflectionTestUtils.setField(reminder, "id", 7L);
        given(reminderRepository.findByIdAndUserId(7L, 1L)).willReturn(Optional.of(reminder));

        // when
        reminderService.deleteReminder(1L, 7L);

        // then
        verify(reminderRepository, times(1)).delete(reminder);
    }

    /**
     * 사용자 소유 리마인더가 없으면 예외가 발생하는지 검증한다.
     */
    @Test
    @DisplayName("존재하지 않는 리마인더 삭제 시 예외 발생")
    void deleteReminder_notFound() {
        // given
        given(reminderRepository.findByIdAndUserId(99L, 1L)).willReturn(Optional.empty());

        // when // then
        assertThatThrownBy(() -> reminderService.deleteReminder(1L, 99L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.REMINDER_NOT_FOUND);
    }

    /**
     * 스케줄러가 현재 시각 리마인더를 사용자별로 SSE 전송하는지 검증한다.
     */
    @Test
    @DisplayName("리마인더 스케줄 알림 전송 성공")
    void sendReminderNotifications_success() {
        // given
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        Reminder reminder = Reminder.builder().userId(1L).reminderTime(now).message("시간 알림").build();
        ReflectionTestUtils.setField(reminder, "id", 3L);
        given(reminderRepository.findAllByReminderTime(any(LocalTime.class))).willReturn(List.of(reminder));

        // when
        reminderService.sendReminderNotifications();

        // then
        verify(sseEmitterManager, times(1)).send(1L, ReminderResponse.from(reminder));
    }
}

