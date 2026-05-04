import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createMemo, getBookNote, getMemos } from '../api/bookNoteApi';
import type { BookNote, Memo } from '../types/bookNote';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

export default function BookDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const [book, setBook] = useState<BookNote | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [memoContent, setMemoContent] = useState('');

  const [memoPage, setMemoPage] = useState(1);
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
    if (!Number.isNaN(postId)) load();
  }, [postId]);

  const onCreateMemo = async (e: FormEvent) => {
    e.preventDefault();
    await createMemo(postId, { content: memoContent, page: memoPage });
    setMemoContent('');
    setMemoPage(1);
    await load();
  };

  const progressPercent = useMemo(() => {
    if (book?.readingStatus === "COMPLETED") return 100;
    if (book?.readingStatus === "WISHLIST") return 0;
    return Math.min(95, memos.length * 12);
  }, [book, memos]);

  if (loading) return <section><Spinner /></section>;
  if (!book) return <section><EmptyState title="도서를 찾을 수 없어요" description="목록으로 돌아가 다시 선택해 주세요." actionLabel="목록으로" actionTo="/books" /></section>;

  return (
    <section className="space-y-6">
      <Link to="/books" className="inline-flex items-center rounded-full border bg-card px-4 py-1 text-sm text-muted-foreground">← 독서 노트 목록</Link>

      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold">{book.title}</h2>
          <p className="text-sm text-muted-foreground">{book.author || '-'} · {book.publisher || '-'}</p>
        </div>
        <p className="mt-4 rounded-xl bg-background/80 p-4 text-sm leading-6">{book.summary}</p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium">독서 진행률</p>
            <p className="text-muted-foreground">{progressPercent}%</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h3 className="text-2xl font-semibold">메모</h3>
        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_120px_auto]" onSubmit={onCreateMemo}>
          <input className="rounded-lg border bg-background px-3 py-2" value={memoContent} onChange={(e) => setMemoContent(e.target.value)} placeholder="인상 깊은 문장을 기록해 보세요" required />
          <input className="rounded-lg border bg-background px-3 py-2" type="number" min={1} value={memoPage} onChange={(e) => setMemoPage(Number(e.target.value))} required />
          <button type="submit">메모 작성</button>
        </form>

        {memos.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="아직 메모가 없어요" description="첫 메모를 남겨 독서의 흔적을 만들어 보세요." />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {memos.map((memo) => (
              <li key={memo.id} className="rounded-xl border bg-background/70 p-4">
                <p className="text-xs font-medium text-muted-foreground">{memo.page} 페이지</p>
                <p className="mt-1 text-sm leading-6">{memo.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
