import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '홈' },
  { to: '/books', label: '독서노트' },
  { to: '/progress', label: '진도' },
  { to: '/recommendations', label: '추천' },
];

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-lg text-primary">📚</span>
          <div className="leading-tight">
            <p className="font-serif text-lg font-semibold text-foreground">Booktine</p>
            <p className="text-xs text-muted-foreground">오늘의 페이지를 담는 시간</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-booktine-beige text-xs font-semibold text-booktine-darkBrown">
            U
          </span>
          사용자 메뉴
        </button>
      </div>
    </header>
  );
}
