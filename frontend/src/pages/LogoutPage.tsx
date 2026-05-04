import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../auth/authApi';

export default function LogoutPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    setMessage('');

    try {
      await authApi.logout();
      setMessage('로그아웃 되었습니다.');
      navigate('/login', { replace: true });
    } catch {
      setMessage('로그아웃에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>로그아웃</h2>
      <button type="button" onClick={handleLogout} disabled={loading}>
        {loading ? '로그아웃 중...' : '로그아웃'}
      </button>
      {message && <p>{message}</p>}
    </section>
  );
}
