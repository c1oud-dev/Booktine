package booktine.Booktine.domain.recommendation.client;

import booktine.Booktine.domain.recommendation.dto.AladinBookResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

/**
 * 알라딘 ItemSearch API 연동을 담당하는 클라이언트.
 * RecommendationService에서 장르 기반 추천 후보 도서를 조회할 때 사용된다.
 */
@Slf4j
@Component
public class AladinApiClient {

    private final RestClient restClient;
    private final String ttbKey;

    public AladinApiClient(@Value("${aladin.api.ttb-key}") String ttbKey) {
        this.restClient = RestClient.builder().baseUrl("http://www.aladin.co.kr/ttb/api").build();
        this.ttbKey = ttbKey;
    }

    /**
     * 장르(키워드) 기준으로 알라딘 ItemSearch API를 호출해 도서 목록을 조회한다.
     */
    public List<AladinBookResponse> searchBooksByGenre(String genre) {
        try {
            AladinSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/ItemSearch.aspx")
                            .queryParam("ttbkey", ttbKey)
                            .queryParam("QueryType", "Keyword")
                            .queryParam("Query", genre)
                            .queryParam("output", "js")
                            .queryParam("Version", "20131101")
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(AladinSearchResponse.class);

            if (response == null || response.item() == null) {
                return Collections.emptyList();
            }
            return response.item();
        } catch (Exception exception) {
            log.warn("알라딘 API 호출에 실패했습니다. genre={}", genre, exception);
            return Collections.emptyList();
        }
    }

    /**
     * 알라딘 ItemSearch API 루트 응답 객체를 매핑한다.
     */
    private record AladinSearchResponse(List<AladinBookResponse> item) {
    }
}
