package booktine.Booktine.domain.inquiry.controller;

import booktine.Booktine.domain.inquiry.dto.InquiryCreateRequest;
import booktine.Booktine.domain.inquiry.dto.InquiryResponse;
import booktine.Booktine.domain.inquiry.service.InquiryService;
import booktine.Booktine.global.response.ApiResponse;
import booktine.Booktine.global.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 사용자 문의/제안 등록 API를 제공하는 컨트롤러.
 * 로그인 사용자가 푸터의 문의/제안 폼에서 작성한 메시지를 관리자에게 전달할 때 호출된다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/inquiries")
@Tag(name = "문의", description = "사용자 문의/제안 API")
public class InquiryController {

    private final InquiryService inquiryService;

    /** 현재 로그인 사용자의 문의/제안 내용을 검증하고 저장한다. */
    @Operation(summary = "문의/제안 등록", description = "로그인 사용자가 관리자에게 전달할 문의 또는 제안을 등록합니다.")
    @PostMapping
    public ApiResponse<InquiryResponse> createInquiry(@Valid @RequestBody InquiryCreateRequest request) {
        return ApiResponse.ok(inquiryService.createInquiry(SecurityUtils.getCurrentUserId(), request));
    }
}
