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

  const [emailValidationMessage, setEmailValidationMessage] = useState('');
  const [emailValidationColor, setEmailValidationColor] = useState('');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('영문 대소문자/숫자/특수문자를 혼용하여 8~16자 입력해주세요.');
  const [passwordValidationColor, setPasswordValidationColor] = useState('red');

  // 로그인 에러 메시지와 로그인 유지 체크 상태 추가
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // 추가: 이메일 중복 확인 여부와 비밀번호 유효성 여부 상태
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Forgot Password / Reset Password 모달 관련 상태 추가
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordValidationMessage, setNewPasswordValidationMessage] = useState('영문 대소문자/숫자/특수문자를 혼용하여 8~16자 입력해주세요.');
  const [newPasswordValidationColor, setNewPasswordValidationColor] = useState('red');




  // ▼ 로그인 API 요청 핸들러 추가
  const handleLogin = async () => {
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
        setLoginErrorMessage("이메일 또는 암호를 다시 한번 확인해주세요.");
        return;
      }
      const result = await response.json();
  
      localStorage.setItem('email', result.email);
      localStorage.setItem('username', `${result.firstName}${result.lastName}`);
  
      if (onLoginSuccess) {
        onLoginSuccess(result.firstName || '', result.lastName || '');
      }
      onClose();
      navigate('/home');
    } catch (error) {
      console.error('Login Error:', error);
      setLoginErrorMessage("이메일이나 암호를 다시 한번 확인해주세요.");
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
    !signUpPassword.trim() ||
    !isEmailChecked ||
    !isPasswordValid;


  const isLoginDisabled =
    !loginEmail.trim() ||
    !loginPassword.trim();

  // 회원가입 API 요청 핸들러
  const handleSignUp = async () => {
    // 이메일 중복 확인이 안 된 경우 경고 후 진행 중단
    if (!isEmailChecked) {
      alert("이메일 중복 확인을 해주세요.");
      return;
    }
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
                <label style={{ display: 'block', marginBottom: '4px' }}>Email address</label>
                <div style={{ display: 'flex' }}>
                  <input
                    type="email"
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginBottom: '10px',
                    }}
                    value={signUpEmail}
                    onChange={(e) => {
                      setSignUpEmail(e.target.value);
                      setEmailValidationMessage('');
                      setIsEmailChecked(false); // 이메일 변경 시 중복 확인 상태 리셋
                    }}
                  />
                  <button
                    style={{
                      marginLeft: '8px',
                      height: '50px',         // 고정 높이 지정
                      lineHeight: '40px',      // 텍스트가 중앙에 오도록 설정
                      padding: '0 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#000',
                      color: '#fff',
                    }}
                    onClick={async () => {
                      try {
                        const response = await fetch(`http://localhost:8083/api/auth/check-email?email=${signUpEmail}`);
                        if (response.ok) {
                          setEmailValidationMessage('사용 가능한 이메일입니다.');
                          setEmailValidationColor('blue');
                          setIsEmailChecked(true);
                        } else {
                          setEmailValidationMessage('중복된 이메일입니다.');
                          setEmailValidationColor('red');
                          setIsEmailChecked(false);
                        }
                      } catch (error) {
                        console.error('Email check error:', error);
                      }
                    }}
                  >
                    중복 확인
                  </button>
                </div>
                {emailValidationMessage && (
                  <div style={{ color: emailValidationColor, fontSize: '12px' }}>
                    {emailValidationMessage}
                  </div>
                )}
              </div>


              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Password</label>
                <input
                  type="password"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                  value={signUpPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSignUpPassword(value);
                    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
                    if (passwordRegex.test(value)) {
                      setPasswordValidationMessage('사용 가능한 비밀번호입니다.');
                      setPasswordValidationColor('blue');
                      setIsPasswordValid(true);
                    } else {
                      setPasswordValidationMessage('영문 대소문자/숫자/특수문자를 혼용하여 8~16자 입력해주세요.');
                      setPasswordValidationColor('red');
                      setIsPasswordValid(false);
                    }
                  }}
                />
                <div style={{ color: passwordValidationColor, fontSize: '12px', marginBottom: '20px' }}>
                  {passwordValidationMessage}
                </div>
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

          
          {/* 로그인 탭 */}
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
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginErrorMessage(''); // 이메일 입력 시 에러 메시지 초기화
                  }}
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
                    marginBottom: '8px',
                  }}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginErrorMessage(''); // 비밀번호 입력 시 에러 메시지 초기화
                  }}
                />
                {/* 로그인 실패 에러 메시지 */}
                {loginErrorMessage && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    {loginErrorMessage}
                  </div>
                )}
              </div>

              {/* 로그인 유지 체크박스와 비밀번호 찾기 링크 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ marginRight: '5px' }}
                  />
                  로그인 유지
                </label>
                <span
                  style={{
                    color: '#0000EE',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                  onClick={() => setShowForgotPasswordModal(true)}
                >
                  비밀번호 찾기
                </span>
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


        {/* 비밀번호 찾기 모달 */}
        {showForgotPasswordModal && (
          <div style={{
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
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              padding: '40px',
              width: '400px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '1px',
                right: '10px',
                cursor: 'pointer',
                fontSize: '24px',
              }} onClick={() => setShowForgotPasswordModal(false)}>
                &times;
              </div>
              <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '20px', fontWeight: 'bold' }}>비밀번호 찾기</h2>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Email address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  placeholder='이메일을 입력해주세요.'
                  onChange={(e) => { setForgotEmail(e.target.value); setForgotEmailError(''); }}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                {forgotEmailError && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{forgotEmailError}</div>
                )}
              </div>
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
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:8083/api/auth/forgot-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: forgotEmail }),
                    });
                    if (response.ok) {
                      setShowForgotPasswordModal(false);
                      setShowResetPasswordModal(true);
                    } else {
                      const errorText = await response.text();
                      if (errorText === "존재하지 않는 이메일입니다.") {
                        setForgotEmailError("이메일이 존재하지 않습니다");
                      } else {
                        setForgotEmailError("오류가 발생했습니다");
                      }
                    }
                  } catch (error) {
                    console.error("Forgot Password Error:", error);
                    setForgotEmailError("오류가 발생했습니다");
                  }
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 비밀번호 수정 모달 */}
        {showResetPasswordModal && (
          <div style={{
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
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              padding: '40px',
              width: '400px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '1px',
                right: '10px',
                cursor: 'pointer',
                fontSize: '24px',
              }} onClick={() => setShowResetPasswordModal(false)}>
                &times;
              </div>
              <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '20px', fontWeight: 'bold' }}>비밀번호 재설정</h2>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>새 비밀번호</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewPassword(value);
                    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
                    if (passwordRegex.test(value)) {
                      setNewPasswordValidationMessage('사용 가능한 비밀번호입니다.');
                      setNewPasswordValidationColor('blue');
                    } else {
                      setNewPasswordValidationMessage('영문 대소문자/숫자/특수문자를 혼용하여 8~16자 입력해주세요.');
                      setNewPasswordValidationColor('red');
                    }
                  }}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <div style={{ color: newPasswordValidationColor, fontSize: '12px', marginTop: '4px' }}>
                  {newPasswordValidationMessage}
                </div>
              </div>
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
                  // 비밀번호 재설정 API 호출 등 추가 로직 필요 시 여기에 구현
                  alert("비밀번호가 재설정되었습니다.");
                  setShowResetPasswordModal(false);
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}



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
                width: '400px',
              }}
            >
              {/* 닫기 버튼 */}
              <div
                style={{
                  position: 'absolute',
                  top: '1px',
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
                  width: '100px',
                  marginBottom: '30px',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
              <h2
                style={{
                  fontSize: '18px',
                  marginBottom: '30px',
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
                  padding: '10px',
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
