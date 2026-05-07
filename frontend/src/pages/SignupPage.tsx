import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkEmailDuplicated, checkNicknameDuplicated } from '@/api/userApi';
import { authApi } from '../auth/authApi';
import Spinner from '@/components/common/Spinner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckEmail = async () => {
    if (!email) {
      setMessage('이메일을 먼저 입력해 주세요.');
      return;
    }
    setCheckingEmail(true);
    setMessage('');
    try {
      const duplicated = await checkEmailDuplicated(email);
      setEmailAvailable(!duplicated);
      setEmailVerified(false);
      setMessage(duplicated ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다. 인증 코드를 발송해 주세요.');
    } catch {
      setEmailAvailable(false);
      setMessage('이메일 중복 확인에 실패했습니다.');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleCheckNickname = async () => {
    if (!nickname) {
      setMessage('닉네임을 먼저 입력해 주세요.');
      return;
    }
    setCheckingNickname(true);
    setMessage('');
    try {
      const duplicated = await checkNicknameDuplicated(nickname);
      setNicknameAvailable(!duplicated);
      setMessage(duplicated ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.');
    } catch {
      setNicknameAvailable(false);
      setMessage('닉네임 중복 확인에 실패했습니다.');
    } finally {
      setCheckingNickname(false);
    }
  };

  const handleSendCode = async () => {
    if (!emailAvailable) {
      setMessage('이메일 중복 확인을 먼저 완료해 주세요.');
      return;
    }

    setSendingCode(true);
    setMessage('');

    try {
      await authApi.sendSignupEmailCode(email);
      setMessage('인증 코드가 발송되었습니다. 이메일을 확인해 주세요.');
    } catch {
      setMessage('인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!email || !emailCode) {
      setMessage('이메일과 인증 코드를 입력해 주세요.');
      return;
    }

    setVerifyingCode(true);
    setMessage('');

    try {
      await authApi.verifySignupEmailCode(email, emailCode);
      setEmailVerified(true);
      setMessage('이메일 인증이 완료되었습니다. 회원가입을 진행해 주세요.');
    } catch {
      setMessage('인증 코드가 올바르지 않거나 만료되었습니다.');
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!nicknameAvailable) {
      setMessage('닉네임 중복 확인을 먼저 완료해 주세요.');
      return;
    }

    if (!emailAvailable) {
      setMessage('이메일 중복 확인을 먼저 완료해 주세요.');
      return;
    }

    if (!emailVerified) {
      setMessage('이메일 인증을 먼저 완료해 주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await authApi.signup(email, password, nickname);
      setMessage('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch {
      setMessage('회원가입에 실패했습니다. 입력 정보를 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-5 py-14 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(248,250,252,0.96),rgba(248,250,252,0.88)),url('/Main.png')] bg-cover bg-center" />
      <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-7xl items-center justify-center">
        <article className="w-full max-w-xl rounded-[2rem] border border-border/80 bg-card p-6 shadow-card sm:p-8 md:p-10">
          <div className="grid grid-cols-2 rounded-xl bg-secondary p-1">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-bold text-foreground transition hover:bg-card"
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
              <span className="mt-2 flex gap-2">
                <input
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNicknameAvailable(false);
                  }}
                  type="text"
                  placeholder="닉네임을 입력해주세요."
                  required
                />
                <button type="button" onClick={handleCheckNickname} disabled={checkingNickname || nicknameAvailable} className="shrink-0 rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-60">
                  {nicknameAvailable ? '확인 완료' : checkingNickname ? '확인 중' : '중복 확인'}
                </button>
              </span>
              <span className="mt-2 block text-xs font-semibold leading-5 text-muted-foreground">한글 8자, 영문 14자까지 입력 가능해요.</span>
            </label>

            <label className="block text-sm font-bold text-foreground">
              Email address
              <span className="mt-2 flex gap-2">
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailAvailable(false);
                    setEmailVerified(false);
                    setEmailCode('');
                  }}
                  type="email"
                  placeholder="이메일을 입력해주세요."
                  required
                />
                <button 
                  type="button" 
                  onClick={handleCheckEmail} 
                  disabled={checkingEmail || emailAvailable} 
                  className="shrink-0 rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-60"
                  >
                  {emailAvailable ? '확인 완료' : checkingEmail ? '확인 중' : '중복 확인'}
                </button>
              </span>
            </label>

            <label className="block text-sm font-bold text-foreground">
              Email verification code
              <span className="mt-2 flex gap-2">
                <input
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  placeholder="6자리 인증 코드"
                  required
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || emailVerified}
                  className="shrink-0 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-soft disabled:opacity-60"
                >
                  {emailVerified ? '인증 완료' : verifyingCode ? '확인 중' : '확인'}
                </button>
              </span>
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
              <span className="mt-2 block text-xs font-semibold leading-5 text-muted-foreground">
                영문 대소문자/숫자/특수문자를 조합해 8~16자로 입력해주세요.
              </span>
            </label>

            <button 
              type="submit" 
              disabled={loading || !emailVerified || !emailAvailable || !nicknameAvailable} 
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-4 text-base font-bold text-primary-foreground shadow-soft hover:shadow-float disabled:opacity-60"
              >
              {loading ? <Spinner label="가입 처리 중..." className="justify-center text-primary-foreground" /> : 'Sign up'}
            </button>
          </form>

          {message ? <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground">{message}</p> : null}
        </article>
      </div>
    </section>
  );
}
