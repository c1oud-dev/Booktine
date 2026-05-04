import { Link } from 'react-router-dom';

export default function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-card/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="font-medium text-foreground">© {new Date().getFullYear()} Booktine</p>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-foreground">서비스 소개</Link>
          <Link to="/books" className="hover:text-foreground">이용 가이드</Link>
          <Link to="/mypage" className="hover:text-foreground">마이페이지</Link>
        </div>
      </div>
    </footer>
  );
}