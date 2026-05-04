import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createMemo, getBookNote, getMemos } from '../api/bookNoteApi';
import type { BookNote, Memo } from '../types/bookNote';

export default function BookDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const [book, setBook] = useState<BookNote | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [memoContent, setMemoContent] = useState('');

  const filteredMemos = useMemo(() => memos.filter((m) => m.postId === postId), [memos, postId]);

  const load = async () => {
    const [note, memoList] = await Promise.all([getBookNote(postId), getMemos()]);
    setBook(note);
    setMemos(memoList);
  };

  useEffect(() => {
    if (!Number.isNaN(postId)) load();
  }, [postId]);

  const onCreateMemo = async (e: FormEvent) => {
    e.preventDefault();
    await createMemo({ postId, content: memoContent });
    setMemoContent('');
    await load();
  };

  if (!book) return <section>불러오는 중...</section>;

  return (
    <section>
      <Link to="/books">← 목록</Link>
      <h2>{book.title}</h2>
      <p>저자: {book.author || '-'}</p>
      <p>{book.content}</p>

      <h3>메모</h3>
      <form className="auth-form" onSubmit={onCreateMemo}>
        <input value={memoContent} onChange={(e) => setMemoContent(e.target.value)} placeholder="메모 입력" required />
        <button type="submit">메모 작성</button>
      </form>
      <ul>
        {filteredMemos.map((memo) => (
          <li key={memo.id}>{memo.content}</li>
        ))}
      </ul>
    </section>
  );
}
