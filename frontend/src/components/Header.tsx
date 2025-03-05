import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  // 라우팅 관련 훅
  const navigate = useNavigate();
  const location = useLocation();

  // 모달 열기/닫기, 탭 전환 state
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // 로그인 후 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const handleOpenModal = (signUp: boolean) => {
    setIsSignUp(signUp);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '60px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* 왼쪽: 로고 + 메뉴 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '70px' }}>
        {/* 로고 */}
        <div
          style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => navigate('/home')}
        >
          Booktine
        </div>

        {/* 메뉴 */}
        <nav style={{ display: 'flex', gap: '20px', fontSize: '16px' }}>
          <div
            style={{
              cursor: 'pointer',
              color: location.pathname === '/home' ? '#000' : '#aaa',
            }}
            onClick={() => navigate('/home')}
          >
            Home
          </div>
          <div
            style={{
              cursor: 'pointer',
              color: location.pathname === '/booknote' ? '#000' : '#aaa',
            }}
            onClick={() => navigate('/booknote')}
          >
            Book Note
          </div>
          <div
            style={{
              cursor: 'pointer',
              color: location.pathname === '/progress' ? '#000' : '#aaa',
            }}
            onClick={() => navigate('/progress')}
          >
            Progress
          </div>
          <div
            style={{
              cursor: 'pointer',
              color: location.pathname === '/settings' ? '#000' : '#aaa',
            }}
            onClick={() => navigate('/settings')}
          >
            Settings
          </div>
        </nav>
      </div>

      {/* 오른쪽: 로그인 상태에 따라 */}
      <div style={{ display: 'flex', gap: '30px' }}>
        {isLoggedIn ? (
          <>
            <div style={{ fontWeight: 'bold' }}>{username}</div>
            <button
              style={{
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setIsLoggedIn(false);
                setUsername('');
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button
              style={{
                backgroundColor: '#fff',
                color: '#333',
                border: '1px solid #333',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
              onClick={() => handleOpenModal(false)}
            >
              Log In
            </button>
            <button
              style={{
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
              onClick={() => handleOpenModal(true)}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      {/* 모달 */}
      {showModal && (
        <AuthModal
          isSignUp={isSignUp}
          onClose={handleCloseModal}
          onLoginSuccess={(name) => {
            setIsLoggedIn(true);
            setUsername(name);
          }}
        />
      )}
    </header>
  );
};

export default Header;
