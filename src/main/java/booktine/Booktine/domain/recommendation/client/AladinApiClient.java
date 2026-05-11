package booktine.Booktine.domain.recommendation.client;

import booktine.Booktine.domain.recommendation.dto.AladinBookResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

/**
 * 알라딘 OpenAPI 연동을 담당하는 클라이언트.
 * RecommendationService에서 장르 추천/키워드 검색/베스트셀러 조회를 위해 호출한다.
 */
@Slf4j
@Component
public class AladinApiClient {

    private static final String OUTPUT_FORMAT = "js";
    private static final String API_VERSION = "20131101";
    private static final int MAX_RESULTS = 20;

    private final RestClient restClient;
    private final String ttbKey;

    public AladinApiClient(@Value("${aladin.api.ttb-key}") String ttbKey) {
        this.restClient = RestClient.builder().baseUrl("https://www.aladin.co.kr/ttb/api").build();
        this.ttbKey = ttbKey;
    }

    /**
     * 장르(키워드) 기준으로 알라딘 ItemSearch API를 호출해 도서 목록을 조회한다.
     */
    public List<AladinBookResponse> searchBooksByGenre(String genre) {
        return searchBooksByKeyword(genre);
    }

    /**
     * 키워드 기준으로 알라딘 ItemSearch API를 호출해 도서 목록을 조회한다.
     */
    public List<AladinBookResponse> searchBooksByKeyword(String query) {
        return fetchItems(() -> restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/ItemSearch.aspx")
                                .queryParam("ttbkey", ttbKey)
                                .queryParam("QueryType", "Keyword")
                                .queryParam("Query", query)
                                .queryParam("MaxResults", MAX_RESULTS)
                                .queryParam("output", OUTPUT_FORMAT)
                                .queryParam("Version", API_VERSION)
                                .build()),
                () -> log.warn("알라딘 키워드 검색 API 호출에 실패했습니다. query={}", query));
    }

    /**
     * 알라딘 ItemList API를 호출해 베스트셀러 목록을 조회한다.
     */
    public List<AladinBookResponse> getBestsellers() {
        return fetchItems(() -> restClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/ItemList.aspx")
                                .queryParam("ttbkey", ttbKey)
                                .queryParam("QueryType", "Bestseller")
                                .queryParam("MaxResults", MAX_RESULTS)
                                .queryParam("SearchTarget", "Book")
                                .queryParam("output", OUTPUT_FORMAT)
                                .queryParam("Version", API_VERSION)
                                .build()),
                () -> log.warn("알라딘 베스트셀러 API 호출에 실패했습니다."));
    }

    /**
     * 알라딘 API 호출 결과를 공통적으로 파싱해 도서 목록으로 반환한다.
     */
    private List<AladinBookResponse> fetchItems(RequestSupplier requestSupplier, Runnable failLogAction) {
        if (!hasUsableTtbKey()) {
            log.warn("알라딘 API 키가 설정되지 않아 외부 도서 조회를 건너뜁니다. 환경변수 ALADIN_TTB_KEY를 설정해 주세요.");
            return Collections.emptyList();
        }

        try {
            AladinSearchResponse response = requestSupplier.get()
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(AladinSearchResponse.class);

            if (response == null || response.item() == null) {
                return Collections.emptyList();
            }
            return response.item();
        } catch (Exception exception) {
            failLogAction.run();
            log.debug("알라딘 API 예외 상세", exception);
            return Collections.emptyList();
        }
    }

    /**
     * 알라딘 API 키가 실제 호출에 사용할 수 있는 값인지 확인한다.
     */
    private boolean hasUsableTtbKey() {
        return StringUtils.hasText(ttbKey) && !"dummy".equalsIgnoreCase(ttbKey.trim());
    }

    /**
     * RestClient 요청 생성을 추상화한 함수형 인터페이스.
     */
    @FunctionalInterface
    private interface RequestSupplier {
        RestClient.RequestHeadersSpec<?> get();
    }

    /**
     * 알라딘 API 루트 응답 객체를 매핑한다.
     */
    private record AladinSearchResponse(List<AladinBookResponse> item) {
    }
}
