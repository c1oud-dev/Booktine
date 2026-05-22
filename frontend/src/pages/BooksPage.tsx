import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarCheck2, CalendarDays, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteBookNote, getBookNotes, searchBookNotes } from '@/api/bookNoteApi';
import { getGenres } from '@/api/genreApi';
import { CARD_STATUS_CLASS_NAME, READING_STATUS_OPTIONS, STATUS_LABEL } from '@/constants/readingStatus';
import type { BookNote, ReadingStatus } from '@/types/bookNote';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

const pageSize = 10;

const STATUS_FILTERS: Array<{ label: string; value: ReadingStatus | '' }> = [
  { label: '전체', value: '' },
  { label: '읽는 중', value: 'READING' },
  { label: '완독', value: 'COMPLETED' },
  { label: '중단', value: 'PAUSED' },
  { label: '읽고 싶은 책', value: 'WISHLIST' },
];

export default function BooksPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<BookNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | ''>('');
  const [genreFilter, setGenreFilter] = useState('');
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filteredItems = useMemo(
    () => items.filter((book) => (genreFilter ? (book.genre || '기타') === genreFilter : true)),
    [items, genreFilter],
  );

  const totalPageCount = Math.max(totalPages, 1);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPageCount - 1;

  const load = async (pageNumber = currentPage) => {
    setLoading(true);
    try {
      if (keyword.trim() || statusFilter) {
        const results = await searchBookNotes(keyword.trim(), statusFilter);
        setItems(results);
        setTotalPages(1);
        setTotalElements(results.length);
        return;
      }

      const page = await getBookNotes(pageNumber, pageSize);
      setItems(page.content);
      setTotalPages(page.totalPages);
      setTotalElements(page.totalElements);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    load(currentPage);
  }, [currentPage, keyword, statusFilter]);

  useEffect(() => {
    getGenres().then((genres) => setGenreOptions(genres)).catch(() => setGenreOptions([]));
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-card lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">Reading notes</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-4xl">독서 노트</h1>
        </div>
        <button 
          type="button" 
          onClick={() => navigate('/books/new')} 
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground">
            <Plus className="h-4 w-4" />새 노트 추가
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden rounded-[1.25rem] border border-border bg-card p-4 shadow-soft lg:block">
          <p className="text-sm font-black">상태별</p>
          <div className="mt-3 space-y-2">{STATUS_FILTERS.map((item) => <button key={item.label} type="button" onClick={() => { setStatusFilter(item.value); setCurrentPage(0); }} className={cn('block w-full rounded-xl px-3 py-2 text-left text-sm font-bold', statusFilter === item.value ? 'bg-secondary' : 'hover:bg-secondary')}>{item.label}</button>)}</div>
          <p className="mt-6 text-sm font-black">장르별</p>
          <div className="mt-3 space-y-2"><button type="button" onClick={() => setGenreFilter('')} className={cn('block w-full rounded-xl px-3 py-2 text-left text-sm font-bold', genreFilter === '' ? 'bg-secondary' : 'hover:bg-secondary')}>전체</button>{genreOptions.map((genre) => <button key={genre} type="button" onClick={() => setGenreFilter(genre)} className={cn('block w-full rounded-xl px-3 py-2 text-left text-sm font-bold', genreFilter === genre ? 'bg-secondary' : 'hover:bg-secondary')}>{genre}</button>)}</div>
        </aside>

        <div className="space-y-4">
          <div className="space-y-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto">
              {STATUS_FILTERS.map((item) => 
                <button key={item.label} 
                  type="button" 
                  onClick={() => setStatusFilter(item.value)} 
                  className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs font-bold">
                    {item.label}
                </button>
                )}
              </div>
            <div className="flex gap-2 overflow-x-auto">
              <button 
                type="button" 
                onClick={() => setGenreFilter('')} 
                className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs font-bold">
                  전체
                </button>
                {genreOptions.map((genre) => <button key={genre} type="button" onClick={() => setGenreFilter(genre)} className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs font-bold">{genre}</button>)}</div>
          </div>

          <input value={keyword} onChange={(e) => { setKeyword(e.target.value); setCurrentPage(0); }} placeholder="제목 또는 저자로 검색" />

          {loading ? (
            <Spinner label="독서 노트를 불러오는 중..." />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title="독서 노트가 없어요"
              description="책 기록을 추가해보세요."
            />
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((book) => (
                <li
                  key={book.id}
                  className={cn(
                    'relative flex min-h-72 flex-col rounded-[1.5rem] border p-5 shadow-soft',
                    CARD_STATUS_CLASS_NAME[book.readingStatus]
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-black">
                      {STATUS_LABEL[book.readingStatus]}
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId((id) => id === book.id ? null : book.id)}
                        className="rounded-xl p-2 hover:bg-secondary"
                      >
                        <BookOpen className="h-5 w-5" />
                      </button>
                      {openMenuId === book.id ? (
                        <div className="absolute right-0 top-10 z-10 w-28 rounded-xl border border-border bg-card p-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/books/${book.id}`)}
                            className="flex w-full items-center gap-1 rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-secondary"
                          >
                            <Pencil className="h-4 w-4" />
                            편집
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteBookNote(book.id);
                              setOpenMenuId(null);
                              await load(currentPage);
                            }}
                            className="flex w-full items-center gap-1 rounded-lg px-3 py-2 text-left text-sm font-bold text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            삭제
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/books/${book.id}`)}
                    className="mt-4 text-left"
                  >
                    <p className="line-clamp-2 text-xl font-black">{book.title}</p>
                  </button>

                  <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    {book.author} · {book.genre || '장르 미입력'}
                  </p>

                  <p className="mt-4 line-clamp-4 flex-1 text-sm text-muted-foreground">
                    {book.summary || '요약이 없습니다.'}
                  </p>

                  {book.rating || book.shortReview ? (
                    <div className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm font-bold">
                      {book.rating ? (
                        <p className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          {book.rating.toFixed(1)}점
                        </p>
                      ) : null}
                      {book.shortReview ? (
                        <p className="mt-1 line-clamp-2">"{book.shortReview}"</p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    {book.completedDate ? (
                      <CalendarCheck2 className="h-4 w-4" />
                    ) : (
                      <CalendarDays className="h-4 w-4" />
                    )}
                    {book.completedDate
                      ? `${book.completedDate} 완독`
                      : book.publishedDate
                        ? `${book.publishedDate} 출간`
                        : '출간일 미입력'}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-center gap-3">
            <button type="button" disabled={isFirstPage || loading} onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))} className="rounded-full border border-border px-4 py-2 text-sm font-bold">이전</button>
            <span className="text-sm font-bold text-muted-foreground">{currentPage + 1} / {totalPageCount}</span>
            <button type="button" disabled={isLastPage || loading} onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPageCount - 1))} className="rounded-full border border-border px-4 py-2 text-sm font-bold">다음</button>
          </div>
        </div>
      
        </div>
    </section>
  );
}