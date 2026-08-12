package booktine.Booktine.domain.notification.service;

import booktine.Booktine.domain.notification.dto.NotificationResponse;
import booktine.Booktine.domain.notification.entity.Notification;
import booktine.Booktine.domain.notification.entity.NotificationType;
import booktine.Booktine.domain.notification.repository.NotificationRepository;
import booktine.Booktine.domain.reminder.sse.SseEmitterManager;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * NotificationService 단위 테스트.
 * Mockito 기반으로 리포지토리와 SSE 매니저를 Mock 처리하여 알림 서비스 로직을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SseEmitterManager sseEmitterManager;

    @Test
    @DisplayName("알림 생성 및 SSE 전송 성공")
    void sendNotification_success() {
        // given
        Notification saved = createNotification(1L, 2L, 3L, NotificationType.COMMENT, "댓글 알림");
        given(notificationRepository.save(org.mockito.ArgumentMatchers.any(Notification.class)))
                .willReturn(saved);

        // when
        notificationService.sendNotification(2L, 3L, NotificationType.COMMENT, "댓글 알림");

        // then
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(2L);
        assertThat(captor.getValue().getPostId()).isEqualTo(3L);
        assertThat(captor.getValue().getType()).isEqualTo(NotificationType.COMMENT);
        assertThat(captor.getValue().getMessage()).isEqualTo("댓글 알림");
        assertThat(captor.getValue().isRead()).isFalse();
        verify(sseEmitterManager, times(1)).sendNotification(
                2L,
                NotificationResponse.from(saved)
        );
    }

    @Test
    @DisplayName("알림 목록 조회 성공")
    void getNotifications_success() {
        // given
        Notification notification = createNotification(1L, 2L, 3L, NotificationType.LIKE, "좋아요 알림");
        given(notificationRepository.findAllByUserIdOrderByCreatedAtDesc(2L))
                .willReturn(List.of(notification));

        // when
        List<NotificationResponse> responses = notificationService.getNotifications(2L);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).id()).isEqualTo(1L);
        assertThat(responses.get(0).postId()).isEqualTo(3L);
        assertThat(responses.get(0).type()).isEqualTo(NotificationType.LIKE);
        assertThat(responses.get(0).message()).isEqualTo("좋아요 알림");
        assertThat(responses.get(0).isRead()).isFalse();
    }

    @Test
    @DisplayName("읽지 않은 알림 수 조회 성공")
    void getUnreadCount_success() {
        // given
        given(notificationRepository.countByUserIdAndIsReadFalse(2L)).willReturn(3L);

        // when
        long count = notificationService.getUnreadCount(2L);

        // then
        assertThat(count).isEqualTo(3L);
    }

    @Test
    @DisplayName("알림 읽음 처리 성공")
    void read_success() {
        // given
        Notification notification = createNotification(1L, 2L, 3L, NotificationType.COMMENT, "댓글 알림");
        given(notificationRepository.findByIdAndUserId(1L, 2L))
                .willReturn(Optional.of(notification));

        // when
        notificationService.read(2L, 1L);

        // then
        assertThat(notification.isRead()).isTrue();
    }

    @Test
    @DisplayName("사용자의 알림이 없으면 읽음 처리 시 예외 발생")
    void read_notFound_throwsException() {
        // given
        given(notificationRepository.findByIdAndUserId(1L, 2L))
                .willReturn(Optional.empty());

        // when // then
        assertThatThrownBy(() -> notificationService.read(2L, 1L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOT_FOUND);
    }

    @Test
    @DisplayName("모든 알림 읽음 처리 성공")
    void readAll_success() {
        // given
        Notification first = createNotification(1L, 2L, 3L, NotificationType.COMMENT, "댓글 알림");
        Notification second = createNotification(4L, 2L, 5L, NotificationType.LIKE, "좋아요 알림");
        given(notificationRepository.findAllByUserIdOrderByCreatedAtDesc(2L))
                .willReturn(List.of(first, second));

        // when
        notificationService.readAll(2L);

        // then
        assertThat(first.isRead()).isTrue();
        assertThat(second.isRead()).isTrue();
    }

    @Test
    @DisplayName("SSE 연결 성공")
    void connect_success() {
        // given
        SseEmitter emitter = new SseEmitter();
        given(sseEmitterManager.connect(2L, null)).willReturn(emitter);

        // when
        SseEmitter result = notificationService.connect(2L);

        // then
        assertThat(result).isSameAs(emitter);
    }

    @Test
    @DisplayName("마지막 이벤트 ID를 포함한 SSE 연결 성공")
    void connect_withLastEventId_success() {
        // given
        SseEmitter emitter = new SseEmitter();
        given(sseEmitterManager.connect(2L, "10")).willReturn(emitter);

        // when
        SseEmitter result = notificationService.connect(2L, "10");

        // then
        assertThat(result).isSameAs(emitter);
    }

    private Notification createNotification(Long id, Long userId, Long postId,
                                            NotificationType type, String message) {
        Notification notification = Notification.builder()
                .userId(userId)
                .postId(postId)
                .type(type)
                .message(message)
                .build();
        ReflectionTestUtils.setField(notification, "id", id);
        return notification;
    }
}