package booktine.Booktine.domain.genre.repository;

import booktine.Booktine.domain.genre.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Genre 엔티티의 영속성 처리를 담당하는 Spring Data JPA 리포지토리.
 * 장르 목록 조회, 관리자 장르 추가 시 중복 확인, 삭제 처리에서 서비스 계층이 사용한다.
 */
public interface GenreRepository extends JpaRepository<Genre, Long> {

    /** 대소문자를 구분하지 않고 동일한 장르명이 이미 존재하는지 확인한다. */
    boolean existsByNameIgnoreCase(String name);

    /** 대소문자를 구분하지 않고 장르명으로 Genre 엔티티를 조회한다. */
    Optional<Genre> findByNameIgnoreCase(String name);
}
