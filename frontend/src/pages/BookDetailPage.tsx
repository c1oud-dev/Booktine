import { FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, NotebookPen, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { createMemo, deleteMemo, getBookNote, getMemos, updateMemo } from '../api/bookNoteApi';
import type { BookNote, Memo } from '../types/bookNote';
import { STATUS_CLASS_NAME, STATUS_LABEL } from '../constants/readingStatus';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import { softSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

export default function BookDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const [book, setBook] = useState<BookNote | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [memoContent, setMemoContent] = useState('');
  const [memoPage, setMemoPage] = useState<number | ''>('');
  const [editingMemoId, setEditingMemoId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingPage, setEditingPage] = useState<number | ''>('');
  const [memoMessage, setMemoMessage] = useState('');
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
    setMemoMessage('');
    await createMemo(postId, { content: memoContent, page: Number(memoPage) });
    setMemoContent('');
    setMemoPage('');
    setMemoMessage('메모를 작성했습니다.');
    await load();
  };

  const startEditMemo = (memo: Memo) => {
    setEditingMemoId(memo.id);
    setEditingContent(memo.content);
    setEditingPage(memo.page);
    setMemoMessage('');
  };

  const cancelEditMemo = () => {
    setEditingMemoId(null);
    setEditingContent('');
    setEditingPage('');
  };

  const onUpdateMemo = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingMemoId) return;

    await updateMemo(postId, editingMemoId, { content: editingContent, page: Number(editingPage) });
    cancelEditMemo();
    setMemoMessage('메모를 수정했습니다.');
    await load();
  };

  const onDeleteMemo = async (memoId: number) => {
    await deleteMemo(postId, memoId);
    if (editingMemoId === memoId) {
      cancelEditMemo();
    }
    setMemoMessage('메모를 삭제했습니다.');
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
    if (book.readingStatus === 'WISHLIST') {
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

      <motion.article
        layoutId={`book-note-card-${postId}`}
        transition={softSpring}
        className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card"
      >
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
            <motion.h1
              layoutId={`book-note-title-${postId}`}
              transition={softSpring}
              className="mt-5 text-4xl font-black tracking-tight text-foreground sm:text-5xl"
            >
              {book.title}
            </motion.h1>
            <p className="mt-4 text-base font-semibold text-muted-foreground">
              {book.author || '-'} · {book.publisher || '-'} · {book.genre || '장르 미입력'}
            </p>
            <p className="mt-6 rounded-[1.25rem] bg-background p-5 text-sm leading-7 text-muted-foreground">
              {book.summary || '요약이 없습니다.'}
            </p>

          {(book.rating || book.shortReview) ? (
              <div className="mt-5 rounded-[1.25rem] border border-yellow-200 bg-yellow-50 p-5 text-sm font-bold text-yellow-900">
                {book.rating ? (
                  <p className="inline-flex items-center gap-2 text-base text-yellow-600">
                    <Star className="h-5 w-5 fill-yellow-400" aria-hidden="true" />
                    {book.rating.toFixed(1)}점
                  </p>
                ) : null}
                {book.shortReview ? (
                  <p className="mt-2 text-yellow-950">“{book.shortReview}”</p>
                ) : null}
              </div>
            ) : null}

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
      </motion.article>

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
        
        {memoMessage ? 
          <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground">
            {memoMessage}
          </p> : null
        }

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
                {editingMemoId === memo.id ? (
                  <form onSubmit={onUpdateMemo} className="space-y-3">
                    <input value={editingContent} onChange={(e) => setEditingContent(e.target.value)} required aria-label="메모 내용" />
                    <input type="number" min={1} value={editingPage} onChange={(e) => setEditingPage(e.target.value === '' ? '' : Number(e.target.value))} required aria-label="메모 페이지" />
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground">저장</button>
                      <button type="button" onClick={cancelEditMemo} className="rounded-full border border-border bg-card px-4 py-2 text-xs font-black text-foreground hover:bg-secondary">취소</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                        <NotebookPen className="h-4 w-4" aria-hidden="true" />
                        {memo.page} 페이지
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => startEditMemo(memo)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="메모 수정">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => onDeleteMemo(memo.id)} className="rounded-full p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600" aria-label="메모 삭제">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                      {memo.content}
                    </p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
