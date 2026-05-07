package booktine.Booktine.domain.inquiry.service;

import booktine.Booktine.domain.inquiry.dto.InquiryCreateRequest;
import booktine.Booktine.domain.inquiry.dto.InquiryResponse;
import booktine.Booktine.domain.inquiry.entity.Inquiry;
import booktine.Booktine.domain.inquiry.repository.InquiryRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 문의/제안 도메인의 등록 및 조회 비즈니스 로직을 처리하는 서비스.
 * 사용자 문의 폼의 메시지를 저장하고 관리자 페이지에서 문의 목록을 페이지 단위로 제공한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    /** 현재 사용자 ID와 문의/제안 요청 내용을 바탕으로 Inquiry 엔티티를 생성하고 저장한다. */
    @Transactional
    public InquiryResponse createInquiry(Long userId, InquiryCreateRequest request) {
        User user = userRepository.getReferenceById(userId);
        Inquiry inquiry = Inquiry.builder()
                .subject(request.subject().trim())
                .message(request.message().trim())
                .user(user)
                .build();
        return InquiryResponse.from(inquiryRepository.save(inquiry));
    }

    /** 관리자 페이지에서 확인할 전체 문의/제안 목록을 페이징 조건에 맞춰 조회한다. */
    public Page<InquiryResponse> getInquiryPage(Pageable pageable) {
        return inquiryRepository.findAll(pageable).map(InquiryResponse::from);
    }
}

