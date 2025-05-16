import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


interface AuthModalProps {
  isSignUp: boolean; // 처음 열릴 때 Sign Up 탭인지, Log In 탭인지
  onClose: () => void;
  onLoginSuccess?: (nickname: string) => void; // 로그인 성공 시 호출되는 콜백 (nickname 전달)
}


const AuthModal: React.FC<AuthModalProps> = ({ isSignUp, onClose, onLoginSuccess }) => {
  const navigate = useNavigate();

  // 현재 탭 상태
  const [activeTab, setActiveTab] = useState(isSignUp ? 'signup' : 'login');
  
  const [emailValidationMessage, setEmailValidationMessage] = useState('');
  const [emailValidationColor, setEmailValidationColor] = useState('');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('영문 대소문자/숫자/특수문자를 혼용하여 8~16자 입력해주세요.');
  const [passwordValidationColor, setPasswordValidationColor] = useState('red');
  const [nickname, setNickname] = useState('');
  const [nicknameCheckedStatus, setNicknameCheckedStatus] = useState(''); 
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('');
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
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
  const [isResetPasswordVisible, setIsResetPasswordVisible] = useState(false);
  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false);


  // 입력값 상태
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [isSignUpPasswordVisible, setIsSignUpPasswordVisible] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 회원가입 성공 관련 상태
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 버튼 활성화 여부
  const isSignUpDisabled =
    !nickname.trim() ||
    !signUpEmail.trim() ||
    !signUpPassword.trim() ||
    !isEmailChecked ||
    !isPasswordValid ||
    !isNicknameChecked;


  const isLoginDisabled =
    !loginEmail.trim() ||
    !loginPassword.trim();

  // ▼ 로그인 API 요청 핸들러 추가
  const handleLogin = async () => {
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
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
      localStorage.setItem('nickname', result.nickname);
      localStorage.setItem('profileImage', result.avatarUrl || '/default_avatar.png');

  
      if (onLoginSuccess) {
        onLoginSuccess(result.nickname || '');
      }
      window.dispatchEvent(new Event('profileImageUpdated'));
      onClose();
      navigate('/home');
    } catch (error) {
      console.error('Login Error:', error);
      setLoginErrorMessage("이메일이나 암호를 다시 한번 확인해주세요.");
    }
  };
  
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 입력 시 필터링 없이 그대로 저장
    setNickname(e.target.value);
    // 입력할 때마다 중복 체크 상태 초기화
    setNicknameCheckedStatus('');
    setNicknameCheckMessage('');
  };

  const validateNickname = (value: string) => {
    const allowedRegex = /^[a-zA-Z가-힣0-9]+$/;
    if (!allowedRegex.test(value)) {
      return false;
    }
    if (/^[가-힣]+$/.test(value)) {
      return value.length <= 8;
    } else {
      return value.length <= 14;
    }
  };
  

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignUpEmail(value);
    // 이메일 형식 정규식 (기본적인 형식 검사)
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(value)) {
      setEmailValidationMessage("유효한 이메일 형식이 아닙니다.");
      setEmailValidationColor("red");
    } else {
      setEmailValidationMessage("");
    }
    // 중복 확인 상태 초기화
    // setIsEmailChecked(false);  // 만약 중복확인 상태를 사용 중이라면 포함
  };

  // 회원가입 API 요청 핸들러
  // [수정]
  const handleSignUp = async () => {
    try {
      const response = await fetch(`/api/auth/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          email: signUpEmail,
          password: signUpPassword,
        }),
      });
      const result = await response.text();
      setSuccessMessage(result);
      setSignUpSuccess(true);

      // ─────────────────────────────
      // 자동 로그인 호출
      const loginRes = await fetch(`/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:    signUpEmail,
          password: signUpPassword,
        }),
      });
      if (!loginRes.ok) {
        console.error('Auto-login failed:', loginRes.statusText);
        return;
      }
      const userData = await loginRes.json();
      localStorage.setItem('email',    userData.email);
      localStorage.setItem('nickname', userData.nickname);

      // 탭을 로그인으로 전환하거나, 모달 닫고 홈으로 이동
      setActiveTab('login');            // 로그인 탭 열기
      setLoginEmail(signUpEmail);       // 입력란 자동 채움
      setLoginPassword(signUpPassword);
      // or, 바로 홈으로
      // onClose();
      // navigate('/home');
      // ─────────────────────────────
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

              {/* Nickname 입력 필드 (공백, 특수문자 불가 – 한글/영문만 허용) */}
              {/*한글만 입력된 경우 최대 8자, 영문 또는 혼용은 최대 14자까지 허용 */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>
                  Nickname
                </label>
                <div style={{ display: 'flex' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      placeholder="닉네임을 입력해주세요"
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 12px',  // 오른쪽 패딩을 40px로 지정해 아이콘 공간 확보
                        border: `1px solid ${
                          nicknameCheckedStatus === "success"
                            ? "green"
                            : (nicknameCheckedStatus === "duplicate" || nicknameCheckedStatus === "invalid")
                            ? "red"
                            : "#ccc"
                        }`,
                        borderRadius: '4px'
                      }}
                      value={nickname}
                      onChange={handleNicknameChange}
                    />
                    {nicknameCheckedStatus && (
                      <img
                        src={nicknameCheckedStatus === "success" ? "check_icon.png" : "caution_icon.png"}
                        alt="validation icon"
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '20px',
                          height: '20px',
                          pointerEvents: 'none'
                        }}
                      />
                    )}
                  </div>
                  <button
                    style={{
                      marginLeft: '8px',
                      height: '50px',
                      lineHeight: '40px',
                      padding: '0 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#000',
                      color: '#fff',
                    }}
                    onClick={async () => {
                      // 먼저 조건 검사
                      if (!validateNickname(nickname)) {
                        setNicknameCheckedStatus("invalid");
                        setNicknameCheckMessage("조건이 불충분합니다.");
                        setIsNicknameChecked(false);
                        return;
                      }
                      try {
                        const response = await fetch(
                          `/api/auth/check-nickname?nickname=${nickname}`,
                          {
                            credentials: 'include'
                          }
                        );
                        if (response.ok) {
                          setNicknameCheckedStatus("success");
                          setNicknameCheckMessage("사용 가능한 닉네임입니다.");
                          setIsNicknameChecked(true); // 조건 만족 시 상태 업데이트
                        } else {
                          setNicknameCheckedStatus("duplicate");
                          setNicknameCheckMessage("중복된 닉네임입니다.");
                          setIsNicknameChecked(false);
                        }
                      } catch (error) {
                        console.error("Nickname check error:", error);
                        setNicknameCheckedStatus("duplicate");
                        setNicknameCheckMessage("중복 확인에 실패했습니다.");
                        setIsNicknameChecked(false);
                      }
                    }}
                  >
                    중복 확인
                  </button>
                </div>
                {/* 조건 메시지 영역 */}
                <div style={{ marginTop: '4px' }}>
                  {nicknameCheckedStatus === "success" ? (
                    // 조건 만족 & 중복 확인 성공 시: 기본 조건 문구 대신 사용 가능 문구 출력 (파란색)
                    <p style={{ margin: 0, fontSize: '12px', color: 'green' }}>
                      {nicknameCheckMessage}
                    </p>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontSize: '12px', color: 'red' }}>
                        - 한글 8자, 영문 14자까지 입력 가능
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'red' }}>
                        - 공백, 특수문자 불가능
                      </p>
                      {(nicknameCheckedStatus === "duplicate" || nicknameCheckedStatus === "invalid") && (
                        <p style={{ margin: 0, fontSize: '12px', color: 'red' }}>
                          - {nicknameCheckMessage}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>



              {/* Email */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Email address</label>
                <div style={{ display: 'flex' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="email"
                      placeholder="이메일을 입력해주세요."
                      style={{
                        width: '100%',
                        padding: '12px 40px 12px 12px',  // 오른쪽 패딩 조정
                        border: `1px solid ${
                          isEmailChecked
                            ? "green"
                            : (emailValidationMessage && emailValidationColor === "red")
                            ? "red"
                            : "#ccc"
                        }`,
                        borderRadius: '4px',
                        marginBottom: '4px',
                      }}
                      value={signUpEmail}
                      onChange={handleEmailChange}
                    />
                    {(isEmailChecked || (emailValidationMessage && emailValidationColor === "red")) && (
                      <img
                        src={isEmailChecked ? "check_icon.png" : "caution_icon.png"}
                        alt="validation icon"
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '20px',
                          height: '20px',
                          pointerEvents: 'none'
                        }}
                      />
                    )}
                  </div>
                  <button
                    style={{
                      marginLeft: '8px',
                      height: '50px',
                      lineHeight: '40px',
                      padding: '0 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#000',
                      color: '#fff',
                    }}
                    onClick={async () => {
                      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
                      if (!emailRegex.test(signUpEmail)) {
                        setEmailValidationMessage("유효한 이메일 형식이 아닙니다.");
                        setEmailValidationColor("red");
                        setIsEmailChecked(false);
                        return;
                      }
                      try {
                        const response = await fetch(`/api/auth/check-email?email=${signUpEmail}`,
                          {
                            credentials: 'include'
                          }
                        );
                        if (response.ok) {
                          setEmailValidationMessage("사용 가능한 이메일입니다.");
                          setEmailValidationColor("green");
                          setIsEmailChecked(true); // 상태 업데이트 추가
                        } else {
                          setEmailValidationMessage("중복된 이메일입니다.");
                          setEmailValidationColor("red");
                          setIsEmailChecked(false);
                        }
                      } catch (error) {
                        console.error('Email check error:', error);
                        setIsEmailChecked(false);
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
                <div style={{ position: 'relative' }}>
                  <input
                    type={isSignUpPasswordVisible ? "text" : "password"}
                    placeholder="비밀번호를 입력해주세요."
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 12px',
                      border: `1px solid ${signUpPassword ? (isPasswordValid ? "green" : "red") : "#ccc"}`,
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
                        setPasswordValidationColor('green');
                        setIsPasswordValid(true);
                      } else {
                        setPasswordValidationMessage('영문 대소문자/숫자/특수문자를 혼용하여 8~16자 입력해주세요.');
                        setPasswordValidationColor('red');
                        setIsPasswordValid(false);
                      }
                    }}
                  />
                  <img
                    src={isSignUpPasswordVisible ? "show_icon.png" : "hide_icon.png"}
                    alt="toggle password"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '45%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setIsSignUpPasswordVisible(!isSignUpPasswordVisible)}
                  />
                </div>
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
                  placeholder='이메일을 입력해주세요.'
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
                <label style={{ display: 'block', marginBottom: '4px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={isLoginPasswordVisible ? "text" : "password"}
                    placeholder="비밀번호를 입력해주세요."
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginErrorMessage('');
                    }}
                  />
                  <img
                    src={isLoginPasswordVisible ? "show_icon.png" : "hide_icon.png"}
                    alt="toggle password"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '45%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setIsLoginPasswordVisible(!isLoginPasswordVisible)}
                  />
                </div>
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
                  marginTop: '10px'
                }}
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/auth/forgot-password`, {
                      method: 'POST',
                      credentials: 'include',
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
                <div style={{ position: 'relative' }}>
                  <input
                    type={isResetPasswordVisible ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewPassword(value);
                      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
                      if (passwordRegex.test(value)) {
                        setNewPasswordValidationMessage('사용 가능한 비밀번호입니다.');
                        setNewPasswordValidationColor('green');
                      } else {
                        setNewPasswordValidationMessage('영문 대소문자/숫자/특수문자를 혼용하여 8~16자 입력해주세요.');
                        setNewPasswordValidationColor('red');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 12px',
                      border: `1px solid ${newPassword ? (newPasswordValidationColor === 'green' ? "green" : "red") : "#ccc"}`,
                      borderRadius: '4px'
                    }}
                  />
                  <img
                    src={isResetPasswordVisible ? "show_icon.png" : "hide_icon.png"}
                    alt="toggle password"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setIsResetPasswordVisible(!isResetPasswordVisible)}
                  />
                </div>
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
                  marginTop: '10px'
                }}
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/auth/reset-password`, {
                      method: 'POST',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: forgotEmail,
                        newPassword: newPassword,
                      }),
                    });
                    if (!response.ok) {
                      alert("비밀번호 재설정에 실패했습니다.");
                      return;
                    }
                    const result = await response.text();
                    alert(result);
                    setShowResetPasswordModal(false);
                  } catch (error) {
                    console.error("Reset Password Error:", error);
                    alert("비밀번호 재설정 중 오류가 발생했습니다.");
                  }
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
                src={`${process.env.PUBLIC_URL}/success_icon.png`}
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
