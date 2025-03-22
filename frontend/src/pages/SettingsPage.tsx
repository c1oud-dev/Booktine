import React, { useState, useEffect } from 'react';

const SettingsPage: React.FC = () => {
  // 예시: 사용자 정보 state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [profileImage, setProfileImage] = useState('/default_gray.png');
  const [postCount, setPostCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [displayFirstName, setDisplayFirstName] = useState('');
  const [displayLastName, setDisplayLastName] = useState('');
  const [displayAboutMe, setDisplayAboutMe] = useState('');

  // 업로드 버튼 클릭 시 (실제 업로드 로직은 생략)
  const handleUploadNewProfile = () => {
    alert('새 프로필 이미지를 업로드하는 로직을 구현하세요.');
  };

  // 저장/취소 버튼
  const handleSave = () => {
    // 비밀번호 입력 확인
  if (password.trim() === '') {
    alert('변경 사항을 저장하려면 현재 비밀번호를 입력해주세요.');
    return;
  }

    // 저장할 데이터 payload 구성 (필요한 필드 추가)
    const payload = {
      firstName,
      lastName,
      aboutMe,
      // 다른 수정할 필드가 있으면 추가
      passwordConfirmation: password, // 비밀번호 확인 필드
    };

    // API 요청 (PUT 방식으로 업데이트)
    fetch(`http://localhost:8083/api/settings/${email}`, {
      method: 'PUT', // 백엔드에서 업데이트 방식에 맞게 수정 (PUT 혹은 POST)
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    .then((res) => {
      // 실패 시 문자열로 에러 메시지 받아서 예외 처리
      if (!res.ok) {
        return res.text().then((errorMessage) => {
          throw new Error(errorMessage);
        });
      }
      return res.json();
    })
    .then((updatedUser) => {
      // 3) localStorage 갱신 → Header에서 username을 새로고침 후 반영
      localStorage.setItem('username', updatedUser.firstName + updatedUser.lastName);

      // display 상태 업데이트(페이지 새로고침 전 화면에 반영 가능)
      setDisplayFirstName(updatedUser.firstName);
      setDisplayLastName(updatedUser.lastName);
      setDisplayAboutMe(updatedUser.aboutMe);

      // 4) 페이지 새로고침
      window.location.reload();
    })
    .catch((err) => {
      console.error('Error saving settings:', err);
      alert(err.message);
    });
  };



  const handleCancel = () => {
    alert('Cancel clicked. 변경사항 취소 로직을 구현하세요.');
  };



  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (!storedEmail) {
      console.error('No email found in localStorage');
      return;
    }
    fetch(`http://localhost:8083/api/settings/${storedEmail}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user settings');
        return res.json();
      })
      .then((data) => {
        console.log('Fetched user settings:', data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setDisplayFirstName(data.firstName || '');
        setDisplayLastName(data.lastName || '');
        setEmail(data.email || '');
        setPassword('');
        setAboutMe(data.aboutMe || '');
        setDisplayAboutMe(data.aboutMe || '');
        setProfileImage(data.avatarUrl || '/default_gray.png');
        setPostCount(data.postCount || 0);
        setCompletedCount(data.completedCount || 0);
      })
      .catch((err) => console.error('Error fetching user settings:', err));
  }, []);
  

  
  


  return (
    <div style={{backgroundColor: '#f5f5f5',}}>
    <div
      style={{
        maxWidth: '1200px',
          padding: '100px 60px',
          margin: '0 auto',
          minHeight: '100vh',
      }}
    >
      {/* 상단 영역: Settings 제목 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
      }}
    >
      <h2 style={{ fontWeight: 'bold', fontSize: '40px', margin: 0 }}>Settings</h2>
    </div>
    <hr style={{ border: '1px solid #000', marginBottom: '40px' }} />

    <div
      style={{
        display: 'flex',
        gap: '60px',
      }}
    >
      {/* 왼쪽: 프로필 섹션 */}
      <div style={{ width: '300px' }}>
        {/* 프로필 이미지 */}
        <div
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '20px auto 20px auto',
            border: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ color: '#999' }}>No Image</div>
          )}
        </div>

        {/* 이름 */}
        <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
        {displayFirstName + displayLastName}
        </div>

        {/* 소개 문구 */}
        <div style={{ textAlign: 'center', fontSize: '14px', color: '#777', marginBottom: '20px' }}>
          {displayAboutMe}
        </div>

        {/* 게시물 수 / 완독 책 수 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#333',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{postCount}</div>
            <div>게시물</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{completedCount}</div>
            <div>완독한 책</div>
          </div>
        </div>

        {/* 업로드 버튼 */}
        <button
          onClick={handleUploadNewProfile}
          style={{
            display: 'block',
            margin: '0 auto',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '20px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Upload new profile
        </button>
      </div>

      {/* 오른쪽: 기본 정보 (폼) 섹션 */}
      <div style={{ flex: 1 }}>
        {/* 상단: BASIC INFO + Cancel/Save 버튼 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '20px' }}>BASIC INFO</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCancel}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              SAVE
            </button>
          </div>
        </div>

        <hr style={{ border: '0.5px solid #ccc', marginBottom: '20px', width: '100%' }} />

        {/* 폼 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* First Name */}
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
                FIRST NAME
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Last Name */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
                LAST NAME
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginBottom: '20px'
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              disabled //변경 불가
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
                marginBottom: '20px'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '20px'
              }}
            />
          </div>

          {/* ABOUT ME */}
          <div style={{ width: '100%' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
              ABOUT ME
            </label>
            <hr style={{ border: '0.5px solid #ccc', margin: '20px 0' }} />
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              style={{
                width: '100%',
                height: '80px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  );
};

export default SettingsPage;
