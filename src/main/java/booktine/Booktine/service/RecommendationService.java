package booktine.Booktine.service;

import booktine.Booktine.controller.dto.RecommendedBook;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class RecommendationService {

    private final RestTemplate restTemplate;
    // 알라딘 API 사용을 위한 기본 설정 (YOUR_TTB_KEY를 본인의 TTBKEY로 변경)
    private final String ttbKey = "ttbgksmf41651630001";
    private final String aladinApiUrl = "http://www.aladin.co.kr/ttb/api/ItemSearch.aspx";

    public RecommendationService() {
        this.restTemplate = new RestTemplate();
        // JSON 응답의 Content-Type이 text/javascript 등으로 오는 경우를 대비한 메시지 컨버터 추가
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setSupportedMediaTypes(
                Arrays.asList(MediaType.APPLICATION_JSON, new MediaType("text", "javascript"), MediaType.TEXT_PLAIN)
        );
        this.restTemplate.getMessageConverters().add(0, converter);
    }

    public RecommendedBook getRandomBookByGenre(String genre) {
        // 기본값 처리: 장르가 없으면 "소설"로 처리
        if (genre == null || genre.trim().isEmpty()) {
            genre = "소설";
        }
        // 알라딘 API 호출 URL 구성
        String url = aladinApiUrl
                + "?ttbkey=" + ttbKey
                + "&Query=" + genre
                + "&QueryType=Genre"
                + "&MaxResults=10"
                + "&start=1"
                + "&SearchTarget=Book"
                + "&output=js"
                + "&Version=20131101";
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.getBody().get("item");
            if (items == null || items.isEmpty()) {
                return new RecommendedBook("추천할 책이 없습니다.", "", "", "", genre);
            }
            int randomIndex = new Random().nextInt(items.size());
            Map<String, Object> bookItem = items.get(randomIndex);

            String title = (String) bookItem.getOrDefault("title", "제목 없음");
            String author = (String) bookItem.getOrDefault("author", "저자 미상");
            String description = (String) bookItem.getOrDefault("description", "소개 없음");
            String coverUrl = (String) bookItem.getOrDefault("cover", null);

            return new RecommendedBook(title, author, description, coverUrl, genre);
        } catch (Exception e) {
            e.printStackTrace();
            return new RecommendedBook("추천할 책이 없습니다.", "", "", "", genre);
        }
    }
}
