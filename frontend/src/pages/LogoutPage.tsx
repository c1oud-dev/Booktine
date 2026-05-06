import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import Spinner from '@/components/common/Spinner';

export default function LogoutPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    setLoading(true);
    setMessage('');

    try {
      await logout();
      setMessage('로그아웃 되었습니다. 로그인 페이지로 이동합니다.');
      navigate('/login', { replace: true });
    } catch {
      setMessage('로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-3xl items-center px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <article className="w-full rounded-[2rem] border border-border bg-card p-6 text-center shadow-card sm:p-8 lg:p-10">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-soft">
          <LogOut className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Session control
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          로그아웃
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          지금 로그아웃하면 현재 세션이 종료됩니다. 다음 방문 시 다시 로그인해서 독서 기록을 이어갈 수 있어요.
        </p>

      <div className="mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-[1.25rem] border border-border bg-background p-4 text-left">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-foreground" aria-hidden="true" />
        <p className="text-sm font-semibold leading-6 text-muted-foreground">
          읽던 책과 메모는 안전하게 저장되어 있습니다.
        </p>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <Spinner label="로그아웃 중..." className="text-primary-foreground" />
          ) : (
            '로그아웃'
          )}
        </button>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary"
        >
          홈으로 돌아가기
        </Link>
      </div>

      {message ? (
          <p className="mt-5 rounded-[1rem] bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {message}
          </p>
        ) : null}
      </article>
    </section>
  );
}
