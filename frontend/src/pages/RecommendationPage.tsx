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
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

const genres = ['소설', '인문', '자기계발', '경제경영', '역사', '과학', '에세이', '예술'];

export default function RecommendationPage() {
  const [selectedGenre, setSelectedGenre] = useState(genres[0]);
  const [genreResult, setGenreResult] = useState<RecommendationBook | null>(null);

  const [query, setQuery] = useState('');
  const [searchItems, setSearchItems] = useState<SearchBook[]>([]);

  const [savedItems, setSavedItems] = useState<RecommendationBook[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const loadSaved = async () => { const page = await getSavedRecommendations(0, 20); setSavedItems(page.content); };
  useEffect(() => { loadSaved(); }, []);

  const onRecommendByGenre = async () => { 
    setLoading(true); setMessage(''); 
    try { 
      setGenreResult(await getRecommendationByGenre(selectedGenre)); 
    } catch { 
      setMessage('장르 추천을 불러오지 못했습니다.'); 
    } finally { 
      setLoading(false);
    } 
  };
  const onSearch = async (e: FormEvent) => { 
    e.preventDefault(); 
    if (!query.trim()) 
      return; 
    setLoading(true); setMessage(''); 
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
        description: book.description, isbn: 'isbn' in book ? book.isbn : book.isbn13, 
      }); 
      await loadSaved(); 
      setMessage('추천 도서를 저장했습니다.'); 
    } catch { 
      setMessage('저장에 실패했습니다.'); 
    } 
  };

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-semibold">도서 추천</h2>
      {message && <p className="rounded-lg bg-secondary/60 px-3 py-2 text-sm">{message}</p>}
      <article className="rounded-2xl border bg-card p-6 shadow-soft">
        <h3 className="text-xl font-semibold">장르별 추천</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="rounded-lg border bg-background px-3 py-2" 
            value={selectedGenre} onChange={(e) => 
            setSelectedGenre(e.target.value)}>{genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}</select>
          <button type="button" onClick={onRecommendByGenre}>추천 받기</button>
        </div>
        {genreResult && <div className="mt-4 rounded-xl border bg-background/70 p-4">
        <p className="font-medium">{genreResult.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{genreResult.author} · {genreResult.publisher}</p>
        <button className="mt-3" type="button" onClick={() => onSave(genreResult)}>저장</button>
        </div>
      }
      </article>

      <article className="rounded-2xl border bg-card p-6 shadow-soft">
        <h3 className="text-xl font-semibold">도서 검색</h3>
        <form className="mt-3 flex gap-2" onSubmit={onSearch}><input className="flex-1 rounded-lg border bg-background px-3 py-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="책 제목 또는 저자" /><button type="submit">검색</button></form>
        {searchItems.length === 0 ? <div className="mt-4"><EmptyState title="검색 결과가 없어요" description="검색어를 입력해 새로운 책을 찾아보세요." /></div> : <ul className="mt-4 grid gap-3 sm:grid-cols-2">{searchItems.map((item) => <li key={item.isbn13} className="rounded-xl border bg-background/70 p-4"><p className="line-clamp-1 font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.author}</p><button className="mt-3" type="button" onClick={() => onSave(item)}>저장</button></li>)}</ul>}
      </article>

      <article className="rounded-2xl border bg-card p-6 shadow-soft">
        <h3 className="text-xl font-semibold">저장한 추천 도서</h3>
        {savedItems.length === 0 ? <div className="mt-4"><EmptyState title="저장된 추천이 없어요" description="마음에 드는 추천 도서를 저장해 보세요." /></div> : <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{savedItems.map((item) => <li key={item.id} className="rounded-xl border bg-background/70 p-4"><p className="line-clamp-1 font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.author}</p><button className="mt-3 border bg-card text-foreground" type="button" onClick={async () => { await deleteRecommendation(item.id); await loadSaved(); }}>삭제</button></li>)}</ul>}
      </article>
      {loading && <Spinner />}
    </section>
  );
}
