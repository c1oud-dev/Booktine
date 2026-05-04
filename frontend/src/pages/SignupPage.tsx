import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../auth/authApi';
import Spinner from '@/components/common/Spinner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
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
    <section className="mx-auto w-full max-w-md rounded-2xl border bg-card/80 p-8 shadow-sm">
      <p className="text-sm text-muted-foreground">독서 기록 시작하기</p>
      <h2 className="mt-2 font-serif text-3xl">회원가입</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-lg border bg-background px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="이메일" required />
        <input className="w-full rounded-lg border bg-background px-3 py-2" value={nickname} onChange={(e) => setNickname(e.target.value)} type="text" placeholder="닉네임" required />
        <input className="w-full rounded-lg border bg-background px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="비밀번호 (8자 이상)" required />
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-70">
          {loading ? <Spinner label="가입 처리 중..." className="justify-center text-primary-foreground" /> : '가입하기'}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-red-700">{message}</p>}
      <p className="mt-6 text-center text-sm text-muted-foreground">이미 계정이 있으신가요? <Link className="font-semibold text-primary" to="/login">로그인</Link></p>
    </section>
  );
}
