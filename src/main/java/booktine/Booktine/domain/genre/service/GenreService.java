package booktine.Booktine.domain.genre.service;

import booktine.Booktine.domain.genre.dto.GenreCreateRequest;
import booktine.Booktine.domain.genre.dto.GenreResponse;
import booktine.Booktine.domain.genre.entity.Genre;
import booktine.Booktine.domain.genre.repository.GenreRepository;
import booktine.Booktine.global.exception.CustomException;
import booktine.Booktine.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * 장르 도메인의 조회/관리 비즈니스 로직을 처리하는 서비스.
 * 독서 노트 장르 드롭다운용 선택 목록을 구성하고 관리자 페이지의 장르 조회/추가/삭제 요청을 처리한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GenreService {

    /** 별도 DB 등록 없이 항상 제공되는 독서 노트 기본 장르 목록이다. */
    public static final List<String> DEFAULT_GENRES = List.of(
            "소설", "에세이", "인문", "사회", "역사", "경제/경영", "자기계발", "과학", "기술/IT", "예술", "시", "종교", "여행", "만화", "기타"
    );

    private final GenreRepository genreRepository;

    /** 관리자 페이지에서 관리자가 직접 추가한 장르 목록을 이름순으로 조회한다. */
    public List<GenreResponse> getManagedGenres() {
        return genreRepository.findAll().stream()
                .sorted(Comparator.comparing(Genre::getName, String.CASE_INSENSITIVE_ORDER))
                .map(GenreResponse::from)
                .toList();
    }

    /** 기본 장르와 관리자 추가 장르를 합쳐 독서 노트 드롭다운에 표시할 선택 목록을 생성한다. */
    public List<String> getSelectableGenres() {
        LinkedHashSet<String> names = new LinkedHashSet<>(DEFAULT_GENRES);
        genreRepository.findAll().stream()
                .map(Genre::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .forEach(names::add);
        names.remove("기타");
        names.add("기타");
        return List.copyOf(names);
    }

    /** 관리자 요청의 장르명을 정규화하고 기본/추가 장르 중복을 검증한 뒤 새 장르를 저장한다. */
    @Transactional
    public GenreResponse createGenre(GenreCreateRequest request) {
        String normalizedName = normalize(request.name());
        if (genreRepository.existsByNameIgnoreCase(normalizedName) || DEFAULT_GENRES.stream().anyMatch(normalizedName::equalsIgnoreCase)) {
            throw new CustomException(ErrorCode.DUPLICATE_GENRE);
        }
        return GenreResponse.from(genreRepository.save(new Genre(normalizedName)));
    }

    /** 관리자 페이지에서 지정한 추가 장르 ID가 존재하는지 확인한 뒤 삭제한다. */
    @Transactional
    public void deleteGenre(Long id) {
        if (!genreRepository.existsById(id)) {
            throw new CustomException(ErrorCode.GENRE_NOT_FOUND);
        }
        genreRepository.deleteById(id);
    }

    /** 장르명 앞뒤 공백을 제거하고 연속 공백을 한 칸으로 정리한다. */
    private String normalize(String name) {
        return name.trim().replaceAll("\\s+", " ");
    }
}

