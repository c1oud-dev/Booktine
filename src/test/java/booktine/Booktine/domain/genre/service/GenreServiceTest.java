package booktine.Booktine.domain.genre.service;

import booktine.Booktine.domain.genre.dto.GenreCreateRequest;
import booktine.Booktine.domain.genre.dto.GenreResponse;
import booktine.Booktine.domain.genre.entity.Genre;
import booktine.Booktine.domain.genre.repository.GenreRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * GenreService 단위 테스트.
 * 장르 선택 목록 구성과 관리자 장르 관리 규칙을 검증한다.
 */
@ExtendWith(MockitoExtension.class)
class GenreServiceTest {

    @InjectMocks
    private GenreService genreService;

    @Mock
    private GenreRepository genreRepository;

    @Test
    @DisplayName("관리 장르 목록을 이름순으로 조회한다")
    void getManagedGenres_success() {
        // given
        Genre zGenre = createGenre(1L, "철학");
        Genre aGenre = createGenre(2L, "SF");
        given(genreRepository.findAll()).willReturn(List.of(zGenre, aGenre));

        // when
        List<GenreResponse> responses = genreService.getManagedGenres();

        // then
        assertThat(responses).extracting(GenreResponse::name).containsExactly("SF", "철학");
    }

    @Test
    @DisplayName("기본 장르와 추가 장르를 합치고 기타를 마지막에 둔다")
    void getSelectableGenres_keepsEtcLast() {
        // given
        given(genreRepository.findAll()).willReturn(List.of(createGenre(1L, "철학"), createGenre(2L, "SF")));

        // when
        List<String> responses = genreService.getSelectableGenres();

        // then
        assertThat(responses).contains("소설", "철학", "SF");
        assertThat(responses.get(responses.size() - 1)).isEqualTo("기타");
    }

    @Test
    @DisplayName("장르명을 정규화한 뒤 추가한다")
    void createGenre_normalizesName() {
        // given
        Genre saved = createGenre(10L, "문학 비평");
        given(genreRepository.existsByNameIgnoreCase("문학 비평")).willReturn(false);
        given(genreRepository.save(org.mockito.ArgumentMatchers.any(Genre.class))).willReturn(saved);

        // when
        GenreResponse response = genreService.createGenre(new GenreCreateRequest("  문학   비평  "));

        // then
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.name()).isEqualTo("문학 비평");
    }

    @Test
    @DisplayName("기본 장르와 중복되면 예외 발생")
    void createGenre_duplicateDefaultGenre_throwsException() {
        // given
        given(genreRepository.existsByNameIgnoreCase("소설")).willReturn(false);

        // when // then
        assertThatThrownBy(() -> genreService.createGenre(new GenreCreateRequest("소설")))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DUPLICATE_GENRE);
    }

    @Test
    @DisplayName("존재하지 않는 장르 삭제 시 예외 발생")
    void deleteGenre_notFound_throwsException() {
        // given
        given(genreRepository.existsById(99L)).willReturn(false);

        // when // then
        assertThatThrownBy(() -> genreService.deleteGenre(99L))
                .isInstanceOf(CustomException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.GENRE_NOT_FOUND);
    }

    @Test
    @DisplayName("추가 장르 삭제 성공")
    void deleteGenre_success() {
        // given
        given(genreRepository.existsById(1L)).willReturn(true);

        // when
        genreService.deleteGenre(1L);

        // then
        verify(genreRepository).deleteById(1L);
    }

    /** 테스트용 장르 엔티티를 생성한다. */
    private Genre createGenre(Long id, String name) {
        Genre genre = new Genre(name);
        ReflectionTestUtils.setField(genre, "id", id);
        return genre;
    }
}

