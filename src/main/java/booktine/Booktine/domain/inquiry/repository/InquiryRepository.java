package booktine.Booktine.domain.inquiry.repository;

import booktine.Booktine.domain.inquiry.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Inquiry 엔티티의 영속성 처리를 담당하는 Spring Data JPA 리포지토리.
 * 사용자 문의/제안 저장과 관리자 페이지의 문의 목록 페이지 조회에서 서비스 계층이 사용한다.
 */
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
}
