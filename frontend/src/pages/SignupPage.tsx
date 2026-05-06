import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../auth/authApi';
import Spinner from '@/components/common/Spinner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await authApi.signup(email, password);
      setMessage('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch {
      setMessage('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-5 py-14 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(248,250,252,0.96),rgba(248,250,252,0.88)),url('/Main.png')] bg-cover bg-center" />
      <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-7xl items-center justify-center">
        <article className="w-full max-w-xl rounded-[2rem] border border-border/80 bg-white p-6 shadow-card sm:p-8 md:p-10">
          <div className="grid grid-cols-2 rounded-xl bg-secondary p-1">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-bold text-foreground transition hover:bg-white"
            >
              Log in
            </Link>
          </div>

          <div className="mt-9 text-center">
            <p className="text-sm font-semibold text-muted-foreground">나만의 독서 루틴 만들기</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground">Sign up</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <label className="block text-sm font-bold text-foreground">
              Nickname
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                type="text"
                placeholder="닉네임을 입력해주세요."
                required
                className="mt-2"
              />
              <span className="mt-2 block text-xs font-semibold leading-5 text-muted-foreground">
                한글 8자, 영문 14자까지 입력 가능해요.
              </span>
            </label>

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
              <span className="mt-2 block text-xs font-semibold leading-5 text-muted-foreground">
                영문 대소문자/숫자/특수문자를 조합해 8~16자로 입력해주세요.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-4 text-base font-bold text-primary-foreground shadow-soft hover:shadow-float disabled:opacity-60"
            >
              {loading ? <Spinner label="가입 처리 중..." className="justify-center text-primary-foreground" /> : 'Sign up'}
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
