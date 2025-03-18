package booktine.Booktine.service;

import booktine.Booktine.controller.dto.RecommendedBook;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class RecommendationService {

    private final RestTemplate restTemplate;
    private final String googleBooksApiUrl = "https://www.googleapis.com/books/v1/volumes?q=subject:";

    public RecommendationService() {
        this.restTemplate = new RestTemplate();
    }

    public RecommendedBook getRandomBookByGenre(String genre) {
        // 기본값 처리
        if (genre == null || genre.trim().isEmpty()) {
            genre = "fiction";
        }

        String url = googleBooksApiUrl + genre;
        try {
            // 외부 API 호출
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.getBody().get("items");
            if (items == null || items.isEmpty()) {
                return new RecommendedBook("추천할 책이 없습니다.", "", "", "", genre);
            }
            // 랜덤으로 책 선택
            int randomIndex = new Random().nextInt(items.size());
            Map<String, Object> bookItem = items.get(randomIndex);
            Map<String, Object> volumeInfo = (Map<String, Object>) bookItem.get("volumeInfo");

            String title = (String) volumeInfo.getOrDefault("title", "제목 없음");
            List<String> authors = (List<String>) volumeInfo.get("authors");
            String author = (authors != null && !authors.isEmpty()) ? authors.get(0) : "저자 미상";
            String description = (String) volumeInfo.getOrDefault("description", "소개 없음");
            Map<String, Object> imageLinks = (Map<String, Object>) volumeInfo.get("imageLinks");
            String coverUrl = imageLinks != null ? (String) imageLinks.getOrDefault("thumbnail", null) : null;

            return new RecommendedBook(title, author, description, coverUrl, genre);
        } catch (Exception e) {
            e.printStackTrace();
            return new RecommendedBook("추천할 책이 없습니다.", "", "", "", genre);
        }
    }
}
