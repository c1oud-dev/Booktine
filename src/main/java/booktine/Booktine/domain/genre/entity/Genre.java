package booktine.Booktine.domain.genre.entity;

import booktine.Booktine.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 관리자가 추가한 장르 정보를 저장하는 JPA 엔티티.
 * 기본 하드코딩 장르 외에 독서 노트 장르 드롭다운과 관리자 장르 관리 화면에서 사용할 추가 장르를 영속화한다.
 */
@Getter
@Entity
@Table(name = "genres", uniqueConstraints = {
        @UniqueConstraint(name = "uk_genres_name", columnNames = "name")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Genre extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    /** 관리자 장르 추가 요청에서 정규화된 장르명으로 새 Genre 엔티티를 생성한다. */
    public Genre(String name) {
        this.name = name;
    }
}

