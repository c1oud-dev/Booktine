import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, Edit3, Plus, Trash2, X } from 'lucide-react';
import { createBookNote, deleteBookNote, getBookNotes, updateBookNote } from '../api/bookNoteApi';
import type { BookNote, ReadingStatus } from '../types/bookNote';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

const defaultStatus: ReadingStatus = 'READING';

const statusLabel: Record<ReadingStatus, string> = {
  WISHLIST: '읽고 싶은 책',
  READING: '읽는 중',
  COMPLETED: '완독',
  PAUSED: '중단',
};

const statusClassName: Record<ReadingStatus, string> = {
  WISHLIST: 'bg-secondary text-secondary-foreground',
  READING: 'bg-primary text-primary-foreground',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-amber-50 text-amber-700',
};

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await getBookNotes());
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    load();
  }, []);

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
    };

    if (editingId) {
      await updateBookNote(editingId, payload);
    } else {
      await createBookNote(payload);
    }

    setTitle('');
    setSummary('');
    setAuthor('');
    setGenre('');
    setPublisher('');
    setPublishedDate('');
    setReadingStatus(defaultStatus);
    setCompletedDate('');
    setEditingId(null);
    setIsFormOpen(false);
    await load();
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
            총 {items.length}권 기록
          </div>
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(true);
              setEditingId(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
          >
            <Plus className="h-4 w-4" />
            새 노트 추가
          </button>
        </div>
      </div>

      {isFormOpen && (
        <form
          className="grid gap-5 rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:grid-cols-2"
          onSubmit={onSubmit}
        >
          <div className="lg:col-span-2 flex items-center justify-between">
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
                setIsFormOpen(false);
                setEditingId(null);
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
            placeholder="예: 소설, 인문, 과학"
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
            <option value="WISHLIST">읽고 싶은 책</option>
            <option value="READING">읽는 중</option>
            <option value="COMPLETED">완독</option>
            <option value="PAUSED">중단</option>
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
                setTitle('');
                setSummary('');
                setAuthor('');
                setGenre('');
                setPublisher('');
                setPublishedDate('');
                setReadingStatus(defaultStatus);
                setCompletedDate('');
                setEditingId(null);
                setIsFormOpen(false);
              }}
            >
              편집 취소
            </button>
          ) : null}
        </div>
      </form>
    )}

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
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((book) => (
            <li
              key={book.id}
              className="group flex min-h-72 flex-col rounded-[1.5rem] border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-float"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={cn('rounded-full px-3 py-1 text-xs font-black', statusClassName[book.readingStatus])}>
                  {statusLabel[book.readingStatus]}
                </span>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              <Link
                to={`/books/${book.id}`}
                className="mt-5 line-clamp-2 text-xl font-black tracking-tight text-foreground underline-offset-4 group-hover:underline"
              >
                {book.title}
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
                    setIsFormOpen(true);
                  }}
                >
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  편집
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                  onClick={async () => {
                    if (!confirm('정말 삭제하시겠습니까?')) return;
                    await deleteBookNote(book.id);
                    await load();
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}