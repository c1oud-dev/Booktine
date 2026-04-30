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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

/**
 * 추천 도서 도메인의 비즈니스 로직을 담당하는 서비스.
 * 알라딘 API 연동, 추천 저장/조회/삭제 및 사용자 권한 검증을 수행한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final UserRepository userRepository;
    private final AladinApiClient aladinApiClient;
    private final Random random = new Random();

    /**
     * 장르 기준으로 알라딘 API를 조회한 뒤 임의의 추천 도서 1권을 반환한다.
     */
    public RecommendationResponse recommendByGenre(Long userId, String genre) {
        User user = getUserById(userId);
        List<AladinBookResponse> books = aladinApiClient.searchBooksByGenre(genre);
        if (books.isEmpty()) {
            throw new CustomException(ErrorCode.RECOMMENDATION_NOT_AVAILABLE);
        }

        AladinBookResponse picked = books.get(random.nextInt(books.size()));
        Recommendation recommendation = Recommendation.builder()
                .user(user)
                .title(picked.title())
                .author(picked.author())
                .publisher(picked.publisher())
                .coverImageUrl(picked.cover())
                .genre(genre)
                .description(picked.description())
                .isbn(picked.isbn13())
                .build();
        return RecommendationResponse.from(recommendation);
    }

    /**
     * 추천 도서를 사용자의 저장 목록에 저장한다.
     */
    @Transactional
    public RecommendationResponse saveRecommendation(Long userId, RecommendationResponse request) {
        User user = getUserById(userId);
        Recommendation recommendation = Recommendation.builder()
                .user(user)
                .title(request.title())
                .author(request.author())
                .publisher(request.publisher())
                .coverImageUrl(request.coverImageUrl())
                .genre(request.genre())
                .description(request.description())
                .isbn(request.isbn())
                .build();
        return RecommendationResponse.from(recommendationRepository.save(recommendation));
    }

    /**
     * 사용자별 저장된 추천 도서 목록을 조회한다.
     */
    public List<RecommendationResponse> getSavedRecommendations(Long userId) {
        getUserById(userId);
        return recommendationRepository.findAllByUserId(userId).stream()
                .map(RecommendationResponse::from)
                .toList();
    }

    /**
     * 저장된 추천 도서를 사용자 소유권 검증 후 삭제한다.
     */
    @Transactional
    public void deleteRecommendation(Long userId, Long recommendationId) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new CustomException(ErrorCode.RECOMMENDATION_NOT_FOUND));
        if (!recommendation.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        recommendationRepository.delete(recommendation);
    }

    /**
     * 사용자 ID로 사용자 엔티티를 조회한다.
     */
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
