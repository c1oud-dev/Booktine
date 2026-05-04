import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../auth/authApi';

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
      setMessage('로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" required />
        <button type="submit" disabled={loading}>{loading ? '로그인 중...' : '로그인'}</button>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}
