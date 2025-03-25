import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 로그인 상태를 로컬 스토리지에서 불러오기
  useEffect(() => {
    const storedProfileImage = localStorage.getItem('profileImage');
    if (storedProfileImage) {
      setProfileImage(storedProfileImage);
    }

    const handleProfileImageUpdate = () => {
      const updatedImage = localStorage.getItem('profileImage') || '';
      setProfileImage(updatedImage);
    };

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate);
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate);
    };
  }, []);

  // "로그인 필요" 모달
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);

  

  // (1) 로그인/회원가입 모달 열고 닫기
  const handleOpenModal = (signUp: boolean) => {
    setIsSignUp(signUp);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // (2) "로그인 필요" 모달을 띄우는 함수
  const handleProtectedRoute = (route: string) => {
    console.log("Navigating to", route, " | isLoggedIn =", isLoggedIn);
    if (!isLoggedIn) {
      // 로그인 안 되었으면 모달을 띄움
      setShowLoginRequiredModal(true);
    } else {
      // 로그인 된 상태면 원하는 페이지로 이동
      navigate(route);
    }
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
        borderBottom: '1px solid #ccc',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'fixed',    // 헤더를 화면 상단에 고정
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,         // 다른 요소들보다 위에 표시
      }}
    >
      {/* 왼쪽: 로고 + 메뉴 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '70px' }}>
        {/* 로고 */}
        <div
          style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', textShadow: '0px 1.5px gray' }}
          onClick={() => navigate('/')}
        >
          Booktine
        </div>

        {/* (3) 메뉴: handleProtectedRoute로 클릭 처리 */}
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
              color: location.pathname.includes('/booknote') ? '#000' : '#aaa',
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

      {/* 오른쪽: 로그인/로그아웃 영역 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundImage: `url(${profileImage || '/default_avatar.png'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden',
                marginRight: '5px'
                
              }}
            >
            </div>

            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{username}</div>

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
              onClick={() => setShowLogoutModal(true)}
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

      {/* (4) "로그인 필요" 모달 */}
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
              width: '350px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
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

      {/* (5) 로그인/회원가입 모달 */}
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

      {/* (5) 로그아웃 모달 */}
      {showLogoutModal && (
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
              width: '350px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '5px',
                right: '10px',
                cursor: 'pointer',
                fontSize: '20px',
              }}
              onClick={() => setShowLogoutModal(false)}
            >
              &times;
            </div>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              로그아웃 하시겠습니까?
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
                onClick={() => setShowLogoutModal(false)}
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
                  setShowLogoutModal(false);
                  setIsLoggedIn(false);
                  setUsername('');
                  setProfileImage('');
                  localStorage.removeItem('username'); // 로컬스토리지에서 로그인 정보 제거
                  localStorage.removeItem('profileImage');
                  localStorage.removeItem('email');
                  navigate('/'); // 메인 페이지로 이동
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}




    </header>
  );
};

export default Header;
