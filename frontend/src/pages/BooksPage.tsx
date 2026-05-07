import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CalendarCheck, Edit3, Plus, Star, Trash2, X } from 'lucide-react';
import { createBookNote, deleteBookNote, getBookNotes, searchBookNotes, updateBookNote } from '../api/bookNoteApi';
import { DEFAULT_GENRES, getGenres } from '@/api/genreApi';
import { CARD_STATUS_CLASS_NAME, READING_STATUS_OPTIONS, STATUS_CLASS_NAME, STATUS_LABEL } from '../constants/readingStatus';
import type { BookNote, ReadingStatus } from '../types/bookNote';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import { panelSpring, softSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

const defaultStatus: ReadingStatus = 'READING';
const pageSize = 10;

type RatingInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center" role="radiogroup" aria-label="별점 선택">
        {[1, 2, 3, 4, 5].map((star) => {
          const leftValue = star - 0.5;
          const rightValue = star;
          const fillPercent = Math.max(0, Math.min(100, ((value ?? 0) - (star - 1)) * 100));

          return (
            <span key={star} className="relative inline-flex h-9 w-9 items-center justify-center">
              <Star className="h-8 w-8 text-muted" aria-hidden="true" />
              <span className="pointer-events-none absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              </span>
              <button
                type="button"
                className="absolute inset-y-0 left-0 w-1/2 rounded-l-full focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`${leftValue}점`}
                aria-checked={value === leftValue}
                role="radio"
                onClick={() => onChange(leftValue)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 w-1/2 rounded-r-full focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`${rightValue}점`}
                aria-checked={value === rightValue}
                role="radio"
                onClick={() => onChange(rightValue)}
              />
            </span>
          );
        })}
      </div>
      <span className="text-sm font-black text-foreground">{value ? `${value.toFixed(1)}점` : '별점 미선택'}</span>
      {value ? (
        <button
          type="button"
          className="rounded-full border border-border rounded-full px-4 py-1.5 text-sm font-black font-bold text-muted-foreground hover:bg-secondary"
          onClick={() => onChange(null)}
        >
          초기화
        </button>
      ) : null}
    </div>
  );
}

