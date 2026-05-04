import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createBookNote, deleteBookNote, getBookNotes, updateBookNote } from '../api/bookNoteApi';
import type { BookNote } from '../types/bookNote';

export default function BooksPage() {
  const [items, setItems] = useState<BookNote[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => setItems(await getBookNotes());

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateBookNote(editingId, { title, content, author });
    } else {
      await createBookNote({ title, content, author });
    }
    setTitle('');
    setContent('');
    setAuthor('');
    setEditingId(null);
    await load();
  };

  return (
    <section>
      <h2>독서 노트</h2>
      <form className="auth-form" onSubmit={onSubmit}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" required />
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="저자(선택)" />
        <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용" required />
        <button type="submit">{editingId ? '수정' : '생성'}</button>
      </form>

      <ul>
        {items.map((book) => (
          <li key={book.id}>
            <Link to={`/books/${book.id}`}>{book.title}</Link>
            <button type="button" onClick={() => {
              setEditingId(book.id);
              setTitle(book.title);
              setContent(book.content);
              setAuthor(book.author ?? '');
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
