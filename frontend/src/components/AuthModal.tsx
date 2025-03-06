import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isSignUp: boolean; // 처음 열릴 때 Sign Up 탭인지, Log In 탭인지
  onClose: () => void;
  onLoginSuccess?: (firstName: string, lastName: string) => void; // 로그인 성공 시 호출되는 콜백
}

const AuthModal: React.FC<AuthModalProps> = ({ isSignUp, onClose, onLoginSuccess }) => {
  const navigate = useNavigate();

  // 현재 탭 상태
  const [activeTab, setActiveTab] = useState(isSignUp ? 'signup' : 'login');

  // ▼ 로그인 API 요청 핸들러 추가
  const handleLogin = async () => {
    console.log("handleLogin called");
    try {
      const response = await fetch('http://localhost:8083/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        // 실패 처리 (에러 메시지 등)
        return;
      }

      // 로그인 성공 시, 응답 JSON에서 firstName과 lastName을 합쳐 사용자 이름 생성
      const result = await response.json();
      // 로그인 성공 콜백 호출
      if (onLoginSuccess) {
        onLoginSuccess(result.firstName || '', result.lastName || '');
      }
      onClose();
      navigate('/home');
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  // 입력값 상태
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 회원가입 성공 관련 상태
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 버튼 활성화 여부
  const isSignUpDisabled =
    !firstName.trim() ||
    !lastName.trim() ||
    !signUpEmail.trim() ||
    !signUpPassword.trim();

  const isLoginDisabled =
    !loginEmail.trim() ||
    !loginPassword.trim();

  // 회원가입 API 요청 핸들러
  const handleSignUp = async () => {
    console.log("handleSignUp called");
    try {
      const response = await fetch('http://localhost:8083/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: signUpEmail,
          password: signUpPassword,
        }),
      });

      if (!response.ok) {
        // 요청 실패 처리 (필요에 따라 에러 메시지 처리)
        return;
      }

      // 백엔드에서 "회원가입이 성공적으로 되었습니다!" 문자열을 받음
      const result = await response.text();
      setSuccessMessage(result);
      setSignUpSuccess(true);
    } catch (error) {
      console.error('SignUp Error:', error);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      {/* 래퍼 */}
      <div style={{ position: 'relative' }}>
        {/* 모달 박스 */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            width: '500px',
            padding: '50px',
            position: 'relative',
          }}
        >
          {/* 탭 (Sign up / Log in) */}
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: activeTab === 'signup' ? '#000' : '#ddd',
                color: activeTab === 'signup' ? '#fff' : '#000',
              }}
              onClick={() => setActiveTab('signup')}
            >
              Sign up
            </div>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: activeTab === 'login' ? '#000' : '#ddd',
                color: activeTab === 'login' ? '#fff' : '#000',
              }}
              onClick={() => setActiveTab('login')}
            >
              Log in
            </div>
          </div>

          {/* X 버튼 (모달 박스 옆) */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-35px',
              fontSize: '40px',
              cursor: 'pointer',
              color: 'white',
            }}
            onClick={onClose}
          >
            &times;
          </div>

          {/* 탭별 폼 */}
          {activeTab === 'signup' && (
            <>
              <h2
                style={{
                  textAlign: 'center',
                  marginBottom: '40px',
                  fontSize: '28px',
                  fontWeight: 'bold',
                }}
              >
                Sign up
              </h2>

              {/* First name / Last name */}
              <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>
                    First name
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>
                    Last name
                  </label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginBottom: '10px',
                  }}
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginBottom: '20px',
                  }}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                />
              </div>

              {/* Sign up 버튼 */}
              <button
                style={{
                  width: '100%',
                  backgroundColor: isSignUpDisabled ? '#ddd' : '#000',
                  color: isSignUpDisabled ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '12px',
                  cursor: 'pointer',
                }}
                disabled={isSignUpDisabled}
                onClick={handleSignUp}
              >
                Sign up
              </button>
            </>
          )}

          {activeTab === 'login' && (
            <>
              <h2
                style={{
                  textAlign: 'center',
                  marginBottom: '40px',
                  fontSize: '28px',
                  fontWeight: 'bold',
                }}
              >
                Log in
              </h2>

              {/* Email */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginBottom: '20px',
                  }}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginBottom: '20px',
                  }}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button
                style={{
                  width: '100%',
                  backgroundColor: isLoginDisabled ? '#ddd' : '#000',
                  color: isLoginDisabled ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '12px',
                  cursor: 'pointer',
                }}
                disabled={isLoginDisabled}
                onClick={handleLogin}
              >
                Log in
              </button>
            </>
          )}
        </div>

        {/* 회원가입 성공 모달 */}
        {signUpSuccess && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '40px',
                textAlign: 'center',
                position: 'relative',
                width: '300px',
              }}
            >
              {/* 닫기 버튼 */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  cursor: 'pointer',
                  fontSize: '24px',
                }}
                onClick={() => setSignUpSuccess(false)}
              >
                &times;
              </div>
              <img
                src="/success_icon.png"
                alt="success"
                style={{
                  width: '60px',
                  marginBottom: '20px',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
              <h2
                style={{
                  fontSize: '20px',
                  marginBottom: '16px',
                  fontWeight: 'bold',
                }}
              >
                {successMessage || "회원가입이 성공적으로 되었습니다!"}
              </h2>
              <button
                style={{
                  width: '100%',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '12px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSignUpSuccess(false);
                  setActiveTab('login');
                }}
              >
                Log in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
