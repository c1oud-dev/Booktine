import { Link } from 'react-router-dom';

export default function AppFooter() {
  return (
    <footer className="border-t border-border/70 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-muted-foreground">© {new Date().getFullYear()} Booktine</p>
        <div className="flex items-center gap-5 text-muted-foreground">
          <Link to="/">서비스 소개</Link>
          <Link to="/books">이용 가이드</Link>
          <Link to="/mypage">마이페이지</Link>
        </div>
      </div>
    </footer>
  );
}