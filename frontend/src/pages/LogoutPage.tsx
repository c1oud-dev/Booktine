import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../auth/authApi';
import Spinner from '@/components/common/Spinner';

export default function LogoutPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    setMessage('');

    try {
      await authApi.logout();
      setMessage('로그아웃 되었습니다. 로그인 페이지로 이동합니다.');
      navigate('/login', { replace: true });
    } catch {
      setMessage('로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border bg-card p-8 shadow-soft">
      <p className="text-sm text-muted-foreground">북타임 잠시 쉬어가기</p>
      <h2 className="mt-2 text-3xl font-semibold">로그아웃</h2>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        지금 로그아웃하면 현재 세션이 종료됩니다.
        다음 방문 시 다시 로그인해서 독서 기록을 이어갈 수 있어요.
      </p>

      <div className="mt-8 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 text-sm text-amber-900">
        읽던 책은 안전하게 저장되어 있습니다.
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {loading ? <Spinner label="로그아웃 중..." className="text-primary-foreground" /> : '로그아웃'}
        </button>
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary sm:w-auto"
        >
          홈으로 돌아가기
        </Link>
      </div>

      {message ? <p className="mt-4 text-sm text-red-700">{message}</p> : null}
    </section>
  );
}
