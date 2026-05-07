import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/books', label: 'Book Note' },
  { to: '/progress', label: 'Progress' },
  { to: '/recommendations', label: 'Recommend' },
  { to: '/reminders', label: 'Reminder' },
];

export default function AppHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground">
          <img src="/favicon.png" alt="Booktine 로고" className="h-8 w-8" />
          Booktine
        </Link>

        <nav className="hidden items-center justify-center gap-1 rounded-full border border-border/70 bg-card px-1 py-1 shadow-soft md:flex" aria-label="주요 메뉴">
          {[...navItems, ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : [])].map((item) => (
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
          {isAuthenticated ? (
            <>
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-2.5 py-1.5 shadow-soft"
                >
                  <img
                    src={user?.profileImageUrl ?? "/default_avatar.png"}
                    alt="사용자 프로필"
                    className="h-8 w-8 rounded-full border object-cover"
                  />
                  <span className="text-sm font-bold text-foreground">{user?.nickname ?? 'Reader'}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-border bg-card p-2 shadow-card">
                    <Link
                      to="/mypage"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary"
                    >
                      <UserRound className="h-4 w-4" />
                      마이페이지
                    </Link>
                    <Link
                      to="/logout"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </Link>
                  </div>
                )}
              </div>
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