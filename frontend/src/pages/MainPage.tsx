import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const MainPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleOpenModal = (signUp: boolean) => {
    setIsSignUp(signUp);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername && storedUsername !== "undefined") {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundImage: 'url(/Main.png)',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      {/* 왼쪽 상단 문구 및 버튼 영역 */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          left: '80px',
          color: '#000',
          paddingTop: '100px'
        }}
      >
        <h1 style={{ fontSize: '40px', marginBottom: '16px', fontWeight: 'bold' }}>
          안녕하세요 Booktine입니다.
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '32px' }}>
          독서 습관 추적 & 목표 관리 서비스 <br />
          랜덤 책 추천 서비스 <br />
          독서 노트 & 메모 서비스
        </p>

        {/* 조건부 버튼 렌더링: 로그인 전이면 Log In, 로그인 후면 독서 노트 작성하러 가기 */}
        {!isLoggedIn ? (
          <button
            style={{
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
            onClick={() => handleOpenModal(false)}
          >
            Log In
          </button>
        ) : (
          <button
            style={{
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
            onClick={() => navigate('/booknote')}
          >
            독서 노트 작성하러 가기
          </button>
        )}
      </div>

      {/* 로그인/회원가입 모달 */}
      {showModal && (
        <AuthModal
          isSignUp={isSignUp}
          onClose={handleCloseModal}
          onLoginSuccess={(firstName, lastName) => {
            const fullName = `${firstName}${lastName}`;
            localStorage.setItem('username', fullName);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default MainPage;
