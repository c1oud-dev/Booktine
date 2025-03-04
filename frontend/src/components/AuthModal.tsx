import React, { useState } from 'react';

interface AuthModalProps {
  isSignUp: boolean;             // 처음 열릴 때 Sign Up 탭인지, Log In 탭인지
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isSignUp, onClose }) => {
  // 탭 상태
  const [activeTab, setActiveTab] = useState(isSignUp ? 'signup' : 'login');

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
      {/* 모달 박스 */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '10px',
          width: '400px',
          padding: '20px',
          position: 'relative',
        }}
      >
        {/* 닫기 버튼 (우상단) */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '20px',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          &times;
        </div>

        {/* 탭 (Sign up / Log in) */}
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '10px',
              cursor: 'pointer',
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
              backgroundColor: activeTab === 'login' ? '#000' : '#ddd',
              color: activeTab === 'login' ? '#fff' : '#000',
            }}
            onClick={() => setActiveTab('login')}
          >
            Log in
          </div>
        </div>

        {/* 탭별 폼 */}
        {activeTab === 'signup' ? (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign up</h2>
            {/* First name / Last name */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input type="text" placeholder="First name" style={{ flex: 1 }} />
              <input type="text" placeholder="Last name" style={{ flex: 1 }} />
            </div>
            {/* Email / Password */}
            <input
              type="email"
              placeholder="Email address"
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <input
              type="password"
              placeholder="Password"
              style={{ width: '100%', marginBottom: '20px' }}
            />
            {/* Sign up 버튼 */}
            <button
              style={{
                width: '100%',
                backgroundColor: '#ddd',
                border: 'none',
                borderRadius: '4px',
                padding: '12px',
                cursor: 'pointer',
              }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Log in</h2>
            {/* Email / Password */}
            <input
              type="email"
              placeholder="Email address"
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <input
              type="password"
              placeholder="Password"
              style={{ width: '100%', marginBottom: '20px' }}
            />
            {/* Log in 버튼 */}
            <button
              style={{
                width: '100%',
                backgroundColor: '#ddd',
                border: 'none',
                borderRadius: '4px',
                padding: '12px',
                cursor: 'pointer',
              }}
            >
              Log in
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;