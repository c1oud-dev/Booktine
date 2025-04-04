package booktine.Booktine.service;

import booktine.Booktine.controller.dto.RecommendedBook;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.*;
import java.util.stream.Collectors;

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
        String url;
        RecommendedBook resultBook = null;

        // 실제 CategoryId에 따른 검색어 매핑 테이블 (PDF 값 예시)
        Map<String, String> categoryKeywordMap = new HashMap<>();
        categoryKeywordMap.put("0", "도서");       // 전체도서 처리
        categoryKeywordMap.put("100", "국내도서");
        categoryKeywordMap.put("200", "외국도서");
        categoryKeywordMap.put("1", "소설");
        categoryKeywordMap.put("2", "에세이");
        categoryKeywordMap.put("3", "인문/사회");
        categoryKeywordMap.put("4", "사회과학");
        categoryKeywordMap.put("5", "자연과학");
        categoryKeywordMap.put("6", "기술/공학");
        categoryKeywordMap.put("7", "경제/경영");
        categoryKeywordMap.put("8", "자기계발");
        categoryKeywordMap.put("9", "인물");
        categoryKeywordMap.put("2551", "만화");
        categoryKeywordMap.put("8983", "어린이");
        categoryKeywordMap.put("8988", "청소년");
        categoryKeywordMap.put("2554", "예술/대중문화");

        // 선택한 장르에 해당하는 검색어. 매핑이 없으면 "*" 사용
        String keyword = (genre == null || genre.trim().isEmpty() || "0".equals(genre))
                ? categoryKeywordMap.get("0")
                : categoryKeywordMap.getOrDefault(genre, "*");

        try {
            if (genre == null || genre.trim().isEmpty() || "0".equals(genre)) {
                // 전체도서: CategoryId 없이 "도서" 검색어 사용
                url = aladinApiUrl
                        + "?ttbkey=" + ttbKey
                        + "&Query=" + URLEncoder.encode(keyword, "UTF-8")
                        + "&QueryType=Keyword"
                        + "&MaxResults=10"
                        + "&start=1"
                        + "&SearchTarget=Book"
                        + "&output=js"
                        + "&Version=20131101";
            } else if ("100".equals(genre)) {
                // 국내도서: SearchTarget=Book, CategoryId 생략
                url = aladinApiUrl
                        + "?ttbkey=" + ttbKey
                        + "&Query=" + URLEncoder.encode(categoryKeywordMap.get("100"), "UTF-8")
                        + "&QueryType=Keyword"
                        + "&MaxResults=10"
                        + "&start=1"
                        + "&SearchTarget=Book"
                        + "&output=js"
                        + "&Version=20131101";
            } else if ("200".equals(genre)) {
                // 외국도서: SearchTarget=Foreign, CategoryId 생략
                url = aladinApiUrl
                        + "?ttbkey=" + ttbKey
                        + "&Query=" + URLEncoder.encode(categoryKeywordMap.get("200"), "UTF-8")
                        + "&QueryType=Keyword"
                        + "&MaxResults=10"
                        + "&start=1"
                        + "&SearchTarget=Foreign"
                        + "&output=js"
                        + "&Version=20131101";
            } else {
                // 나머지 장르: CategoryId와 매핑된 검색어 사용
                url = aladinApiUrl
                        + "?ttbkey=" + ttbKey
                        + "&Query=" + URLEncoder.encode(keyword, "UTF-8")
                        + "&QueryType=Keyword"
                        + "&CategoryId=" + genre
                        + "&MaxResults=10"
                        + "&start=1"
                        + "&SearchTarget=Book"
                        + "&output=js"
                        + "&Version=20131101";
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            return new RecommendedBook("추천할 책이 없습니다.", "", "", "", genre);
        }

        // 첫 번째 시도: 검색
        resultBook = fetchRecommendedBook(url, genre);
        // 특정 장르에서 결과가 없으면 CategoryId 없이 키워드만으로 재검색
        if (resultBook.getTitle().equals("추천할 책이 없습니다.") &&
                !(genre == null || genre.trim().isEmpty() || "0".equals(genre) ||
                        "100".equals(genre) || "200".equals(genre))) {
            try {
                url = aladinApiUrl
                        + "?ttbkey=" + ttbKey
                        + "&Query=" + URLEncoder.encode(keyword, "UTF-8")
                        + "&QueryType=Keyword"
                        + "&MaxResults=10"
                        + "&start=1"
                        + "&SearchTarget=Book"
                        + "&output=js"
                        + "&Version=20131101";
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
                return new RecommendedBook("추천할 책이 없습니다.", "", "", "", genre);
            }
            resultBook = fetchRecommendedBook(url, genre);
        }
        return resultBook;
    }

    private RecommendedBook fetchRecommendedBook(String url, String genre) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Object itemObj = response.getBody().get("item");
            List<Map<String, Object>> items;
            if (itemObj instanceof List) {
                items = (List<Map<String, Object>>) itemObj;
            } else if (itemObj instanceof Map) {
                items = new ArrayList<>();
                items.add((Map<String, Object>) itemObj);
            } else {
                items = new ArrayList<>();
            }
            // "문제집" 관련 항목 제외
            items = items.stream().filter(item -> {
                String title = item.get("title") != null ? item.get("title").toString() : "";
                String category = item.get("categoryName") != null ? item.get("categoryName").toString() : "";
                String searchCategory = item.get("searchCategoryName") != null ? item.get("searchCategoryName").toString() : "";
                return !title.contains("문제집") && !category.contains("문제집") && !searchCategory.contains("문제집");
            }).collect(Collectors.toList());
            if (items.isEmpty()) {
                return new RecommendedBook("추천할 책이 없습니다.", "", "", "", genre);
            }
            int randomIndex = new Random().nextInt(items.size());
            Map<String, Object> bookItem = items.get(randomIndex);
            String title = (String) bookItem.getOrDefault("title", "제목 없음");
            String author = (String) bookItem.getOrDefault("author", "저자 미상");
            String description = (String) bookItem.getOrDefault("description", "소개 없음");
            String coverUrl = (String) (bookItem.containsKey("coverLarge") ? bookItem.get("coverLarge") : bookItem.get("cover"));
            return new RecommendedBook(title, author, description, coverUrl, genre);
        } catch (Exception e) {
            e.printStackTrace();
            return new RecommendedBook("추천할 책이 없습니다.", "", "", "", genre);
        }
    }

}