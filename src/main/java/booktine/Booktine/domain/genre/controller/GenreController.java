package booktine.Booktine.domain.genre.controller;

import booktine.Booktine.domain.genre.service.GenreService;
import booktine.Booktine.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 장르 목록 조회 API를 제공하는 컨트롤러.
 * 독서 노트 작성/수정 화면에서 장르 드롭다운을 렌더링할 때 기본 장르와 관리자 추가 장르를 함께 전달한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/genres")
@Tag(name = "장르", description = "장르 목록 API")
public class GenreController {

    private final GenreService genreService;

    /** 기본 장르와 관리자 추가 장르가 합쳐진 선택 가능 장르 목록을 조회한다. */
    @Operation(summary = "선택 가능한 장르 목록 조회", description = "기본 장르와 관리자가 추가한 장르를 함께 조회합니다.")
    @GetMapping
    public ApiResponse<List<String>> getGenres() {
        return ApiResponse.ok(genreService.getSelectableGenres());
    }
}

