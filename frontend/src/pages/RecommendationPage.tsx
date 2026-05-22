import { FormEvent, type ReactNode, useEffect, useState } from 'react';
import { BookmarkPlus, LibraryBig, Search, Sparkles, Trash2 } from 'lucide-react';
import {
  deleteRecommendation,
  getRecommendationsByGenre,
  getSavedRecommendations,
  getBestsellers,
  saveRecommendation,
  searchRecommendationBooks,
  type RecommendationBook,
  type SearchBook,
} from '../api/recommendationApi';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

const genres = ['소설', '인문', '자기계발', '경제경영', '역사', '과학', '에세이', '예술'];
const SAVED_RECOMMENDATION_PAGE_SIZE = 20;
const SEARCH_RESULT_PAGE_SIZE = 10;
const BESTSELLER_PREVIEW_SIZE = 6;

export default function RecommendationPage() {
  const [selectedGenre, setSelectedGenre] = useState(genres[0]);
  const [genreResults, setGenreResults] = useState<RecommendationBook[]>([]);
  const [query, setQuery] = useState('');
  const [searchItems, setSearchItems] = useState<SearchBook[]>([]);
  const [bestsellerItems, setBestsellerItems] = useState<SearchBook[]>([]);
  const [savedItems, setSavedItems] = useState<RecommendationBook[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'genre' | 'saved' | 'search'>('genre');
  const [savedFeedbackKey, setSavedFeedbackKey] = useState('');
  const loadSaved = async () => {
    const page = await getSavedRecommendations(0, SAVED_RECOMMENDATION_PAGE_SIZE);
    setSavedItems(page.content);
  };

  const loadBestsellers = async () => {
    const page = await getBestsellers(0, BESTSELLER_PREVIEW_SIZE);
    setBestsellerItems(page.content);
  };

  useEffect(() => {
    void loadSaved();
    void loadBestsellers();
  }, []);

  const onRecommendByGenre = async () => {
    setLoading(true);
    setMessage('');
    try {
      setGenreResults(await getRecommendationsByGenre(selectedGenre, 6));
    } catch {
      setGenreResults([]);
      setMessage('장르 추천을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    } 
  };

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setHasSearched(false);
      setSearchItems([]);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const page = await searchRecommendationBooks(query.trim(), 0, SEARCH_RESULT_PAGE_SIZE);
      setSearchItems(page.content);
      setHasSearched(true);
    } catch {
      setHasSearched(true);
      setMessage('도서 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (book: RecommendationBook | SearchBook) => {
    setMessage('');
    try {
      const savedRecommendation = await saveRecommendation({
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        coverImageUrl: 'coverImageUrl' in book ? book.coverImageUrl : book.cover,
        genre: 'genre' in book ? book.genre : book.categoryName,
        description: book.description,
        isbn: 'isbn' in book ? book.isbn : book.isbn13,
      });
      setSavedItems((current) => [savedRecommendation, ...current.filter((item) => item.id !== savedRecommendation.id)]);
      setMessage('저장되었습니다 ✓');
      setSavedFeedbackKey(book.title);
    } catch {
      setMessage('저장에 실패했습니다.');
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-card lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Recommendation lab
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-4xl">
            도서 추천
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            장르 추천과 도서 검색을 통해 다음 책 후보를 발견하고, 마음에 드는 책은 추천 리스트에 저장하세요.
          </p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-sm font-bold text-secondary-foreground">
          <LibraryBig className="h-5 w-5" aria-hidden="true" />
          저장 {savedItems.length}권
        </div>
      </div>

      {message ? (
        <p className="rounded-[1.25rem] border border-border bg-secondary/70 px-4 py-3 text-sm font-bold text-secondary-foreground">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {[{ key: 'genre', label: '장르별 추천' }, { key: 'saved', label: '저장한 도서' }, { key: 'search', label: '도서 검색' }].map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key as 'genre' | 'saved' | 'search')} className={`rounded-full px-4 py-2 text-sm font-bold ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'saved' ? (
      <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Saved shelf
            </p>
            <h2 className="mt-2 text-3xl font-black text-foreground">저장한 추천 도서</h2>
          </div>
          {loading ? <Spinner label="처리 중..." /> : null}
        </div>
        {savedItems.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="저장된 추천이 없어요" description="마음에 드는 추천 도서를 저장해 나만의 후보 리스트를 만들어 보세요." />
          </div>
        ) : (
          <ul className="mt-6 flex gap-4 overflow-x-auto pb-2">
            {savedItems.map((item) => (
              <li key={item.id} className="h-full min-w-[16rem] max-w-[16rem] shrink-0">
                <BookRecommendationCard
                  title={item.title}
                  author={item.author}
                  publisher={item.publisher}
                  genre={item.genre}
                  description={item.description}
                  coverImageUrl={item.coverImageUrl}
                  actionLabel="삭제"
                  actionIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                  secondaryAction
                  onAction={async () => {
                    await deleteRecommendation(item.id);
                    setSavedItems((current) => current.filter((savedItem) => savedItem.id !== item.id));
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </article>
      ) : null}

      {activeTab === 'genre' ? (
      <article className="min-w-0 overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-muted-foreground">By genre</p>
              <h2 className="text-2xl font-black text-foreground">장르별 추천</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              aria-label="추천 장르"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onRecommendByGenre}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              추천 받기
            </button>
          </div>

          {genreResults.length > 0 ? (
            <ul className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {genreResults.map((item) => (
                <li key={item.isbn || `${item.title}-${item.author}`} className="h-full min-w-[16rem] max-w-[16rem] shrink-0">
                  <BookRecommendationCard
                    title={item.title}
                    author={item.author}
                    publisher={item.publisher}
                    genre={item.genre}
                    description={item.description}
                    coverImageUrl={item.coverImageUrl}
                    actionLabel={savedFeedbackKey === item.title ? '저장됨' : '저장'}
                    actionIcon={<BookmarkPlus className="h-4 w-4" aria-hidden="true" />}
                    onAction={() => onSave(item)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="장르를 선택해 보세요"
                description="관심 있는 장르를 고르면 최대 6권의 추천 도서를 보여드려요."
              />
            </div>
          )}
        </article>
      ) : null}

      {activeTab === 'search' ? (
        <article className="min-w-0 overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-muted-foreground">Search books</p>
              <h2 className="text-2xl font-black text-foreground">도서 검색</h2>
            </div>
          </div>

          <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={onSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="책 제목 또는 저자"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              검색
            </button>
          </form>

          {!hasSearched ? (
            bestsellerItems.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="베스트셀러를 준비 중이에요"
                  description="검색어를 입력하면 원하는 책도 바로 찾아볼 수 있어요."
                />
              </div>
            ) : (
              <div className="mt-6">
                <h3 className="text-lg font-black text-foreground">지금 인기 있는 책</h3>
                <ul className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {bestsellerItems.map((item) => (
                    <li key={item.isbn13 || `${item.title}-${item.author}`} className="h-full min-w-[16rem] max-w-[16rem] shrink-0">
                      <BookRecommendationCard
                        title={item.title}
                        author={item.author}
                        publisher={item.publisher}
                        genre={item.categoryName}
                        description={item.description}
                        coverImageUrl={item.cover}
                        actionLabel={savedFeedbackKey === item.title ? '저장됨' : '저장'}
                        actionIcon={<BookmarkPlus className="h-4 w-4" aria-hidden="true" />}
                        onAction={() => onSave(item)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : searchItems.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="검색 결과가 없어요"
                description="다른 검색어로 다시 찾아보세요."
              />
            </div>
          ) : (
            <ul className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {searchItems.map((item) => (
                <li key={item.isbn13} className="h-full min-w-[16rem] max-w-[16rem] shrink-0">
                  <BookRecommendationCard
                    title={item.title}
                    author={item.author}
                    publisher={item.publisher}
                    genre={item.categoryName}
                    description={item.description}
                    coverImageUrl={item.cover}
                    actionLabel={savedFeedbackKey === item.title ? '저장됨' : '저장'}
                    actionIcon={<BookmarkPlus className="h-4 w-4" aria-hidden="true" />}
                    onAction={() => onSave(item)}
                  />
                </li>
              ))}
            </ul>
          )}
        </article>
      ) : null}
    </section>
  );
}

interface BookRecommendationCardProps {
  title: string;
  author: string;
  publisher: string;
  genre: string;
  description?: string;
  coverImageUrl?: string;
  actionLabel: string;
  actionIcon: ReactNode;
  className?: string;
  secondaryAction?: boolean;
  onAction: () => void | Promise<void>;
}

function BookRecommendationCard({
  title,
  author,
  publisher,
  genre,
  description,
  coverImageUrl,
  actionLabel,
  actionIcon,
  className = '',
  secondaryAction = false,
  onAction,
}: BookRecommendationCardProps) {
  return (
    <div className={`flex h-full min-w-0 max-w-full flex-col overflow-hidden rounded-[1.25rem] border border-border bg-background p-5 ${className}`}>
      <div className="mx-auto mb-4 h-56 w-36 shrink-0 overflow-hidden rounded-2xl bg-secondary shadow-soft">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={`${title} 표지`}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-black text-muted-foreground">
            표지 없음
          </div>
        )}
      </div>
      <span className="w-fit max-w-full truncate rounded-full bg-card px-3 py-1 text-xs font-black text-muted-foreground shadow-soft">
        {genre || '장르 미분류'}
      </span>
      <h3 className="mt-4 min-h-[3.5rem] line-clamp-2 break-words text-lg font-black tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 min-h-[2.5rem] line-clamp-2 break-words text-sm font-semibold text-muted-foreground">
        {author || '저자 미입력'} · {publisher || '출판사 미입력'}
      </p>
      {description ? (
        <p className="mt-4 line-clamp-3 min-h-[4.5rem] flex-1 break-words text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : (
        <div className="flex-1" />
      )}
      <button
        className={
          secondaryAction
            ? 'mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary'
            : 'mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float'
        }
        type="button"
        onClick={onAction}
      >
        {actionIcon}
        {actionLabel}
      </button>
    </div>
  );
}