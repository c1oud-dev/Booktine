import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border bg-card/80 px-8 py-12 text-center shadow-sm">
      <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground">404 NOT FOUND</p>
      <h2 className="mt-4 font-serif text-4xl text-foreground">페이지를 찾을 수 없어요</h2>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
        찾으시는 페이지가 이동되었거나 삭제되었을 수 있습니다.
        아래 버튼을 눌러 북타임의 주요 화면으로 이동해 주세요.
      </p>

      <div className="mt-8 grid w-full max-w-md gap-3 sm:grid-cols-2">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          홈으로 이동
        </Link>
        <Link
          to="/books"
          className="inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          독서노트 보기
        </Link>
      </div>
    </section>
  );
}
