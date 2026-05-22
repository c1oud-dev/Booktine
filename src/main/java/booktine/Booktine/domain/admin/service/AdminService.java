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
import booktine.Booktine.domain.post.repository.PostRepository;
import booktine.Booktine.domain.reminder.repository.ReminderRepository;
import booktine.Booktine.domain.user.dto.UserResponse;
import booktine.Booktine.domain.user.entity.User;
import booktine.Booktine.domain.user.repository.UserRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 관리자 전용 비즈니스 로직을 처리하는 서비스.
 * 관리자 화면의 목록 조회, 관리 작업, 통계/리마인더 집계 데이터를 제공할 때 사용된다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final GenreService genreService;
    private final InquiryService inquiryService;
    private final CommunityPostRepository communityPostRepository;
    private final ReminderRepository reminderRepository;

    /** 전체 사용자 목록을 페이지 단위로 조회한다. */
    public Page<UserResponse> getUserPage(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    /** 전체 게시물 목록을 페이지 단위로 조회한다. */
    public Page<PostResponse> getPostPage(Pageable pageable) {
        return postRepository.findAll(pageable).map(PostResponse::from);
    }

    /** 관리 장르 목록을 조회한다. */
    public List<GenreResponse> getGenres() {
        return genreService.getManagedGenres();
    }

    /** 관리 장르를 생성한다. */
    @Transactional
    public GenreResponse createGenre(GenreCreateRequest request) {
        return genreService.createGenre(request);
    }

    /** 문의/제안 목록을 페이지 단위로 조회한다. */
    @Transactional
    public void deleteGenre(Long id) {
        genreService.deleteGenre(id);
    }

    public Page<InquiryResponse> getInquiryPage(Pageable pageable) {
        return inquiryService.getInquiryPage(pageable);
    }

    /** 관리자 권한으로 커뮤니티 게시글을 삭제한다. */
    @Transactional
    public void deleteCommunityPost(Long id) {
        if (!communityPostRepository.existsById(id)) {
            throw new CustomException(ErrorCode.COMMUNITY_POST_NOT_FOUND);
        }
        communityPostRepository.deleteById(id);
    }

    /** 관리자 권한으로 사용자 권한을 변경한다. */
    @Transactional
    public UserResponse updateUserRole(Long id, AdminUserRoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.updateRole(request.role());
        return UserResponse.from(user);
    }

    /** 관리자 권한으로 사용자 계정 정지 상태를 변경한다. */
    @Transactional
    public UserResponse updateUserStatus(Long id, AdminUserStatusUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.updateSuspended(request.suspended());
        return UserResponse.from(user);
    }

    /** 관리자 대시보드 통계 데이터를 계산해 반환한다. */
    public AdminStatsResponse getStats() {
        LocalDateTime start = LocalDateTime.now()
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        long totalUsers = userRepository.count();
        long monthlyUsers = userRepository.countByCreatedAtAfter(start);
        long totalPosts = postRepository.count();
        long monthlyPosts = postRepository.countByCreatedAtAfter(start);
        long activeUsers = userRepository.countBySuspendedFalse();

        return AdminStatsResponse.from(
                totalUsers,
                monthlyUsers,
                totalPosts,
                monthlyPosts,
                activeUsers
        );
    }

    /** 관리자 리마인더 현황 목록을 조회한다. */
    public List<AdminReminderResponse> getReminders() {
        return reminderRepository.findAll().stream()
                .map(AdminReminderResponse::from)
                .toList();
    }
}

