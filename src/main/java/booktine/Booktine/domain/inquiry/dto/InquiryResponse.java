package booktine.Booktine.domain.inquiry.dto;

import booktine.Booktine.domain.inquiry.entity.Inquiry;

import java.time.LocalDateTime;

/**
 * 문의/제안 조회 및 생성 결과를 반환하는 응답 DTO.
 * 사용자 문의 등록 결과와 관리자 페이지의 문의 목록에서 작성자 정보와 메시지 내용을 표시할 때 사용한다.
 */
public record InquiryResponse(
        Long id,
        Long userId,
        String userEmail,
        String userNickname,
        String subject,
        String message,
        LocalDateTime createdAt
) {

    /** Inquiry 엔티티를 화면 응답에 필요한 작성자 정보가 포함된 DTO로 변환한다. */
    public static InquiryResponse from(Inquiry inquiry) {
        return new InquiryResponse(
                inquiry.getId(),
                inquiry.getUser().getId(),
                inquiry.getUser().getEmail(),
                inquiry.getUser().getNickname(),
                inquiry.getSubject(),
                inquiry.getMessage(),
                inquiry.getCreatedAt()
        );
    }
}
