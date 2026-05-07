package booktine.Booktine.domain.genre.dto;

import booktine.Booktine.domain.genre.entity.Genre;

/**
 * 관리자 장르 조회/생성 결과를 반환하는 응답 DTO.
 * 관리자 페이지에서 장르 목록을 표시하고 삭제 대상 ID를 식별할 때 사용한다.
 */
public record GenreResponse(Long id, String name) {

    /** Genre 엔티티를 관리자 화면용 응답 DTO로 변환한다. */
    public static GenreResponse from(Genre genre) {
        return new GenreResponse(genre.getId(), genre.getName());
    }
}
