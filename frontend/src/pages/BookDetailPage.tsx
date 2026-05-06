import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, NotebookPen, Plus } from 'lucide-react';
import { createMemo, getBookNote, getMemos } from '../api/bookNoteApi';
import type { BookNote, Memo } from '../types/bookNote';
import { STATUS_CLASS_NAME, STATUS_LABEL } from '../constants/readingStatus';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

export default function BookDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const [book, setBook] = useState<BookNote | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [memoContent, setMemoContent] = useState('');
  const [memoPage, setMemoPage] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [note, memoList] = await Promise.all([getBookNote(postId), getMemos(postId)]);
      setBook(note);
      setMemos(memoList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(postId)) {
      load();
    }
  }, [postId]);

  const onCreateMemo = async (e: FormEvent) => {
    e.preventDefault();
    await createMemo(postId, { content: memoContent, page: Number(memoPage) });
    setMemoContent('');
    setMemoPage('');
    await load();
  };

  const progressPercent = useMemo(() => {
    if (!book) {
      return 0;
    }

    if (book.totalPage && book.totalPage > 0) {
      return Math.min(100, Math.round(((book.currentPage ?? 0) / book.totalPage) * 100));
    }

    if (book.readingStatus === 'COMPLETED') {
      return 100;
    }
    if (book.readingStatus === 'WISHLIST' || book.readingStatus === 'WANT_TO_READ') {
      return 0;
    }
    return Math.min(95, memos.length * 12);
  }, [book, memos]);

  const progressLabel = book?.totalPage
    ? `${book.currentPage ?? 0} / ${book.totalPage}쪽`
    : `${progressPercent}%`;


  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
          <Spinner label="도서 상세를 불러오는 중..." />
        </div>
      </section>
    );
  }

  if (!book) {
    return (
      <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
        <EmptyState
          title="도서를 찾을 수 없어요"
          description="목록으로 돌아가 다시 선택해 주세요."
          actionLabel="목록으로"
          actionTo="/books"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <Link
        to="/books"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground shadow-soft hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        독서 노트 목록
      </Link>

      <article className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
        <div className="grid gap-8 p-6 lg:grid-cols-[17rem_1fr] lg:p-8">
          <div className="flex min-h-80 items-center justify-center rounded-[1.5rem] bg-secondary p-6 text-secondary-foreground">
            <div className="text-center">
              <BookOpen className="mx-auto h-14 w-14" aria-hidden="true" />
              <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">
                Booktine note
              </p>
              <p className="mt-3 line-clamp-3 text-2xl font-black tracking-tight text-foreground">
                {book.title}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span
              className={cn(
                'w-fit rounded-full px-3 py-1 text-xs font-black',
                STATUS_CLASS_NAME[book.readingStatus],
              )}
            >
              {STATUS_LABEL[book.readingStatus]}
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              {book.title}
            </h1>
            <p className="mt-4 text-base font-semibold text-muted-foreground">
              {book.author || '-'} · {book.publisher || '-'} · {book.genre || '장르 미입력'}
            </p>
            <p className="mt-6 rounded-[1.25rem] bg-background p-5 text-sm leading-7 text-muted-foreground">
              {book.summary}
            </p>

        <div className="mt-7 space-y-3">
              <div className="flex items-center justify-between text-sm font-bold">
                <p className="text-foreground">독서 진행률</p>
                <p className="text-muted-foreground">{progressLabel}</p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          </div>
      </article>

      <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Reading memos
            </p>
            <h2 className="mt-2 text-3xl font-black text-foreground">메모</h2>
          </div>
          <p className="text-sm font-bold text-muted-foreground">총 {memos.length}개</p>
        </div>
      
        <form className="mt-6 grid gap-3 lg:grid-cols-[1fr_10rem_auto]" onSubmit={onCreateMemo}>
          <input
            value={memoContent}
            onChange={(e) => setMemoContent(e.target.value)}
            placeholder="인상 깊은 문장이나 생각을 기록해 보세요."
            required
          />
          <input
            type="number"
            min={1}
            value={memoPage}
            onChange={(e) => setMemoPage(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="페이지 수"
            aria-label="페이지 수"
            required
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            메모 작성
          </button>
        </form>

        {memos.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="아직 메모가 없어요"
              description="첫 메모를 남겨 독서의 흔적을 만들어 보세요."
            />
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {memos.map((memo) => (
              <li key={memo.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                  <NotebookPen className="h-4 w-4" aria-hidden="true" />
                  {memo.page} 페이지
                </div>
                <p className="mt-3 text-sm leading-7 text-foreground">
                  {memo.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
