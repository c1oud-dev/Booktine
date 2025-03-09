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
  const [profileImage, setProfileImage] = useState<string>('');

  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  const handleProtectedRoute = (route: string) => {
    if (!isLoggedIn) {
      // 로그인 안 된 상태 → "로그인 필요" 모달 띄우기
      setShowLoginRequiredModal(true);
    } else {
      // 로그인 된 상태 → 정상 이동
      navigate(route);
    }
  };

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
        height: '65px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #ccc', // 헤더 아래 선 추가
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',  // 추가
        zIndex: 100,          // 추가: 다른 컨테이너 위에 표시되도록 함
      }}
    >
      {/* 왼쪽: 로고 + 메뉴 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '70px' }}>
        {/* 로고 */}
        <div
          style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', textShadow: '0px 1.5px gray' }}
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
            onClick={() => handleProtectedRoute('/home')}
          >
            Home
          </div>
          <div
            style={{
              cursor: 'pointer',
              color:
                location.pathname === '/booknote' || location.pathname === '/createpost'
                  ? '#000'
                  : '#aaa'
            }}
            onClick={() => handleProtectedRoute('/booknote')}
          >
            Book Note
          </div>
          <div
            style={{
              cursor: 'pointer',
              color: location.pathname === '/progress' ? '#000' : '#aaa',
            }}
            onClick={() => handleProtectedRoute('/progress')}
          >
            Progress
          </div>
          <div
            style={{
              cursor: 'pointer',
              color: location.pathname === '/settings' ? '#000' : '#aaa',
            }}
            onClick={() => handleProtectedRoute('/settings')}
          >
            Settings
          </div>
        </nav>
      </div>

      {/* 오른쪽: 로그인 상태에 따라 (이미지+이름과 로그아웃 버튼을 감싸는)*/}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {/* 프로필 이미지 컨테이너 */}
              <div
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  backgroundColor: '#ccc', // 기본 회색 원
                  border: '1px solid #666',   // 원하는 색상, 두께로 조정
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {profileImage && (
                  <img
                    src={profileImage}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>

              {/* 사용자 이름 */}
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{username}</div>

              {/* 로그아웃 버튼 */}
              <button
                style={{
                  marginLeft: '20px',
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
                  setProfileImage(''); // 로그아웃 시 이미지도 초기화
                }}
              >
                Log Out
              </button>
            </div>
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
                marginLeft: '20px',
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


      {showLoginRequiredModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: '400px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* 닫기(X) 아이콘 (원한다면 추가) */}
            <div
              style={{
                position: 'absolute',
                top: '5px',
                right: '10px',
                cursor: 'pointer',
                fontSize: '20px',
              }}
              onClick={() => setShowLoginRequiredModal(false)}
            >
              &times;
            </div>

            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              로그인 후 이용해주세요.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                style={{
                  width: '120px',
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setShowLoginRequiredModal(false)}
              >
                취소
              </button>
              <button
                style={{
                  width: '120px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  // 모달 닫고, 로그인 모달 띄우기
                  setShowLoginRequiredModal(false);
                  handleOpenModal(false); // Log In 모드
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}



      {/* 모달 */}
      {showModal && (
        <AuthModal
          isSignUp={isSignUp}
          onClose={handleCloseModal}
          onLoginSuccess={(firstName: string, lastName: string) => {
            const fullName = `${firstName}${lastName}`;
            setIsLoggedIn(true);
            setUsername(fullName);
            localStorage.setItem('username', fullName);
          }}
        />
      )}
    </header>
  );
};

export default Header;
