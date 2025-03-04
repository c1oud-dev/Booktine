import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal'; // 새로 만든 모달 컴포넌트 (아래 참고)

const Header: React.FC = () => {
  const navigate = useNavigate();

  // 모달 열기/닫기, 탭 전환을 위한 state
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

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
      {/* 왼쪽: Booktine 로고 + 메뉴 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        {/* 로고 */}
        <div
          style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Booktine
        </div>
        {/* 메뉴 */}
        <nav style={{ display: 'flex', gap: '20px', fontSize: '16px' }}>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Home
          </div>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/booktine')}>
            Booktine
          </div>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/progress')}>
            Progress
          </div>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/settings')}>
            Settings
          </div>
        </nav>
      </div>

      {/* 오른쪽: Log In / Sign Up 버튼 */}
      <div style={{ display: 'flex', gap: '10px' }}>
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
      </div>

      {/* 모달 */}
      {showModal && (
        <AuthModal isSignUp={isSignUp} onClose={handleCloseModal} />
      )}
    </header>
  );
};

export default Header;
