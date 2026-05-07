import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { LogIn, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { panelSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/books', label: 'Book Note' },
  { to: '/progress', label: 'Progress' },
  { to: '/community', label: 'Community' },
  { to: '/recommendations', label: 'Recommend' },
  { to: '/reminders', label: 'Reminder' },
];

export default function AppHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const headerNavItems = [
    ...navItems,
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }

      if (mobileNavRef.current && !mobileNavRef.current.contains(target)) {
        setIsMobileNavOpen(false);
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
          {headerNavItems.map((item) => (
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
          <div ref={mobileNavRef} className="relative md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-soft transition hover:bg-secondary"
              aria-label={isMobileNavOpen ? '모바일 메뉴 닫기' : '모바일 메뉴 열기'}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-main-nav"
            >
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <AnimatePresence>
              {isMobileNavOpen ? (
                <motion.nav
                  id="mobile-main-nav"
                  aria-label="모바일 주요 메뉴"
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={panelSpring}
                  className="absolute right-0 top-12 z-50 w-[calc(100vw-2.5rem)] max-w-sm origin-top-right rounded-2xl border border-border bg-card p-2 shadow-card"
                >
                  {headerNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-soft'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  {isAuthenticated ? (
                    <Link
                      to="/logout"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </Link>
                  ) : null}
                </motion.nav>
              ) : null}
            </AnimatePresence>
          </div>
          {isAuthenticated ? (
            <>
              <div ref={profileMenuRef} className="relative hidden min-w-0 sm:block">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="inline-flex max-w-[13rem] items-center gap-2 rounded-full border border-border/80 bg-card px-2.5 py-1.5 shadow-soft"
                >
                  <img
                    src={user?.profileImageUrl ?? "/default_avatar.png"}
                    alt="사용자 프로필"
                    className="h-8 w-8 shrink-0 rounded-full border object-cover"
                  />
                  <span className="min-w-0 max-w-[8rem] truncate text-sm font-bold text-foreground">
                    {user?.nickname ?? 'Reader'}
                  </span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={panelSpring}
                      className="absolute right-0 top-12 z-50 w-48 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-card"
                    >
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
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
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