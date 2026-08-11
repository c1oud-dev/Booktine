package booktine.Booktine.domain.reminder.sse;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.time.Instant;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SseEmitterManagerTest {

    private final SseEmitterManager sseEmitterManager = new SseEmitterManager();

    @Test
    @DisplayName("하트비트 호출 시 등록된 모든 emitter에 heartbeat 주석을 전송한다")
    void sendHeartbeats_sendsCommentToEveryEmitter() throws IOException {
        // given
        SseEmitter firstEmitter = mock(SseEmitter.class);
        SseEmitter secondEmitter = mock(SseEmitter.class);
        emitterStore().put(1L, new CopyOnWriteArrayList<>(List.of(firstEmitter)));
        emitterStore().put(2L, new CopyOnWriteArrayList<>(List.of(secondEmitter)));

        // when
        sseEmitterManager.sendHeartbeats();

        // then
        verify(firstEmitter).send(any(SseEmitter.SseEventBuilder.class));
        verify(secondEmitter).send(any(SseEmitter.SseEventBuilder.class));
        assertThat(sentEvent(firstEmitter)).contains("heartbeat");
        assertThat(sentEvent(secondEmitter)).contains("heartbeat");
    }

    @Test
    @DisplayName("하트비트 전송 중 IOException이 발생하면 emitter와 빈 사용자 key를 제거한다")
    void sendHeartbeats_removesEmitterOnIOException() throws IOException {
        // given
        SseEmitter emitter = mock(SseEmitter.class);
        emitterStore().put(1L, new CopyOnWriteArrayList<>(List.of(emitter)));
        doThrow(new IOException("connection closed"))
                .when(emitter)
                .send(any(SseEmitter.SseEventBuilder.class));

        // when
        sseEmitterManager.sendHeartbeats();

        // then
        assertThat(emitterStore()).doesNotContainKey(1L);
        assertThat(sseEmitterManager.getSendFailureCount()).isEqualTo(1L);
    }

    @Test
    @DisplayName("이벤트 ID를 순차 증가시키고 사용자별 캐시에 저장한다")
    void send_assignsSequentialIdsAndCachesByUser() throws IOException {
        // given
        SseEmitter firstUserEmitter = mock(SseEmitter.class);
        SseEmitter secondUserEmitter = mock(SseEmitter.class);
        emitterStore().put(1L, new CopyOnWriteArrayList<>(List.of(firstUserEmitter)));
        emitterStore().put(2L, new CopyOnWriteArrayList<>(List.of(secondUserEmitter)));

        // when
        sseEmitterManager.send(1L, "first");
        sseEmitterManager.sendNotification(1L, "second");
        sseEmitterManager.send(2L, "third");

        // then
        assertThat(sentEvents(firstUserEmitter))
                .anySatisfy(event -> assertThat(event).contains("id:1", "event:reminder", "first"))
                .anySatisfy(event -> assertThat(event).contains("id:2", "event:notification", "second"));
        assertThat(sentEvent(secondUserEmitter)).contains("id:3", "third");
        assertThat(eventCache().get(1L)).hasSize(2);
        assertThat(eventCache().get(2L)).hasSize(1);
    }

    @Test
    @DisplayName("사용자별 캐시가 100개를 초과하면 가장 오래된 이벤트를 제거한다")
    void send_evictsOldestEventOverCacheLimit() {
        // given
        long userId = 1L;

        // when
        for (int index = 1; index <= 101; index++) {
            sseEmitterManager.send(userId, "event-" + index);
        }

        // then
        Deque<?> events = eventCache().get(userId);
        assertThat(events).hasSize(100);
        assertThat(eventId(events.getFirst())).isEqualTo(2L);
        assertThat(eventId(events.getLast())).isEqualTo(101L);
    }

    @Test
    @DisplayName("새 이벤트 캐싱 시 10분이 지난 이벤트를 만료 처리한다")
    void send_prunesExpiredEventBeforeCaching() throws Exception {
        // given
        sseEmitterManager.send(1L, "expired");
        replaceFirstCachedEventCreatedAt(1L, Instant.now().minusSeconds(601));

        // when
        sseEmitterManager.send(1L, "current");

        // then
        assertThat(eventCache().get(1L)).hasSize(1);
        assertThat(eventData(eventCache().get(1L).getFirst())).isEqualTo("current");
    }

    @Test
    @DisplayName("하트비트 스케줄에서 만료 이벤트와 빈 캐시 key를 정리한다")
    void sendHeartbeats_prunesExpiredEventCache() throws Exception {
        // given
        sseEmitterManager.send(1L, "expired");
        replaceFirstCachedEventCreatedAt(1L, Instant.now().minusSeconds(601));

        // when
        sseEmitterManager.sendHeartbeats();

        // then
        assertThat(eventCache()).doesNotContainKey(1L);
    }

    @Test
    @DisplayName("재연결 시 Last-Event-ID 이후 이벤트만 새 emitter로 재전송한다")
    void connect_replaysOnlyEventsAfterLastEventId() throws IOException {
        // given
        sseEmitterManager.send(1L, "first");
        sseEmitterManager.send(1L, "second");
        sseEmitterManager.send(1L, "third");

        try (MockedConstruction<SseEmitter> construction = mockConstruction(SseEmitter.class)) {
            // when
            SseEmitter connectedEmitter = sseEmitterManager.connect(1L, "1");

            // then
            assertThat(connectedEmitter).isSameAs(construction.constructed().get(0));
            assertThat(sentEvents(connectedEmitter))
                    .hasSize(2)
                    .anySatisfy(event -> assertThat(event).contains("id:2", "second"))
                    .anySatisfy(event -> assertThat(event).contains("id:3", "third"));
        }
    }

    @Test
    @DisplayName("Last-Event-ID가 없거나 음수이면 이벤트를 재전송하지 않는다")
    void connect_doesNotReplayForMissingOrNegativeLastEventId() throws IOException {
        // given
        sseEmitterManager.send(1L, "cached");

        try (MockedConstruction<SseEmitter> construction = mockConstruction(SseEmitter.class)) {
            // when
            SseEmitter missingIdEmitter = sseEmitterManager.connect(1L, null);
            SseEmitter negativeIdEmitter = sseEmitterManager.connect(1L, "-1");

            // then
            verify(missingIdEmitter, never()).send(any(SseEmitter.SseEventBuilder.class));
            verify(negativeIdEmitter, never()).send(any(SseEmitter.SseEventBuilder.class));
            assertThat(construction.constructed()).hasSize(2);
        }
    }

    @Test
    @DisplayName("캐시가 없는 사용자의 재연결을 예외 없이 처리한다")
    void connect_handlesUserWithoutCache() {
        // given
        try (MockedConstruction<SseEmitter> ignored = mockConstruction(SseEmitter.class)) {
            // when // then
            assertThatCode(() -> sseEmitterManager.connect(99L, "10"))
                    .doesNotThrowAnyException();
        }
    }

    @Test
    @DisplayName("재전송 이벤트는 기존 emitter가 아닌 새 emitter에만 전달한다")
    void connect_replaysOnlyToNewEmitter() throws IOException {
        // given
        SseEmitter existingEmitter = mock(SseEmitter.class);
        emitterStore().put(1L, new CopyOnWriteArrayList<>(List.of(existingEmitter)));
        sseEmitterManager.send(1L, "cached");
        verify(existingEmitter).send(any(SseEmitter.SseEventBuilder.class));

        try (MockedConstruction<SseEmitter> construction = mockConstruction(SseEmitter.class)) {
            // when
            SseEmitter newEmitter = sseEmitterManager.connect(1L, "0");

            // then
            verify(existingEmitter, times(1)).send(any(SseEmitter.SseEventBuilder.class));
            verify(newEmitter, times(1)).send(any(SseEmitter.SseEventBuilder.class));
            assertThat(construction.constructed()).containsExactly(newEmitter);
        }
    }

    @Test
    @DisplayName("이벤트 전송 실패 횟수를 누적하여 조회한다")
    void send_incrementsAndReturnsFailureCount() throws IOException {
        // given
        SseEmitter firstEmitter = failingEmitter();
        SseEmitter secondEmitter = failingEmitter();
        emitterStore().put(1L, new CopyOnWriteArrayList<>(List.of(firstEmitter, secondEmitter)));

        // when
        sseEmitterManager.send(1L, "data");

        // then
        assertThat(sseEmitterManager.getSendFailureCount()).isEqualTo(2L);
        assertThat(emitterStore()).doesNotContainKey(1L);
    }

    @Test
    @DisplayName("completion timeout error 콜백에서 emitter와 빈 사용자 key를 제거한다")
    void connect_lifecycleCallbacksRemoveEmitterAndEmptyUserKey() {
        // given
        ArgumentCaptor<Runnable> completionCaptor = ArgumentCaptor.forClass(Runnable.class);
        ArgumentCaptor<Runnable> timeoutCaptor = ArgumentCaptor.forClass(Runnable.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Consumer<Throwable>> errorCaptor = ArgumentCaptor.forClass(Consumer.class);

        try (MockedConstruction<SseEmitter> construction = mockConstruction(SseEmitter.class)) {
            SseEmitter completionEmitter = sseEmitterManager.connect(1L);
            SseEmitter timeoutEmitter = sseEmitterManager.connect(2L);
            SseEmitter errorEmitter = sseEmitterManager.connect(3L);
            verify(completionEmitter).onCompletion(completionCaptor.capture());
            verify(timeoutEmitter).onTimeout(timeoutCaptor.capture());
            verify(errorEmitter).onError(errorCaptor.capture());

            // when
            completionCaptor.getValue().run();
            timeoutCaptor.getValue().run();
            errorCaptor.getValue().accept(new IOException("closed"));

            // then
            assertThat(emitterStore()).doesNotContainKeys(1L, 2L, 3L);
            assertThat(construction.constructed()).hasSize(3);
        }
    }

    private SseEmitter failingEmitter() throws IOException {
        SseEmitter emitter = mock(SseEmitter.class);
        doThrow(new IOException("send failed"))
                .when(emitter)
                .send(any(SseEmitter.SseEventBuilder.class));
        return emitter;
    }

    private String sentEvent(SseEmitter emitter) throws IOException {
        return sentEvents(emitter).get(0);
    }

    private List<String> sentEvents(SseEmitter emitter) throws IOException {
        ArgumentCaptor<SseEmitter.SseEventBuilder> captor =
                ArgumentCaptor.forClass(SseEmitter.SseEventBuilder.class);
        verify(emitter, org.mockito.Mockito.atLeastOnce()).send(captor.capture());
        return captor.getAllValues().stream()
                .map(builder -> builder.build().stream()
                        .map(item -> String.valueOf(item.getData()))
                        .reduce("", (left, right) -> left + right))
                .toList();
    }

    @SuppressWarnings("unchecked")
    private Map<Long, List<SseEmitter>> emitterStore() {
        return (Map<Long, List<SseEmitter>>) ReflectionTestUtils.getField(
                sseEmitterManager,
                "emitterStore"
        );
    }

    @SuppressWarnings("unchecked")
    private Map<Long, Deque<?>> eventCache() {
        return (Map<Long, Deque<?>>) ReflectionTestUtils.getField(
                sseEmitterManager,
                "eventCache"
        );
    }

    private long eventId(Object event) {
        return (long) ReflectionTestUtils.getField(event, "id");
    }

    private Object eventData(Object event) {
        return ReflectionTestUtils.getField(event, "data");
    }

    private void replaceFirstCachedEventCreatedAt(Long userId, Instant createdAt) throws Exception {
        Deque<?> events = eventCache().get(userId);
        Object original = events.removeFirst();
        Class<?> cachedEventType = original.getClass();
        Constructor<?> constructor = cachedEventType.getDeclaredConstructor(
                long.class,
                String.class,
                Object.class,
                Instant.class
        );
        constructor.setAccessible(true);
        Object expired = constructor.newInstance(
                eventId(original),
                ReflectionTestUtils.getField(original, "name"),
                eventData(original),
                createdAt
        );
        @SuppressWarnings("unchecked")
        Deque<Object> writableEvents = (Deque<Object>) events;
        writableEvents.addFirst(expired);
    }
}