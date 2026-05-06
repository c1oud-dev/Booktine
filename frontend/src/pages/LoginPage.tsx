import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../auth/authApi';
import Spinner from '@/components/common/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authApi.login(email, password);
      window.dispatchEvent(new Event('auth-change'));
      navigate(from, { replace: true });
    } catch {
      setMessage('로그인에 실패했습니다. 이메일/비밀번호를 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-5 py-14 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(248,250,252,0.96),rgba(248,250,252,0.88)),url('/Main.png')] bg-cover bg-center" />
      <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-7xl items-center justify-center">
        <article className="w-full max-w-lg rounded-[2rem] border border-border/80 bg-card p-6 shadow-card sm:p-8 md:p-10">
          <div className="grid grid-cols-2 rounded-xl bg-secondary p-1">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-bold text-foreground transition hover:bg-card"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft"
            >
              Log in
            </Link>
          </div>

          <div className="mt-9 text-center">
            <p className="text-sm font-semibold text-muted-foreground">다시 이어 읽기</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground">Log in</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <label className="block text-sm font-bold text-foreground">
              Email address
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="이메일을 입력해주세요."
                required
                className="mt-2"
              />
            </label>

            <label className="block text-sm font-bold text-foreground">
              Password
              <span className="relative mt-2 block">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력해주세요."
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <label className="inline-flex w-auto items-center gap-2 font-medium">
                <input type="checkbox" className="h-4 w-4 rounded border-input p-0" />
                로그인 유지
              </label>
              <Link to="/signup" className="font-bold text-foreground underline-offset-4 hover:underline">
                계정 만들기
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-4 text-base font-bold text-primary-foreground shadow-soft hover:shadow-float disabled:opacity-60"
            >
              {loading ? (
                <Spinner label="로그인 중..." className="justify-center text-primary-foreground" />
              ) : (
                'Log in'
              )}
            </button>
          </form>

          {message ? (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {message}
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}