export default function BooksPage() {
  const [items, setItems] = useState<BookNote[]>([]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(defaultStatus);
  const [completedDate, setCompletedDate] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [shortReview, setShortReview] = useState('');
  const [bookCurrentPage, setBookCurrentPage] = useState('');
  const [bookTotalPage, setBookTotalPage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | ''>('');
  const [genreOptions, setGenreOptions] = useState<string[]>(DEFAULT_GENRES);
  const [deleteTarget, setDeleteTarget] = useState<BookNote | null>(null);
  const navigate = useNavigate();

  const selectableGenreOptions = genre && !genreOptions.includes(genre) ? [genre, ...genreOptions] : genreOptions;
  const totalPageCount = Math.max(totalPages, 1);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPageCount - 1;

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setAuthor('');
    setGenre(genreOptions[0] ?? '기타');
    setPublisher('');
    setPublishedDate('');
    setStartDate('');
    setReadingStatus(defaultStatus);
    setCompletedDate('');
    setRating(null);
    setShortReview('');
    setBookCurrentPage('');
    setBookTotalPage('');
    setEditingId(null);
  };

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
    getGenres()
      .then((genres) => setGenreOptions(genres.length ? genres : DEFAULT_GENRES))
      .catch(() => setGenreOptions(DEFAULT_GENRES));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      summary,
      author,
      genre: genre || null,
      publisher,
      publishedDate: publishedDate || null,
      readingStatus,
      startDate: startDate || null,
      completedDate: completedDate || null,
      currentPage: bookCurrentPage === '' ? null : Number(bookCurrentPage),
      totalPage: bookTotalPage === '' ? null : Number(bookTotalPage),
      rating: readingStatus === 'COMPLETED' ? rating : null,
      shortReview: readingStatus === 'COMPLETED' ? shortReview || null : null,
    };

    if (editingId) {
      await updateBookNote(editingId, payload);
      await load(currentPage);
    } else {
      await createBookNote(payload);
      if (currentPage === 0) {
        await load(0);
      } else {
        setCurrentPage(0);
      }
    }

    resetForm();
    setIsFormOpen(false);
  };

  const handleDelete = async (bookId: number) => {

    await deleteBookNote(bookId);
    setDeleteTarget(null);

    if (items.length === 1 && currentPage > 0) {
      setCurrentPage((page) => page - 1);
      return;
    }

    await load(currentPage);
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-card lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Book note studio
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-4xl">
            독서 노트
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            읽고 싶은 책부터 완독 기록까지 한 곳에 정리하고, 책마다 떠오른 생각을 이어서 남겨보세요.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-sm font-bold text-secondary-foreground">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            총 {totalElements}권 기록
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setGenre(genreOptions[0] ?? '기타');
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
          >
            <Plus className="h-4 w-4" />
            새 노트 추가
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-[1.25rem] border border-border bg-card p-4 shadow-soft md:grid-cols-[1fr_14rem]">
        <input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setCurrentPage(0);
          }}
          placeholder="제목 또는 저자로 검색"
          aria-label="도서 검색"
        />
        <select
          className="w-full pr-10"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ReadingStatus | '');
            setCurrentPage(0);
          }}
        >
          <option value="">전체 상태</option>
          {READING_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence initial={false}>
        {isFormOpen ? (
          <motion.form
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.985 }}
            transition={panelSpring}
            className="grid origin-top gap-5 rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:grid-cols-6"
            onSubmit={onSubmit}
          >
          <div className="flex items-center justify-between lg:col-span-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {editingId ? 'Edit note' : 'Create note'}
              </p>
              <h2 className="mt-2 text-2xl font-black text-foreground">
                {editingId ? '노트 수정하기' : '새 책 기록하기'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="block text-sm font-bold text-foreground lg:col-span-6">
            제목
            <input
              className="mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="책 제목을 입력하세요."
              required
            />
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-3">
            저자
            <input
              className="mt-2"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="저자명"
              required
            />
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-3">
            장르
            <select
              className="mt-2 w-full pr-10"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {selectableGenreOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-3">
            출판사
            <input
              className="mt-2"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="출판사"
              required
            />
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-3">
            독서 상태
            <select
              className="mt-2 w-full pr-10"
              value={readingStatus}
              onChange={(e) => {
                const nextStatus = e.target.value as ReadingStatus;
                setReadingStatus(nextStatus);
                if (nextStatus !== 'COMPLETED') {
                  setRating(null);
                  setShortReview('');
                }
              }}
            >
              {READING_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-3">
            시작일
            <input
              className="mt-2"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="독서 시작일"
            />
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-3">
            완독일
            <input
              className="mt-2"
              type="date"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              placeholder="완독일"
            />
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-2">
            출간일
            <input
              className="mt-2"
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
            />
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-2">
            현재 페이지
            <input
              className="mt-2"
              type="number"
              min={0}
              value={bookCurrentPage}
              onChange={(e) => setBookCurrentPage(e.target.value)}
              placeholder="예: 120"
            />
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-2">
            전체 페이지
            <input
              className="mt-2"
              type="number"
              min={1}
              value={bookTotalPage}
              onChange={(e) => setBookTotalPage(e.target.value)}
              placeholder="예: 360"
            />
          </label>

          <label className="block text-sm font-bold text-foreground lg:col-span-6">
            요약
            <textarea
              className="mt-2 min-h-28 resize-y"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="책의 핵심 내용이나 읽고 싶은 이유를 적어보세요."
            />
          </label>

          {readingStatus === 'COMPLETED' ? (
            <div className="space-y-4 rounded-[1.25rem] border border-border bg-background p-4 lg:col-span-6">
              <label className="block text-sm font-bold text-foreground">
                별점
                <div className="mt-2">
                  <RatingInput value={rating} onChange={setRating} />
                </div>
              </label>
              <label className="block text-sm font-bold text-foreground">
                한줄평
                <input
                  className="mt-2"
                  value={shortReview}
                  onChange={(e) => setShortReview(e.target.value)}
                  placeholder="완독 후 떠오르는 한 문장을 남겨보세요."
                  maxLength={255}
                />
              </label>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-6">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
              type="submit"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {editingId ? '노트 수정' : '새 노트 추가'}
            </button>

            {editingId ? (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary"
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
              >
                편집 취소
              </button>
            ) : null}
          </div>
        </motion.form>
        ) : null}
      </AnimatePresence>

      {loading ? (
        <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
          <Spinner label="독서 노트를 불러오는 중..." />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="아직 독서 노트가 없어요"
          description="첫 책을 기록해 오늘의 독서를 시작해 보세요."
        />
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((book) => (
              <motion.li
                key={book.id}
                layoutId={`book-note-card-${book.id}`}
                transition={softSpring}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/books/${book.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/books/${book.id}`);
                  }
                }}
                className={cn(
                  'group flex min-h-72 cursor-pointer flex-col rounded-[1.5rem] border p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-float',
                  CARD_STATUS_CLASS_NAME[book.readingStatus],
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'rounded-full rounded-full px-4 py-1.5 text-sm font-black font-black',
                      STATUS_CLASS_NAME[book.readingStatus],
                    )}
                  >
                    {STATUS_LABEL[book.readingStatus]}
                  </span>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>

                <div className="mt-5 line-clamp-2 text-xl font-black tracking-tight text-foreground underline-offset-4 group-hover:underline">
                  <motion.span layoutId={`book-note-title-${book.id}`} transition={softSpring}>
                    {book.title}
                  </motion.span>
                </div>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  {book.author} · {book.genre || '장르 미입력'}
                </p>
                <p className="mt-4 line-clamp-4 flex-1 text-sm leading-6 text-muted-foreground">
                  {book.summary || '요약이 없습니다.'}
                </p>

                {(book.rating || book.shortReview) ? (
                  <div className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground">
                    {book.rating ? (
                      <p className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-yellow-400" aria-hidden="true" />
                        {book.rating.toFixed(1)}점
                      </p>
                    ) : null}
                    {book.shortReview ? (
                      <p className="mt-1 line-clamp-2 text-secondary-foreground">“{book.shortReview}”</p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  {book.completedDate ? `${book.completedDate} 완독` : book.publishedDate ? `${book.publishedDate} 출간` : '출간일 미입력'}
                </div>

                <div className="mt-5 flex gap-2 border-t border-border pt-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(book.id);
                      setTitle(book.title);
                      setSummary(book.summary ?? '');
                      setAuthor(book.author);
                      setGenre(book.genre ?? genreOptions[0] ?? '기타');
                      setPublisher(book.publisher);
                      setPublishedDate(book.publishedDate ?? '');
                      setStartDate(book.startDate ?? '');
                      setReadingStatus(book.readingStatus);
                      setCompletedDate(book.completedDate ?? '');
                      setRating(book.rating ?? null);
                      setShortReview(book.shortReview ?? '');
                      setBookCurrentPage(book.currentPage?.toString() ?? '');
                      setBookTotalPage(book.totalPage?.toString() ?? '');
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                    편집
                  </button>
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(book);
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    삭제
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="flex flex-col items-center justify-between gap-4 rounded-[1.25rem] border border-border bg-card px-5 py-4 shadow-soft sm:flex-row">
            <p className="text-sm font-bold text-muted-foreground">
              총 {totalElements}권 · {currentPage + 1} / {totalPageCount} 페이지
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isFirstPage || loading}
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전
              </button>
              <button
                type="button"
                disabled={isLastPage || loading}
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPageCount - 1))}
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </>
      )}
      <AnimatePresence>
        {deleteTarget ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={panelSpring}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-card"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black text-foreground">정말 삭제하시겠습니까?</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                ‘{deleteTarget.title}’ 독서 노트를 삭제하면 되돌릴 수 없습니다.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteTarget.id)}
                  className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:shadow-soft"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}