package booktine.Booktine.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@EntityListeners(AuditingEntityListener.class)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;      // 책 제목

    // 기존의 author 문자열 대신 embeddable Author 객체 사용
    @Embedded
    private Author author;

    private String genre;      // 장르
    private String publisher;  // 출판사
    private String summary;    // 한줄요약

    @Lob
    private String review;     // 리뷰

    private LocalDate startDate; // 책을 펴낸 날
    private LocalDate endDate;   // 책을 닫은 날

    @LastModifiedDate
    private LocalDateTime lastModified;

    @ElementCollection
    private List<String> memos;

    public Post() {}

    // Getter/Setter
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    // Author getter/setter 추가
    public Author getAuthor() {
        return author;
    }
    public void setAuthor(Author author) {
        this.author = author;
    }

    public String getGenre() {
        return genre;
    }
    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getPublisher() {
        return publisher;
    }
    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public String getSummary() {
        return summary;
    }
    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getReview() {
        return review;
    }
    public void setReview(String review) {
        this.review = review;
    }

    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getLastModified() {
        return lastModified;
    }
    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }

    public List<String> getMemos() {
        return memos;
    }
    public void setMemos(List<String> memos) {
        this.memos = memos;
    }
}
