import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../auth/authApi';

export default function SignupPage() {
  const [email, setEmail] = useState('');
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
      setMessage('회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" required />
        <button type="submit" disabled={loading}>{loading ? '처리 중...' : '회원가입'}</button>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}
