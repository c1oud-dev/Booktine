import { Link, NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '홈' },
  { to: '/books', label: '독서노트' },
  { to: '/progress', label: '진도' },
  { to: '/recommendations', label: '추천' },
];

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Booktine
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm shadow-soft hover:-translate-y-0.5 hover:shadow-float">
          <User className="h-4 w-4" />
          사용자 메뉴
        </button>
      </div>
    </header>
  );
}