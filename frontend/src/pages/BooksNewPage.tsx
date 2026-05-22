import { FormEvent, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createBookNote } from '@/api/bookNoteApi';
import { getAdminGenres } from '@/api/adminApi';
import { READING_STATUS_OPTIONS, STATUS_LABEL } from '@/constants/readingStatus';
import type { ReadingStatus } from '@/types/bookNote';

const defaultStatus: ReadingStatus = 'READING';

function RatingInput({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center" role="radiogroup" aria-label="별점 선택">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star}점`}
            onClick={() => onChange(star)}
            className="rounded-full p-1"
          >
            <Star className={`h-7 w-7 ${value && value >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
          </button>
        ))}
      </div>
      <span className="text-sm font-black text-foreground">{value ? `${value}점` : '별점 미선택'}</span>
    </div>
  );
}

export default function BooksNewPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [genre, setGenre] = useState('');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>(defaultStatus);
  const [startDate, setStartDate] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [bookCurrentPage, setBookCurrentPage] = useState('');
  const [bookTotalPage, setBookTotalPage] = useState('');
  const [summary, setSummary] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [shortReview, setShortReview] = useState('');
  const [genres, setGenres] = useState<string[]>(['기타']);

  useEffect(() => {
    getAdminGenres()
      .then((items) => {
        const names = items.map((item) => item.name);
        setGenres(names.length ? names : ['기타']);
        setGenre(names[0] ?? '기타');
      })
      .catch(() => {
        setGenres(['기타']);
        setGenre('기타');
      });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createBookNote({
      title,
      author,
      publisher,
      genre: genre || null,
      readingStatus,
      startDate: startDate || null,
      completedDate: completedDate || null,
      publishedDate: publishedDate || null,
      currentPage: bookCurrentPage === '' ? null : Number(bookCurrentPage),
      totalPage: bookTotalPage === '' ? null : Number(bookTotalPage),
      summary: summary || null,
      rating: rating || null,
      shortReview: shortReview || null,
    });
    navigate('/books');
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="text-3xl font-black text-foreground">새 책 기록하기</h1>
      <form className="grid gap-5 rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:grid-cols-6" onSubmit={onSubmit}>
        <label className="block text-sm font-bold text-foreground lg:col-span-6">제목<input className="mt-2" value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-3">저자<input className="mt-2" value={author} onChange={(e) => setAuthor(e.target.value)} required /></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-3">출판사<input className="mt-2" value={publisher} onChange={(e) => setPublisher(e.target.value)} required /></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-3">장르<select className="mt-2 w-full pr-10" value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-3">독서 상태<select className="mt-2 w-full pr-10" value={readingStatus} onChange={(e) => setReadingStatus(e.target.value as ReadingStatus)}>{READING_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}</select></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-2">시작일<input className="mt-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-2">완독일<input className="mt-2" type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} /></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-2">출간일<input className="mt-2" type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} /></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-3">현재 페이지<input className="mt-2" type="number" min={0} value={bookCurrentPage} onChange={(e) => setBookCurrentPage(e.target.value)} /></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-3">전체 페이지<input className="mt-2" type="number" min={1} value={bookTotalPage} onChange={(e) => setBookTotalPage(e.target.value)} /></label>
        <label className="block text-sm font-bold text-foreground lg:col-span-6">요약<textarea className="mt-2 min-h-28 resize-y" value={summary} onChange={(e) => setSummary(e.target.value)} /></label>
        <div className="space-y-3 lg:col-span-6"><label className="text-sm font-bold text-foreground">별점</label><RatingInput value={rating} onChange={setRating} /></div>
        <label className="block text-sm font-bold text-foreground lg:col-span-6">한줄평<input className="mt-2" value={shortReview} onChange={(e) => setShortReview(e.target.value)} maxLength={255} /></label>
        <button type="submit" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground lg:col-span-6">저장하기</button>
      </form>
    </section>
  );
}
