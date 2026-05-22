import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isAdmin, logout, isAuthModalOpen, closeAuthModal } = useAuth();
  const navigate = useNavigate();
  const headerNavItems = [
    ...navItems,
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const handleLogout = async () => {
    closeAuthModal();
    setIsLogoutModalOpen(false);
    await logout();
    navigate('/');
  };

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
    <>
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-lg font-black tracking-tight text-foreground sm:text-xl">
          <img src="/favicon.png" alt="Booktine 로고" className="h-7 w-7 sm:h-8 sm:w-8" />
          Booktine
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center gap-1 rounded-full border border-border/70 bg-card px-1 py-1 shadow-soft md:flex" aria-label="주요 메뉴">
          {headerNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all',
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

        <div className="ml-auto flex items-center justify-end gap-3">
          <div ref={mobileNavRef} className="relative md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-soft transition hover:bg-secondary sm:h-10 sm:w-10"
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
                  className="absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-w-sm origin-top-right rounded-2xl border border-border bg-card p-2 shadow-card sm:top-12 sm:w-[calc(100vw-2.5rem)]"
                >
                  {headerNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all sm:px-4 sm:py-3',
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
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </button>
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
                  className="inline-flex max-w-[10rem] items-center gap-2 rounded-full border border-border/80 bg-card px-2 py-1 shadow-soft"
                >
                  <img
                    src={user?.profileImageUrl ?? "/default_avatar.png"}
                    alt="사용자 프로필"
                    className="h-7 w-7 shrink-0 overflow-hidden rounded-full border object-cover"
                  />
                  <span className="text-xs font-bold text-foreground">
                    {(user?.nickname ?? 'Reader').length > 10
                      ? `${(user?.nickname ?? 'Reader').slice(0, 10)}...`
                      : (user?.nickname ?? 'Reader')}
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
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-foreground hover:bg-secondary"
                      >
                        <LogOut className="h-4 w-4" />
                        로그아웃
                      </button>
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
    <AnimatePresence>
        {isLogoutModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5"
          >
            <motion.article
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={panelSpring}
              className="w-full max-w-sm rounded-[1.75rem] border border-border bg-card p-6 shadow-card"
            >
              <h2 className="text-xl font-black text-foreground">로그아웃 하시겠어요?</h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                현재 세션이 종료됩니다. 읽던 책과 메모는 안전하게 저장되어 있어요.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground hover:bg-secondary"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
                >
                  로그아웃
                </button>
              </div>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5"
          >
            <motion.article
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={panelSpring}
              className="w-full max-w-sm rounded-[1.75rem] border border-border bg-card p-6 shadow-card"
            >
              <h2 className="text-xl font-black text-foreground">로그인이 필요해요</h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                해당 페이지는 로그인 후 이용할 수 있어요.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground hover:bg-secondary"
                >
                  취소
                </button>
                <Link
                  to="/login"
                  onClick={closeAuthModal}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
                >
                  로그인
                </Link>
              </div>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}