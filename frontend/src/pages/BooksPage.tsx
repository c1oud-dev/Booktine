import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createBookNote, deleteBookNote, getBookNotes, updateBookNote } from '../api/bookNoteApi';
import type { BookNote, ReadingStatus } from '../types/bookNote';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

const defaultStatus: ReadingStatus = 'READING';

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

  const load = async () => {
    setLoading(true);
    try { setItems(await getBookNotes()); } finally { setLoading(false); }
  };
  
  useEffect(() => { load(); }, []);

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

    if (editingId) await updateBookNote(editingId, payload);
    else await createBookNote(payload);

    setTitle(''); setSummary(''); setAuthor(''); setGenre(''); setPublisher('');
    setPublishedDate(''); setReadingStatus(defaultStatus); setCompletedDate(''); 
    setEditingId(null);
    await load();
  };

  return (
     <section className="space-y-6">
      <div className="flex items-end justify-between">
        <h2 className="text-3xl font-semibold">독서 노트</h2>
      </div>
      <form className="grid gap-3 rounded-xl border bg-card p-6 shadow-soft md:grid-cols-2" onSubmit={onSubmit}>
        <input className="rounded-lg border bg-background px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" required />
        <input className="rounded-lg border bg-background px-3 py-2" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="저자" required />
        <input className="rounded-lg border bg-background px-3 py-2" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="장르" required />
        <input className="rounded-lg border bg-background px-3 py-2" value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="출판사" required />
        <input className="rounded-lg border bg-background px-3 py-2" type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} required />
        <select className="rounded-lg border bg-background px-3 py-2" value={readingStatus} onChange={(e) => setReadingStatus(e.target.value as ReadingStatus)}>
          <option value="WISHLIST">읽고 싶은 책</option><option value="READING">읽는 중</option><option value="COMPLETED">완독</option><option value="PAUSED">중단</option>
        </select>
        <input className="rounded-lg border bg-background px-3 py-2" type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} placeholder="완독일" />
        <input className="rounded-lg border bg-background px-3 py-2" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="요약" required />
        <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground md:col-span-2 md:justify-self-start" type="submit">{editingId ? '노트 수정' : '새 노트 추가'}</button>
      </form>

      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState title="아직 독서 노트가 없어요" description="첫 책을 기록해 오늘의 독서를 시작해 보세요." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((book) => (
            <li key={book.id} className="rounded-xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float">
              <Link to={`/books/${book.id}`} className="line-clamp-1 text-lg font-semibold">{book.title}</Link>
              <p className="mt-1 text-sm text-muted-foreground">{book.author} · {book.genre}</p>
              <p className="mt-2 line-clamp-3 text-sm">{book.summary}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" className="rounded-md border px-3 py-1 text-sm" onClick={() => { setEditingId(book.id); setTitle(book.title); setSummary(book.summary); setAuthor(book.author); setGenre(book.genre); setPublisher(book.publisher); setPublishedDate(book.publishedDate); setReadingStatus(book.readingStatus); setCompletedDate(book.completedDate ?? ''); }}>편집</button>
                <button type="button" className="rounded-md border px-3 py-1 text-sm" onClick={async () => { await deleteBookNote(book.id); await load(); }}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
