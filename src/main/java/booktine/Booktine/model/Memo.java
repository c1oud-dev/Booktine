package booktine.Booktine.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Memo {
    private String pageNumber;
    private String memo;

    public Memo() {}

    public Memo(String pageNumber, String memo) {
        this.pageNumber = pageNumber;
        this.memo = memo;
    }

    // Getter/Setter
    public String getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(String pageNumber) {
        this.pageNumber = pageNumber;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }
}
