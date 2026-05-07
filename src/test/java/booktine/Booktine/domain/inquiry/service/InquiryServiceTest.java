package booktine.Booktine.domain.inquiry.service;

import booktine.Booktine.domain.inquiry.dto.InquiryCreateRequest;
import booktine.Booktine.domain.inquiry.dto.InquiryResponse;
import booktine.Booktine.domain.inquiry.entity.Inquiry;
import booktine.Booktine.domain.inquiry.repository.InquiryRepository;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * InquiryService 단위 테스트.
 * 문의/제안 등록과 관리자 조회 페이징을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class InquiryServiceTest {

    @InjectMocks
    private InquiryService inquiryService;

    @Mock
    private InquiryRepository inquiryRepository;

    @Mock
    private UserRepository userRepository;

    @Test
    @DisplayName("문의 등록 시 제목과 내용을 trim 처리한다")
    void createInquiry_trimsSubjectAndMessage() {
        // given
        User user = createUser(1L);
        Inquiry saved = createInquiry(10L, user, "제목", "내용");
        given(userRepository.getReferenceById(1L)).willReturn(user);
        given(inquiryRepository.save(any(Inquiry.class))).willReturn(saved);

        // when
        InquiryResponse response = inquiryService.createInquiry(1L, new InquiryCreateRequest("  제목  ", "  내용  "));

        // then
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.subject()).isEqualTo("제목");
        assertThat(response.message()).isEqualTo("내용");
        ArgumentCaptor<Inquiry> captor = ArgumentCaptor.forClass(Inquiry.class);
        verify(inquiryRepository).save(captor.capture());
        assertThat(captor.getValue().getSubject()).isEqualTo("제목");
        assertThat(captor.getValue().getMessage()).isEqualTo("내용");
    }

    @Test
    @DisplayName("문의 목록을 페이지로 조회한다")
    void getInquiryPage_success() {
        // given
        User user = createUser(1L);
        Inquiry inquiry = createInquiry(11L, user, "문의", "내용");
        PageRequest pageable = PageRequest.of(0, 10);
        given(inquiryRepository.findAll(pageable)).willReturn(new PageImpl<>(List.of(inquiry), pageable, 1));

        // when
        Page<InquiryResponse> page = inquiryService.getInquiryPage(pageable);

        // then
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).subject()).isEqualTo("문의");
    }

    /** 테스트용 사용자 엔티티를 생성한다. */
    private User createUser(Long id) {
        User user = User.builder().email("user@test.com").password("pw").nickname("nick").build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    /** 테스트용 문의 엔티티를 생성한다. */
    private Inquiry createInquiry(Long id, User user, String subject, String message) {
        Inquiry inquiry = Inquiry.builder().user(user).subject(subject).message(message).build();
        ReflectionTestUtils.setField(inquiry, "id", id);
        return inquiry;
    }
}

