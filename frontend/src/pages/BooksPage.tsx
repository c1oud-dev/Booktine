import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createBookNote, deleteBookNote, getBookNotes, updateBookNote } from '../api/bookNoteApi';
import type { BookNote, ReadingStatus } from '../types/bookNote';

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

  const load = async () => setItems(await getBookNotes());

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

    if (editingId) await updateBookNote(editingId, payload);
    else await createBookNote(payload);

    setTitle(''); setSummary(''); setAuthor(''); setGenre(''); setPublisher('');
    setPublishedDate(''); setReadingStatus(defaultStatus); setCompletedDate(''); 
    setEditingId(null);
    await load();
  };

  return (
    <section>
      <h2>독서 노트</h2>
      <form className="auth-form" onSubmit={onSubmit}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" required />
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="저자" required />
        <input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="장르" required />
        <input value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="출판사" required />
        <input type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} required />
        <select value={readingStatus} onChange={(e) => setReadingStatus(e.target.value as ReadingStatus)}>
          <option value="WISHLIST">읽고 싶은 책</option>
          <option value="READING">읽는 중</option>
          <option value="COMPLETED">완독</option>
          <option value="PAUSED">중단</option>
        </select>
        <input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} placeholder="완독일" />
        <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="요약" required />
        <button type="submit">{editingId ? '수정' : '생성'}</button>
      </form>

      <ul>
        {items.map((book) => (
          <li key={book.id}>
            <Link to={`/books/${book.id}`}>{book.title}</Link>
            <button type="button" onClick={() => {
              setEditingId(book.id);
              setTitle(book.title);
              setSummary(book.summary);
              setAuthor(book.author);
              setGenre(book.genre);
              setPublisher(book.publisher);
              setPublishedDate(book.publishedDate);
              setReadingStatus(book.readingStatus);
              setCompletedDate(book.completedDate ?? '');
            }}>편집</button>
            <button type="button" onClick={async () => {
              await deleteBookNote(book.id);
              await load();
            }}>삭제</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
