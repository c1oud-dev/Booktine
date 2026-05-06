import { Link, NavLink } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';
import { getAccessToken } from '@/api/http';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/books', label: 'Book Note' },
  { to: '/progress', label: 'Progress' },
  { to: '/recommendations', label: 'Recommend' },
];

export default function AppHeader() {
  const isLoggedIn = Boolean(getAccessToken());

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link to="/" className="text-xl font-black tracking-tight text-foreground">
          Booktine
        </Link>

        <nav className="hidden items-center justify-center gap-1 rounded-full border border-border/70 bg-white px-1 py-1 shadow-soft md:flex" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3">
          {isLoggedIn ? (
            <>
              <Link
                to="/mypage"
                className="hidden items-center gap-2 rounded-full border border-border/80 bg-card px-2.5 py-1.5 shadow-soft sm:inline-flex"
              >
                <img
                  src="/default_avatar.png"
                  alt="사용자 프로필"
                  className="h-8 w-8 rounded-full border object-cover"
                />
                <span className="text-sm font-bold text-foreground">Reader</span>
              </Link>
              <Link
                to="/logout"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
            >
              <LogIn className="h-4 w-4" />
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}