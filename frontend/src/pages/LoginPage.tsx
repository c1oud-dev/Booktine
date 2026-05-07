import { FormEvent, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole, Mail, MessageCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '@/auth/authApi';
import { useAuth } from '@/auth/AuthContext';
import Spinner from '@/components/common/Spinner';
import { panelSpring } from '@/lib/motion';

const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Google', className: 'bg-card text-foreground border border-border hover:bg-secondary' },
  { id: 'kakao', label: 'Kakao', className: 'bg-[#FEE500] text-[#191919] hover:bg-[#f5dc00]' },
  { id: 'naver', label: 'Naver', className: 'bg-[#03C75A] text-white hover:bg-[#02b351]' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogin, setKeepLogin] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
  const oauthBaseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? '', []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await login(email, password, keepLogin);
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

          <div className="mt-8 grid gap-3">
            {OAUTH_PROVIDERS.map((provider) => (
              <a
                key={provider.id}
                href={`${oauthBaseUrl}/oauth2/authorization/${provider.id}`}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black shadow-soft ${provider.className}`}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {provider.label}로 계속하기
              </a>
            ))}
          </div>

          <div className="my-7 flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Email login
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                <input type="checkbox" checked={keepLogin} onChange={(e) => setKeepLogin(e.target.checked)} className="h-4 w-4 rounded border-input p-0" />
                로그인 유지
              </label>
              <button type="button" onClick={() => setResetOpen(true)} className="font-bold text-foreground underline-offset-4 hover:underline">
                비밀번호 찾기
              </button>
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

          <p className="mt-5 text-center text-sm font-semibold text-muted-foreground">
            아직 계정이 없나요? 
            <Link to="/signup" 
              className="font-black text-foreground underline-offset-4 hover:underline">
              계정 만들기
            </Link>
          </p>  
          {message ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</p> : null}
        </article>
      </div>

      <AnimatePresence>
        {resetOpen ? <PasswordResetDialog onClose={() => setResetOpen(false)} /> : null}
      </AnimatePresence>
    </section>
  );
}

function PasswordResetDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'done'>('email');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    if (!email) {
      setMessage('이메일을 입력해 주세요.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await authApi.sendPasswordResetEmailCode(email);
      setStep('code');
      setMessage('인증 코드가 발송되었습니다. 이메일을 확인해 주세요.');
    } catch {
      setMessage('인증 코드 발송에 실패했습니다. 가입된 이메일인지 확인해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!email || !code) {
      setMessage('이메일과 인증 코드를 입력해 주세요.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await authApi.verifyPasswordResetEmailCode(email, code);
      setStep('password');
      setMessage('인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.');
    } catch {
      setMessage('인증 코드가 올바르지 않거나 만료되었습니다.');
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await authApi.resetPasswordByEmail(email, code, newPassword);
      setStep('done');
      setMessage('비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해 주세요.');
    } catch {
      setMessage('비밀번호 재설정에 실패했습니다. 인증 코드를 다시 확인해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
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
        className="w-full max-w-lg rounded-[1.75rem] border border-border bg-card p-6 shadow-card"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">Password reset</p>
            <h2 className="mt-2 text-3xl font-black text-foreground">비밀번호 찾기</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary">닫기</button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-foreground">
            이메일
            <span className="mt-2 flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={step !== 'email'} placeholder="가입 이메일" />
              <button type="button" onClick={sendCode} disabled={busy || step !== 'email'} className="shrink-0 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60">
                {busy && step === 'email' ? '발송 중' : '코드 발송'}
              </button>
            </span>
          </label>

          {step !== 'email' ? (
            <label className="block text-sm font-bold text-foreground">
              인증 코드
              <span className="mt-2 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} disabled={step !== 'code'} inputMode="numeric" pattern="\d{6}" placeholder="6자리 인증 코드" />
                <button type="button" onClick={verifyCode} disabled={busy || step !== 'code'} className="shrink-0 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60">
                  {busy && step === 'code' ? '확인 중' : step === 'password' || step === 'done' ? '인증 완료' : '코드 확인'}
                </button>
              </span>
            </label>
          ) : null}

          {step === 'password' || step === 'done' ? (
            <form onSubmit={resetPassword} className="space-y-4">
              <label className="block text-sm font-bold text-foreground">
                새 비밀번호
                <input className="mt-2" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={step === 'done'} minLength={8} placeholder="8자 이상 입력" required />
              </label>
              <button type="submit" disabled={busy || step === 'done'} className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60">
                {busy ? <Spinner label="재설정 중..." className="text-primary-foreground" /> : '비밀번호 재설정'}
              </button>
            </form>
          ) : null}
        </div>

        {message ? <p className="mt-5 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-secondary-foreground">{message}</p> : null}
      </motion.article>
    </motion.div>
  );
}
