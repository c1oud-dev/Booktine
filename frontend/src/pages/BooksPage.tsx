import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, Edit3, Plus, Trash2, X } from 'lucide-react';
import { createBookNote, deleteBookNote, getBookNotes, searchBookNotes, updateBookNote } from '../api/bookNoteApi';
import { READING_STATUS_OPTIONS, STATUS_CLASS_NAME, STATUS_LABEL } from '../constants/readingStatus';
import type { BookNote, ReadingStatus } from '../types/bookNote';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import { panelSpring, softSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

const defaultStatus: ReadingStatus = 'READING';
const pageSize = 20;

export default function BooksPage() {
  const [items, setItems] = useState<BookNote[]>([]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(defaultStatus);
  const [completedDate, setCompletedDate] = useState('');
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

  const totalPageCount = Math.max(totalPages, 1);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPageCount - 1;

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setAuthor('');
    setGenre('');
    setPublisher('');
    setPublishedDate('');
    setReadingStatus(defaultStatus);
    setCompletedDate('');
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      summary,
      author,
      genre,
      publisher,
      publishedDate,
      readingStatus,
      completedDate: completedDate || null,
      currentPage: bookCurrentPage === '' ? null : Number(bookCurrentPage),
      totalPage: bookTotalPage === '' ? null : Number(bookTotalPage),
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
    if (!confirm('정말 삭제하시겠습니까?')) return;

    await deleteBookNote(bookId);

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
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
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
            className="grid origin-top gap-5 rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:grid-cols-2"
            onSubmit={onSubmit}
          >
          <div className="flex items-center justify-between lg:col-span-2">
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

          <label className="block text-sm font-bold text-foreground">
            제목
            <input
              className="mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="책 제목을 입력하세요."
              required
            />
          </label>

          <label className="block text-sm font-bold text-foreground">
            저자
            <input
              className="mt-2"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="저자명"
              required
            />
          </label>

          <label className="block text-sm font-bold text-foreground">
            장르
            <input
              className="mt-2"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="장르"
              required
            />
          </label>

          <label className="block text-sm font-bold text-foreground">
            출판사
            <input
              className="mt-2"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="출판사"
              required
            />
          </label>

          <label className="block text-sm font-bold text-foreground">
            출간일
            <input
              className="mt-2"
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-bold text-foreground">
            독서 상태
            <select
              className="mt-2"
              value={readingStatus}
              onChange={(e) => setReadingStatus(e.target.value as ReadingStatus)}
            >
              {READING_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-bold text-foreground">
            완독일
            <input
              className="mt-2"
              type="date"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              placeholder="완독일"
            />
          </label>

          <label className="block text-sm font-bold text-foreground">
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

          <label className="block text-sm font-bold text-foreground">
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

          <label className="block text-sm font-bold text-foreground lg:col-span-2">
            요약
            <textarea
              className="mt-2 min-h-28 resize-y"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="책의 핵심 내용이나 읽고 싶은 이유를 적어보세요."
              required
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
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
                className="group flex min-h-72 flex-col rounded-[1.5rem] border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-float"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-black',
                      STATUS_CLASS_NAME[book.readingStatus],
                    )}
                  >
                    {STATUS_LABEL[book.readingStatus]}
                  </span>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>

                <Link
                  to={`/books/${book.id}`}
                  className="mt-5 line-clamp-2 text-xl font-black tracking-tight text-foreground underline-offset-4 group-hover:underline"
                >
                  <motion.span layoutId={`book-note-title-${book.id}`} transition={softSpring}>
                    {book.title}
                  </motion.span>
                </Link>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  {book.author} · {book.genre}
                </p>
                <p className="mt-4 line-clamp-4 flex-1 text-sm leading-6 text-muted-foreground">
                  {book.summary}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  {book.completedDate ? `${book.completedDate} 완독` : `${book.publishedDate} 출간`}
                </div>

                <div className="mt-5 flex gap-2 border-t border-border pt-4">
                  <Link
                    to={`/books/${book.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:shadow-soft"
                  >
                    <BookOpen className="h-4 w-4" />
                    상세 보기
                  </Link>
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                    onClick={() => {
                      setEditingId(book.id);
                      setTitle(book.title);
                      setSummary(book.summary);
                      setAuthor(book.author);
                      setGenre(book.genre);
                      setPublisher(book.publisher);
                      setPublishedDate(book.publishedDate);
                      setReadingStatus(book.readingStatus);
                      setCompletedDate(book.completedDate ?? '');
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
                    onClick={() => handleDelete(book.id)}
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
    </section>
  );
}