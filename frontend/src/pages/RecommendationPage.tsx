import { FormEvent, useEffect, useState } from 'react';
import {
  deleteRecommendation,
  getRecommendationByGenre,
  getSavedRecommendations,
  saveRecommendation,
  searchRecommendationBooks,
  type RecommendationBook,
  type SearchBook,
} from '../api/recommendationApi';

const genres = ['소설', '인문', '자기계발', '경제경영', '역사', '과학', '에세이', '예술'];

export default function RecommendationPage() {
  const [selectedGenre, setSelectedGenre] = useState(genres[0]);
  const [genreResult, setGenreResult] = useState<RecommendationBook | null>(null);

  const [query, setQuery] = useState('');
  const [searchItems, setSearchItems] = useState<SearchBook[]>([]);

  const [savedItems, setSavedItems] = useState<RecommendationBook[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadSaved = async () => {
    const page = await getSavedRecommendations(0, 20);
    setSavedItems(page.content);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const onRecommendByGenre = async () => {
    setLoading(true);
    setMessage('');
    try {
      const item = await getRecommendationByGenre(selectedGenre);
      setGenreResult(item);
    } catch {
      setMessage('장르 추천을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setMessage('');
    try {
      const page = await searchRecommendationBooks(query.trim(), 0, 10);
      setSearchItems(page.content);
    } catch {
      setMessage('도서 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (book: RecommendationBook | SearchBook) => {
    setMessage('');
    try {
      await saveRecommendation({
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        coverImageUrl: 'coverImageUrl' in book ? book.coverImageUrl : book.cover,
        genre: 'genre' in book ? book.genre : book.categoryName,
        description: book.description,
        isbn: 'isbn' in book ? book.isbn : book.isbn13,
      });
      await loadSaved();
      setMessage('추천 도서를 저장했습니다.');
    } catch {
      setMessage('저장에 실패했습니다.');
    }
  };

  return (
    <section>
      <h2>Recommendation</h2>

      <h3>장르 추천</h3>
      <div>
        <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
          {genres.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
        <button type="button" onClick={onRecommendByGenre}>추천 받기</button>
      </div>
      {genreResult && (
        <article>
          <strong>{genreResult.title}</strong> - {genreResult.author}
          <div>
            <button type="button" onClick={() => onSave(genreResult)}>저장</button>
          </div>
        </article>
      )}

      <h3>도서 검색</h3>
      <form className="auth-form" onSubmit={onSearch}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="검색어 입력" />
        <button type="submit">검색</button>
      </form>
      <ul>
        {searchItems.map((item) => (
          <li key={item.isbn13}>
            <strong>{item.title}</strong> - {item.author}
            <button type="button" onClick={() => onSave(item)}>저장</button>
          </li>
        ))}
      </ul>

      <h3>저장한 추천 도서</h3>
      <ul>
        {savedItems.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong> - {item.author}
            <button
              type="button"
              onClick={async () => {
                await deleteRecommendation(item.id);
                await loadSaved();
              }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>

      {loading && <p>불러오는 중...</p>}
      {message && <p>{message}</p>}
    </section>
  );
}
