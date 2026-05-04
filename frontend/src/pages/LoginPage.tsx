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
    <section className="mx-auto w-full max-w-md rounded-2xl border bg-card/80 p-8 shadow-sm">
      <p className="text-sm text-muted-foreground">다시 이어 읽기</p>
      <h2 className="mt-2 font-serif text-3xl">로그인</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-lg border bg-background px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일" required />
        <input className="w-full rounded-lg border bg-background px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="비밀번호" required />
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-70">
          {loading ? <Spinner label="로그인 중..." className="justify-center text-primary-foreground" /> : '로그인'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-red-700">{message}</p>}
      <p className="mt-6 text-center text-sm text-muted-foreground">처음이신가요? <Link className="font-semibold text-primary" to="/signup">회원가입</Link></p>
    </section>
  );
}
