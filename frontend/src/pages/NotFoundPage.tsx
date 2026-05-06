import { Link } from 'react-router-dom';
import { Compass, Home, LibraryBig } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-screen items-center bg-background px-5 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-[2rem] border border-border bg-card px-6 py-12 text-center shadow-card sm:px-8 lg:px-12">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-soft">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.24em] text-muted-foreground">
          404 Not Found
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          페이지를 찾을 수 없어요
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          찾으시는 페이지가 이동되었거나 삭제되었을 수 있습니다. 아래 버튼을 눌러 북타임의 주요 화면으로 이동해 주세요.
        </p>

      <div className="mt-8 grid w-full max-w-md gap-3 sm:grid-cols-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            홈으로 이동
          </Link>
          <Link
            to="/books"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary"
          >
            <LibraryBig className="h-4 w-4" aria-hidden="true" />
            독서노트 보기
          </Link>
        </div>
      </article>
    </section>
  );
}
