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
    const storedNickname = localStorage.getItem('nickname');
    if (storedNickname && storedNickname !== "undefined") {
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
        backgroundImage: `url(${process.env.PUBLIC_URL}/Main.png)`,
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
        <h1 style={{ fontSize: '40px', marginBottom: '35px', fontWeight: 'bold' }}>
          Booktine 독서 습관의 모든 것
        </h1>
        <ul style={{ fontSize: '20px', lineHeight: 1.6, maxWidth: '600px' }}>
          <li style={{ marginBottom: '24px' }}>
            <strong>🎯 독서 습관 추적 & 목표 관리 서비스</strong><br />
            <span style={{ fontSize: '16px', lineHeight: 1.4 }}>
              매일의 읽기 분량과 완독 목표를 설정하고, 
              진행 상황을 직관적인 그래프로 확인하세요.
            </span>
          </li>
          <li style={{ marginBottom: '24px' }}>
            <strong>🎲 랜덤 책 추천 서비스</strong><br />
            <span style={{ fontSize: '16px', lineHeight: 1.4 }}>
            새로운 독서 경험을 위한 맞춤형 랜덤 추천으로 
            일상에 뜻밖의 영감을 더합니다.
            </span>
          </li>
          <li>
            <strong>✍️ 독서 노트 & 메모 서비스</strong><br />
            <span style={{ fontSize: '16px', lineHeight: 1.4 }}>
            책 속 핵심 문장과 인사이트를 언제든 꺼내볼 수 있도록 
            깔끔하게 정리하고 관리할 수 있습니다.
            </span>
          </li>
        </ul>



        {/* 조건부 버튼 렌더링: 로그인 전이면 Log In, 로그인 후면 독서 노트 작성하러 가기 */}
        {!isLoggedIn ? (
          <button
            style={{
              marginTop: '30px',
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
              marginTop: '30px',
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
          onLoginSuccess={(nickname) => {
            localStorage.setItem('nickname', nickname);
            window.location.reload();
          }}
        />
      )}

    </div>
  );
};

export default MainPage;
