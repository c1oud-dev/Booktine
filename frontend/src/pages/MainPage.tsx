import React, { useState } from 'react';
import AuthModal from '../components/AuthModal'; // 실제 AuthModal 위치에 맞춰 경로 수정

const MainPage: React.FC = () => {
  // (2) 모달 열림 여부, SignUp/LogIn 구분을 위한 state
  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

   // (3) 모달 열고/닫는 함수
   const handleOpenModal = (signUp: boolean) => {
    setIsSignUp(signUp);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 60px)', // 헤더 높이 제외
        background: 'url(/Main.jpg) no-repeat left top / cover', 
        position: 'relative',
      }}
    >
      {/* 왼쪽 상단에 문구/버튼 */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          left: '80px',
          color: '#000',
        }}
      >
        <h1 style={{ fontSize: '40px', marginBottom: '16px' }}>
          안녕하세요 Booktine입니다.
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '32px' }}>
          독서 습관 추적 & 목표 관리 서비스 <br />
          랜덤 책 추천 서비스 <br />
          독서 노트 & 메모 서비스
        </p>

        {/* (4) onClick에서 모달 열기 함수 호출 */}
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
          onClick={() => handleOpenModal(false)} // false -> Log In 모드
        >
          Log In
        </button>
      </div>

      {/* (5) 모달 표시 */}
      {showModal && (
        <AuthModal
          isSignUp={isSignUp}
          onClose={handleCloseModal}
        />
      )}

    </div>
  );
};

export default MainPage;

