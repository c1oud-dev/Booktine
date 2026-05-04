import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../auth/authApi';
import Spinner from '@/components/common/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate(from, { replace: true });
    } catch {
      setMessage('로그인에 실패했습니다. 이메일/비밀번호를 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border bg-card p-8 shadow-soft">
      <p className="text-sm text-muted-foreground">다시 이어 읽기</p>
      <h1 className="mt-2 text-3xl font-semibold">로그인</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="비밀번호" required />
        <button type="submit" disabled={loading} className="w-full bg-primary px-4 py-2 text-primary-foreground hover:-translate-y-0.5 hover:shadow-float disabled:opacity-70">
          {loading ? <Spinner label="로그인 중..." className="justify-center text-primary-foreground" /> : '로그인'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-red-700">{message}</p>}
      <p className="mt-6 text-center text-sm text-muted-foreground">처음이신가요? <Link className="font-semibold text-primary" to="/signup">회원가입</Link></p>
    </section>
  );
}
