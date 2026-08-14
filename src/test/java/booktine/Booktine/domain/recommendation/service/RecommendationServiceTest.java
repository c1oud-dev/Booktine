package booktine.Booktine.domain.recommendation.service;

import booktine.Booktine.domain.recommendation.client.AladinApiClient;
import booktine.Booktine.domain.recommendation.dto.AladinBookResponse;
import booktine.Booktine.domain.recommendation.dto.RecommendationResponse;
import booktine.Booktine.domain.recommendation.dto.RecommendationSaveRequest;
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
import static org.mockito.Mockito.*;

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
    @DisplayName("장르 기반 도서 추천 목록은 최대 6권 반환")
    void recommendListByGenre_limitToSix() {
        // given
        User user = createUser(1L);
        List<AladinBookResponse> books = List.of(
                new AladinBookResponse("제목1", "저자", "출판사", "cover", "소설", "설명", "1"),
                new AladinBookResponse("제목2", "저자", "출판사", "cover", "소설", "설명", "2"),
                new AladinBookResponse("제목3", "저자", "출판사", "cover", "소설", "설명", "3"),
                new AladinBookResponse("제목4", "저자", "출판사", "cover", "소설", "설명", "4"),
                new AladinBookResponse("제목5", "저자", "출판사", "cover", "소설", "설명", "5"),
                new AladinBookResponse("제목6", "저자", "출판사", "cover", "소설", "설명", "6"),
                new AladinBookResponse("제목7", "저자", "출판사", "cover", "소설", "설명", "7")
        );
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(aladinApiClient.searchBooksByGenre("소설")).willReturn(books);

        // when
        List<RecommendationResponse> responses = recommendationService.recommendListByGenre(1L, "소설", 10);

        // then
        assertThat(responses).hasSize(6);
        assertThat(responses).extracting(RecommendationResponse::title).containsExactly("제목1", "제목2", "제목3", "제목4", "제목5", "제목6");
    }

    @Test
    @DisplayName("알라딘 API 응답이 비어있을 때 예외 발생")
    void recommendListByGenre_emptyResponse_throwException() {
        // given
        User user = createUser(1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(aladinApiClient.searchBooksByGenre("소설")).willReturn(List.of());

        // when & then
        assertThatThrownBy(() -> recommendationService.recommendListByGenre(1L, "소설", 6))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RECOMMENDATION_NOT_AVAILABLE);
    }

    @Test
    @DisplayName("존재하지 않는 사용자가 장르 기반 도서 추천 요청 시 예외 발생")
    void recommendListByGenre_userNotFound_throwException() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> recommendationService.recommendListByGenre(1L, "소설", 6))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("추천 도서 저장 성공")
    void saveRecommendation_success() {
        // given
        User user = createUser(1L);
        RecommendationSaveRequest request = new RecommendationSaveRequest("제목", "저자", "출판사", "cover", "장르", "설명", "isbn");
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
    @DisplayName("동일 ISBN 추천 도서 저장 시 기존 추천 반환")
    void saveRecommendation_existingIsbn_returnsExisting() {
        // given
        User user = createUser(1L);
        RecommendationSaveRequest request = new RecommendationSaveRequest(
                "제목", "저자", "출판사", "cover", "장르", "설명", " isbn ");
        Recommendation existing = createRecommendation(10L, 1L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(recommendationRepository.findByUserIdAndIsbn(1L, "isbn")).willReturn(Optional.of(existing));

        // when
        RecommendationResponse response = recommendationService.saveRecommendation(1L, request);

        // then
        assertThat(response.id()).isEqualTo(10L);
        verify(recommendationRepository, never()).save(any());
    }

    @Test
    @DisplayName("공백 ISBN 추천 도서 저장 성공")
    void saveRecommendation_blankIsbn_success() {
        // given
        User user = createUser(1L);
        RecommendationSaveRequest request = new RecommendationSaveRequest(
                "제목", "저자", "출판사", "cover", "장르", "설명", "   ");
        Recommendation saved = Recommendation.builder()
                .user(user)
                .title("제목")
                .author("저자")
                .publisher("출판사")
                .coverImageUrl("cover")
                .genre("장르")
                .description("설명")
                .isbn("")
                .build();
        ReflectionTestUtils.setField(saved, "id", 10L);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(recommendationRepository.save(any())).willReturn(saved);

        // when
        RecommendationResponse response = recommendationService.saveRecommendation(1L, request);

        // then
        assertThat(response.isbn()).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 사용자가 추천 도서 저장 시 예외 발생")
    void saveRecommendation_userNotFound_throws() {
        // given
        RecommendationSaveRequest request = new RecommendationSaveRequest(
                "제목", "저자", "출판사", "cover", "장르", "설명", "isbn");
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> recommendationService.saveRecommendation(1L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
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
    @DisplayName("존재하지 않는 사용자의 추천 도서 목록 조회 시 예외 발생")
    void getSavedRecommendations_userNotFound_throws() {
        // given
        PageRequest pageable = PageRequest.of(0, 10);
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> recommendationService.getSavedRecommendations(1L, pageable))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("키워드 기준 외부 도서 검색 성공")
    void searchBooks_success() {
        // given
        PageRequest pageable = PageRequest.of(0, 1);
        List<AladinBookResponse> books = List.of(
                new AladinBookResponse("제목1", "저자", "출판사", "cover", "소설", "설명", "1"),
                new AladinBookResponse("제목2", "저자", "출판사", "cover", "소설", "설명", "2")
        );
        given(aladinApiClient.searchBooksByKeyword("검색어")).willReturn(books);

        // when
        Page<AladinBookResponse> response = recommendationService.searchBooks("검색어", pageable);

        // then
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getTotalElements()).isEqualTo(2);
        assertThat(response.getContent().get(0).title()).isEqualTo("제목1");
    }

    @Test
    @DisplayName("외부 도서 검색 페이지 범위를 벗어나면 빈 결과 반환")
    void searchBooks_outOfRange_returnsEmpty() {
        // given
        PageRequest pageable = PageRequest.of(1, 1);
        given(aladinApiClient.searchBooksByKeyword("검색어")).willReturn(List.of());

        // when
        Page<AladinBookResponse> response = recommendationService.searchBooks("검색어", pageable);

        // then
        assertThat(response.getContent()).isEmpty();
        assertThat(response.getTotalElements()).isZero();
    }

    @Test
    @DisplayName("베스트셀러 외부 조회 성공")
    void getBestsellers_success() {
        // given
        PageRequest pageable = PageRequest.of(0, 10);
        AladinBookResponse book = new AladinBookResponse(
                "제목", "저자", "출판사", "cover", "소설", "설명", "1");
        given(aladinApiClient.getBestsellers()).willReturn(List.of(book));

        // when
        Page<AladinBookResponse> response = recommendationService.getBestsellers(pageable);

        // then
        assertThat(response.getContent()).containsExactly(book);
        assertThat(response.getTotalElements()).isEqualTo(1);
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

    @Test
    @DisplayName("존재하지 않는 추천 도서 삭제 시 예외 발생")
    void deleteRecommendation_notFound() {
        // given
        given(recommendationRepository.findById(4L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> recommendationService.deleteRecommendation(1L, 4L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RECOMMENDATION_NOT_FOUND);
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
