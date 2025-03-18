package booktine.Booktine.controller.dto;

public class RecommendedBook {
    private String title;
    private String author;
    private String summary;
    private String coverUrl;
    private String genre;

    public RecommendedBook() {
    }

    public RecommendedBook(String title, String author, String summary, String coverUrl, String genre) {
        this.title = title;
        this.author = author;
        this.summary = summary;
        this.coverUrl = coverUrl;
        this.genre = genre;
    }

    // Getter / Setter
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
}
