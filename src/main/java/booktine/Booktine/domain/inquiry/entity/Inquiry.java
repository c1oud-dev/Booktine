package booktine.Booktine.domain.inquiry.entity;

import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자가 관리자에게 전달한 문의/제안 메시지를 저장하는 JPA 엔티티.
 * 푸터 문의 폼에서 등록된 내용을 사용자와 연결해 보관하고 관리자 페이지의 문의 목록 조회에 사용한다.
 */
@Getter
@Entity
@Table(name = "inquiries", indexes = {
        @Index(name = "idx_inquiries_created", columnList = "created_at"),
        @Index(name = "idx_inquiries_user_id", columnList = "user_id")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inquiry extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    /** 문의/제안 등록 요청의 제목, 내용과 현재 로그인 사용자를 연결해 새 Inquiry 엔티티를 생성한다. */
    @Builder
    public Inquiry(String subject, String message, User user) {
        this.subject = subject;
        this.message = message;
        this.user = user;
    }
}
