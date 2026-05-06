import { Link } from 'react-router-dom';

export default function AppFooter() {
  return (
    <footer className="border-t border-border/80 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Link to="/" className="text-lg font-black tracking-tight text-foreground">
            Booktine
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            더 선명한 독서 습관을 위한 기록 공간
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            서비스 소개
          </Link>
          <Link to="/books" className="hover:text-foreground">
            독서노트
          </Link>
          <Link to="/progress" className="hover:text-foreground">
            진도 관리
          </Link>
          <Link to="/mypage" className="hover:text-foreground">
            마이페이지
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Booktine</p>
      </div>
    </footer>
  );
}