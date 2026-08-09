package booktine.Booktine.domain.admin.service;

import booktine.Booktine.domain.admin.dto.AdminReminderResponse;
import booktine.Booktine.domain.admin.dto.AdminStatsResponse;
import booktine.Booktine.domain.admin.dto.AdminUserRoleUpdateRequest;
import booktine.Booktine.domain.admin.dto.AdminUserStatusUpdateRequest;
import booktine.Booktine.domain.community.repository.CommunityPostRepository;
import booktine.Booktine.domain.genre.dto.GenreCreateRequest;
import booktine.Booktine.domain.genre.dto.GenreResponse;
import booktine.Booktine.domain.genre.service.GenreService;
import booktine.Booktine.domain.inquiry.dto.InquiryResponse;
import booktine.Booktine.domain.inquiry.service.InquiryService;
import booktine.Booktine.domain.post.dto.PostResponse;
import booktine.Booktine.domain.post.entity.Post;
import booktine.Booktine.domain.post.entity.ReadingStatus;
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.reminder.entity.Reminder;
import booktine.Booktine.domain.reminder.repository.ReminderRepository;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.entity.UserRole;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;

/**
 * AdminService의 관리자 조회 기능을 검증하는 단위 테스트.
 * 사용자/게시물 페이지 조회 시 DTO 매핑 결과를 확인하기 위해 사용한다.
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @InjectMocks
    private AdminService adminService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private GenreService genreService;

    @Mock
    private InquiryService inquiryService;

    @Mock
    private CommunityPostRepository communityPostRepository;

    @Mock
    private ReminderRepository reminderRepository;

    /**
     * 사용자 페이지 조회 시 UserResponse로 정상 변환되는지 검증한다.
     */
    @Test
    @DisplayName("관리자 사용자 목록 조회 성공")
    void getUserPage_success() {
        // given
        User user = createUser(1L);
        PageRequest pageable = PageRequest.of(0, 10);
        given(userRepository.findAll(pageable)).willReturn(new PageImpl<>(List.of(user)));

        // when
        Page<UserResponse> result = adminService.getUserPage(pageable);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).id()).isEqualTo(1L);
    }

    /**
     * 게시물 페이지 조회 시 PostResponse로 정상 변환되는지 검증한다.
     */
    @Test
    @DisplayName("관리자 게시물 목록 조회 성공")
    void getPostPage_success() {
        // given
        User user = createUser(1L);
        Post post = createPost(2L, user);
        PageRequest pageable = PageRequest.of(0, 10);
        given(postRepository.findAll(pageable)).willReturn(new PageImpl<>(List.of(post)));

        // when
        Page<PostResponse> result = adminService.getPostPage(pageable);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).id()).isEqualTo(2L);
    }

    @Test
    @DisplayName("관리 장르 목록 조회 성공")
    void getGenres_success() {
        // given
        List<GenreResponse> genres = List.of(new GenreResponse(1L, "소설"));
        given(genreService.getManagedGenres()).willReturn(genres);

        // when
        List<GenreResponse> result = adminService.getGenres();

        // then
        assertThat(result).isEqualTo(genres);
    }

    @Test
    @DisplayName("관리 장르 생성 성공")
    void createGenre_success() {
        // given
        GenreCreateRequest request = new GenreCreateRequest("에세이");
        GenreResponse response = new GenreResponse(1L, "에세이");
        given(genreService.createGenre(request)).willReturn(response);

        // when
        GenreResponse result = adminService.createGenre(request);

        // then
        assertThat(result).isEqualTo(response);
    }

    @Test
    @DisplayName("관리 장르 삭제 성공")
    void deleteGenre_success() {
        // given
        Long genreId = 1L;

        // when
        adminService.deleteGenre(genreId);

        // then
        then(genreService).should().deleteGenre(genreId);
    }

    @Test
    @DisplayName("문의 목록 조회 성공")
    void getInquiryPage_success() {
        // given
        PageRequest pageable = PageRequest.of(0, 10);
        InquiryResponse inquiry = new InquiryResponse(
                1L,
                2L,
                "u@test.com",
                "tester",
                "문의 제목",
                "문의 내용",
                LocalDateTime.of(2026, 1, 1, 10, 0)
        );
        Page<InquiryResponse> inquiryPage = new PageImpl<>(List.of(inquiry));
        given(inquiryService.getInquiryPage(pageable)).willReturn(inquiryPage);

        // when
        Page<InquiryResponse> result = adminService.getInquiryPage(pageable);

        // then
        assertThat(result).isEqualTo(inquiryPage);
    }

    @Test
    @DisplayName("커뮤니티 게시글 삭제 성공")
    void deleteCommunityPost_success() {
        // given
        Long postId = 1L;
        given(communityPostRepository.existsById(postId)).willReturn(true);

        // when
        adminService.deleteCommunityPost(postId);

        // then
        then(communityPostRepository).should().deleteById(postId);
    }

    @Test
    @DisplayName("존재하지 않는 커뮤니티 게시글 삭제 실패")
    void deleteCommunityPost_fail_notFound() {
        // given
        Long postId = 1L;
        given(communityPostRepository.existsById(postId)).willReturn(false);

        // when & then
        assertThatThrownBy(() -> adminService.deleteCommunityPost(postId))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue(
                        "errorCode",
                        ErrorCode.COMMUNITY_POST_NOT_FOUND
                );
        then(communityPostRepository).should(never()).deleteById(postId);
    }

    @Test
    @DisplayName("사용자 권한 변경 성공")
    void updateUserRole_success() {
        // given
        User user = createUser(1L);
        AdminUserRoleUpdateRequest request = new AdminUserRoleUpdateRequest(
                UserRole.ROLE_ADMIN
        );
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        // when
        UserResponse result = adminService.updateUserRole(1L, request);

        // then
        assertThat(result.role()).isEqualTo(UserRole.ROLE_ADMIN);
    }

    @Test
    @DisplayName("존재하지 않는 사용자 권한 변경 실패")
    void updateUserRole_fail_userNotFound() {
        // given
        AdminUserRoleUpdateRequest request = new AdminUserRoleUpdateRequest(
                UserRole.ROLE_ADMIN
        );
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> adminService.updateUserRole(1L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("사용자 계정 상태 변경 성공")
    void updateUserStatus_success() {
        // given
        User user = createUser(1L);
        AdminUserStatusUpdateRequest request = new AdminUserStatusUpdateRequest(true);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        // when
        UserResponse result = adminService.updateUserStatus(1L, request);

        // then
        assertThat(result.id()).isEqualTo(1L);
        assertThat(user.isSuspended()).isTrue();
    }

    @Test
    @DisplayName("존재하지 않는 사용자 계정 상태 변경 실패")
    void updateUserStatus_fail_userNotFound() {
        // given
        AdminUserStatusUpdateRequest request = new AdminUserStatusUpdateRequest(true);
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> adminService.updateUserStatus(1L, request))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("관리자 대시보드 통계 조회 성공")
    void getStats_success() {
        // given
        given(userRepository.count()).willReturn(10L);
        given(userRepository.countByCreatedAtAfter(any(LocalDateTime.class)))
                .willReturn(3L);
        given(postRepository.count()).willReturn(20L);
        given(postRepository.countByCreatedAtAfter(any(LocalDateTime.class)))
                .willReturn(5L);
        given(userRepository.countBySuspendedFalse()).willReturn(8L);

        // when
        AdminStatsResponse result = adminService.getStats();

        // then
        assertThat(result).isEqualTo(new AdminStatsResponse(10L, 3L, 20L, 5L, 8L));
    }

    @Test
    @DisplayName("관리자 리마인더 현황 조회 성공")
    void getReminders_success() {
        // given
        Reminder reminder = Reminder.builder()
                .userId(1L)
                .reminderTime(LocalTime.of(9, 0))
                .message("독서 시간입니다")
                .build();
        ReflectionTestUtils.setField(reminder, "id", 2L);
        given(reminderRepository.findAll()).willReturn(List.of(reminder));

        // when
        List<AdminReminderResponse> result = adminService.getReminders();

        // then
        assertThat(result).containsExactly(new AdminReminderResponse(
                2L,
                1L,
                LocalTime.of(9, 0),
                "독서 시간입니다"
        ));
    }

    /**
     * 테스트용 사용자 엔티티를 생성한다.
     */
    private User createUser(Long id) {
        User user = User.builder()
                .email("u@test.com")
                .nickname("tester")
                .password("pw")
                .build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    /**
     * 테스트용 게시물 엔티티를 생성한다.
     */
    private Post createPost(Long id, User user) {
        Post post = Post.builder()
                .title("책 제목")
                .author("저자")
                .genre("장르")
                .publisher("출판사")
                .publishedDate(LocalDate.of(2026, 1, 1))
                .summary("요약")
                .readingStatus(ReadingStatus.READING)
                .currentPage(20)
                .totalPage(300)
                .user(user)
                .build();
        ReflectionTestUtils.setField(post, "id", id);
        return post;
    }
}