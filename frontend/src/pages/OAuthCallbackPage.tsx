import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { setAccessToken } from '@/api/http';
import { useAuth } from '@/auth/AuthContext';
import Spinner from '@/components/common/Spinner';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser, clearSession } = useAuth();
  const [message, setMessage] = useState('소셜 로그인 세션을 확인하는 중입니다...');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const completeOAuthLogin = async () => {
      const accessToken = searchParams.get('accessToken') ?? searchParams.get('token');

      if (!accessToken) {
        clearSession();
        setFailed(true);
        setMessage('소셜 로그인 응답에 액세스 토큰이 없습니다. 다시 시도해 주세요.');
        return;
      }

      try {
        setAccessToken(accessToken);
        await refreshUser();
        window.dispatchEvent(new Event('auth-change'));
        if (mounted) {
          setMessage('로그인이 완료되었습니다. 홈으로 이동합니다.');
          navigate('/', { replace: true });
        }
      } catch {
        clearSession();
        if (mounted) {
          setFailed(true);
          setMessage('소셜 로그인 처리에 실패했습니다. 다시 로그인해 주세요.');
        }
      }
    };

    completeOAuthLogin();

    return () => {
      mounted = false;
    };
  }, [clearSession, navigate, refreshUser, searchParams]);

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center px-5 py-10 sm:px-6 lg:px-8">
      <article className="w-full rounded-[2rem] border border-border bg-card p-8 text-center shadow-card">
        {failed ? null : <Spinner label={message} className="justify-center" />}
        {failed ? (
          <>
            <h1 className="text-3xl font-black text-foreground">소셜 로그인 실패</h1>
            <p className="mt-4 text-sm font-semibold leading-6 text-muted-foreground">{message}</p>
            <Link to="/login" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft">
              로그인으로 돌아가기
            </Link>
          </>
        ) : null}
      </article>
    </section>
  );
}
