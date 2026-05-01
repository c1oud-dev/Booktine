package booktine.Booktine.domain.recommendation.service;

import booktine.Booktine.domain.recommendation.client.AladinApiClient;
import booktine.Booktine.domain.recommendation.dto.AladinBookResponse;
import booktine.Booktine.domain.recommendation.dto.RecommendationResponse;
import booktine.Booktine.domain.recommendation.entity.Recommendation;
import booktine.Booktine.domain.recommendation.repository.RecommendationRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @InjectMocks
    RecommendationService recommendationService;

    @Mock
    RecommendationRepository recommendationRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    AladinApiClient aladinApiClient;

    @Test
    @DisplayName("장르 기반 도서 추천 성공")
    void recommendByGenre_success() {
        // given
        User user = createUser(1L);
        AladinBookResponse book = new AladinBookResponse("제목", "저자", "출판사", "cover-url", "소설", "설명", "123");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(aladinApiClient.searchBooksByGenre("소설")).willReturn(List.of(book));

        // when
        RecommendationResponse response = recommendationService.recommendByGenre(1L, "소설");

        // then
        assertThat(response.title()).isEqualTo("제목");
        assertThat(response.coverImageUrl()).isEqualTo("cover-url");
    }

    @Test
    @DisplayName("알라딘 API 응답이 비어있을 때 예외 발생")
    void recommendByGenre_emptyResponse_throwException() {
        // given
        User user = createUser(1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(aladinApiClient.searchBooksByGenre("소설")).willReturn(List.of());

        // when & then
        assertThatThrownBy(() -> recommendationService.recommendByGenre(1L, "소설"))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RECOMMENDATION_NOT_AVAILABLE);
    }

    @Test
    @DisplayName("추천 도서 저장 성공")
    void saveRecommendation_success() {
        // given
        User user = createUser(1L);
        RecommendationResponse request = new RecommendationResponse(null, 1L, "제목", "저자", "출판사", "cover", "장르", "설명", "isbn");
        Recommendation saved = Recommendation.builder()
                .user(user)
                .title("제목")
                .author("저자")
                .publisher("출판사")
                .coverImageUrl("cover")
                .genre("장르")
                .description("설명")
                .isbn("isbn")
                .build();
        ReflectionTestUtils.setField(saved, "id", 10L);

        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(recommendationRepository.save(any())).willReturn(saved);

        // when
        RecommendationResponse response = recommendationService.saveRecommendation(1L, request);

        // then
        assertThat(response.id()).isEqualTo(10L);
    }

    @Test
    @DisplayName("추천 도서 목록 조회 성공")
    void getSavedRecommendations_success() {
        // given
        User user = createUser(1L);
        Recommendation recommendation = Recommendation.builder()
                .user(user)
                .title("제목")
                .author("저자")
                .publisher("출판사")
                .coverImageUrl("cover")
                .genre("장르")
                .description("설명")
                .isbn("isbn")
                .build();
        ReflectionTestUtils.setField(recommendation, "id", 2L);

        PageRequest pageable = PageRequest.of(0, 10);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(recommendationRepository.findAllByUserId(1L, pageable)).willReturn(new PageImpl<>(List.of(recommendation)));

        // when
        Page<RecommendationResponse> responses = recommendationService.getSavedRecommendations(1L, pageable);

        // then
        assertThat(responses.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("추천 도서 삭제 성공")
    void deleteRecommendation_success() {
        // given
        Recommendation recommendation = createRecommendation(4L, 1L);
        given(recommendationRepository.findById(4L)).willReturn(Optional.of(recommendation));

        // when
        recommendationService.deleteRecommendation(1L, 4L);

        // then
        verify(recommendationRepository, times(1)).delete(recommendation);
    }

    @Test
    @DisplayName("본인 추천 도서가 아닌 경우 삭제 시 예외 발생")
    void deleteRecommendation_forbidden() {
        // given
        Recommendation recommendation = createRecommendation(4L, 2L);
        given(recommendationRepository.findById(4L)).willReturn(Optional.of(recommendation));

        // when & then
        assertThatThrownBy(() -> recommendationService.deleteRecommendation(1L, 4L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FORBIDDEN);
    }

    private User createUser(Long userId) {
        User user = User.builder()
                .email("email@test.com")
                .password("pw")
                .nickname("nick")
                .build();
        ReflectionTestUtils.setField(user, "id", userId);
        return user;
    }

    private Recommendation createRecommendation(Long recommendationId, Long userId) {
        Recommendation recommendation = Recommendation.builder()
                .user(createUser(userId))
                .title("제목")
                .author("저자")
                .publisher("출판사")
                .coverImageUrl("cover")
                .genre("장르")
                .description("설명")
                .isbn("isbn")
                .build();
        ReflectionTestUtils.setField(recommendation, "id", recommendationId);
        return recommendation;
    }
}
