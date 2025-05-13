import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const BASE_URL = process.env.REACT_APP_API_URL!;


const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  // 예시: 사용자 정보 state
  const [nickname, setNickname] = useState('');
  const [displayNickname, setDisplayNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [profileImage, setProfileImage] = useState(`${process.env.PUBLIC_URL}/default_avatar.png`);
  
  const [postCount, setPostCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [displayAboutMe, setDisplayAboutMe] = useState('');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletionPassword, setDeletionPassword] = useState('');
  const [deletionError, setDeletionError] = useState('');
  const [deletionComplete, setDeletionComplete] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [originalData, setOriginalData] = useState({
    nickname: '',
    aboutMe: '',
    profileImage: '/default_avatar.png'
  });


  // 회원 탈퇴 확인 처리 함수
const confirmDeleteAccount = async () => {
  if (deletionPassword.trim() === '') {
    setDeletionError("비밀번호를 입력해주세요.");
    return;
  }
  const email = localStorage.getItem('email');
  if (!email) {
    setDeletionError("로그인이 필요합니다.");
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}/api/auth/delete-account?email=${email}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletionPassword }),
      credentials: 'include'
    });
    if (!res.ok) {
      setDeletionError("비밀번호가 옳지 않습니다. 암호를 다시 확인해주세요.");
      return;
    }
    // 성공 시
    setDeletionComplete(true);
    // 탈퇴 시 연관된 게시물 목록 초기화용 이벤트
    window.dispatchEvent(new Event('postsUpdated'));
    localStorage.removeItem('email');
    localStorage.removeItem('nickname');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('goalEmail');            // 추가: 목표 관련 구분 키 삭제
    localStorage.removeItem('yearlyGoal');             // 추가: 기본 연간 목표 삭제
    localStorage.removeItem('yearlyAchieved');         // 추가: 달성 수 삭제
    localStorage.removeItem('monthlyGoal');            // 추가: 기본 월간 목표 삭제
    const currentYear = new Date().getFullYear();
    localStorage.removeItem(`yearlyGoal_${currentYear}`); // 추가: 연도별 연간 목표 삭제
    for (let m = 1; m <= 12; m++) {                       // 추가: 월별 목표 삭제
      localStorage.removeItem(`monthlyGoal_${currentYear}_${m}`);
    }
    // 탈퇴 후 메인(또는 로그인) 페이지로 이동
    navigate('/');
  } catch (error) {
    console.error(error);
    setDeletionError("회원 탈퇴에 실패했습니다.");
  }
};

  // 업로드 버튼 클릭 시 (실제 업로드 로직은 생략)
  const handleUploadNewProfile = () => {
    document.getElementById('profile-file-input')?.click();
  };

  const [showDeleteButton, setShowDeleteButton] = useState(false);
  
  const handleDeleteProfileImage = async () => {
    const email = localStorage.getItem('email');
    if (!email) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/settings/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // 오직 avatarUrl만 업데이트하도록 수정 (passwordConfirmation 미포함)
        body: JSON.stringify({ avatarUrl: '/default_avatar.png' }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('프로필 사진 삭제 실패');
  
      setProfileImage(`${process.env.PUBLIC_URL}/default_avatar.png`);
      localStorage.setItem('profileImage', '/default_avatar.png');
      localStorage.setItem('profileImage', `${process.env.PUBLIC_URL}/default_avatar.png`);
      window.dispatchEvent(new Event('profileImageUpdated'));
      alert('프로필 사진이 삭제되었습니다.');
    } catch (error) {
      console.error(error);
      alert('프로필 사진 삭제에 실패했습니다.');
    }
  };
  

  // 파일 업로드 후 응답 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('email', email);
      formData.append('profileImage', file);

      try {
        const res = await fetch(`${BASE_URL}/upload-profile`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        if (!res.ok) throw new Error('프로필 사진 업로드 실패');

        const data = await res.json();
        const uploadedUrl = data.imageUrl;

        // 1) SettingsPage 프로필 이미지 갱신
        setProfileImage(uploadedUrl);
        // 2) 로컬스토리지나 글로벌 상태에 저장하여 Header 등에서도 불러오기
        localStorage.setItem('profileImage', uploadedUrl);
        window.dispatchEvent(new Event('profileImageUpdated'));

        alert('프로필 사진이 성공적으로 업로드되었습니다.');
      } catch (error) {
        console.error(error);
        alert('프로필 사진 업로드에 실패했습니다.');
      }
    }
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
      nickname,
      aboutMe,
      // 다른 수정할 필드가 있으면 추가
      passwordConfirmation: password, // 비밀번호 확인 필드
    };

    // API 요청 (PUT 방식으로 업데이트)
    fetch(`${BASE_URL}/api/settings/${email}`, {
      method: 'PUT', // 백엔드에서 업데이트 방식에 맞게 수정 (PUT 혹은 POST)
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include'
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
        // 3) localStorage 갱신 → Header에서 nickname을 새로고침 후 반영
        localStorage.setItem('nickname', updatedUser.nickname);

        // display 상태 업데이트(페이지 새로고침 전 화면에 반영 가능)
        setDisplayNickname(updatedUser.nickname);
        setDisplayAboutMe(updatedUser.aboutMe);

        // 4) 페이지 새로고침
        window.location.reload();
      })
      .catch((err) => {
        console.error('Error saving settings:', err);
        alert(err.message);
      });
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (!storedEmail) {
      console.error('No email found in localStorage');
      return;
    }
    fetch(`${BASE_URL}/api/settings/${storedEmail}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user settings');
        return res.json();
      })
      .then((data) => {
        console.log('Fetched user settings:', data);
        setNickname(data.nickname || '');
        setDisplayNickname(data.nickname || '');
        setEmail(data.email || '');
        setPassword('');
        setAboutMe(data.aboutMe || '');
        setDisplayAboutMe(data.aboutMe || '');
        setProfileImage(data.avatarUrl || '/default_avatar.png');
        setPostCount(data.postCount || 0);
        setCompletedCount(data.completedCount || 0);
        
        // 원본 데이터 저장
        setOriginalData({
          nickname: data.nickname || '',
          aboutMe: data.aboutMe || '',
          profileImage: data.avatarUrl || '/default_avatar.png'
        });
      })
      .catch((err) => console.error('Error fetching user settings:', err));
  }, []);

  const handleCancel = () => {
     // 원본 데이터로 폼 상태 복원
    setNickname(originalData.nickname);
    setDisplayNickname(originalData.nickname);
    setAboutMe(originalData.aboutMe);
    setDisplayAboutMe(originalData.aboutMe);
    setProfileImage(originalData.profileImage);
    setPassword('');
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', }}>
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
          <h2 style={{ fontWeight: 'bold', fontSize: '40px', margin: 0, color: '#434343' }}>Settings</h2>
        </div>
        <hr style={{ border: '1px solid #434343', marginBottom: '40px' }} />

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
                position: 'relative',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '30px auto 20px auto',
                border: '1px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={() => setShowDeleteButton(true)}
              onMouseLeave={() => setShowDeleteButton(false)}
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
              {showDeleteButton && (
                <button
                  onClick={handleDeleteProfileImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '5px 20px',
                    cursor: 'pointer',
                  }}
                >
                  삭제
                </button>
                )}
            </div>

            {/* 이름 */}
            <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              {displayNickname}
            </div>

            {/* 소개 문구 */}
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#777', marginBottom: '40px' }}>
              {displayAboutMe || '자기소개를 해주세요.'}
            </div>

            {/* 게시물 수 / 완독 책 수 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#333',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{postCount}</div>
                <div>총 게시물</div>
              </div>
              <div style={{ borderLeft: '2px solid #ccc', height: '40px', margin: '0 20px' }}></div>
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
                backgroundColor: '#6B705C',
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#fff',

              }}
            >
              Upload new Profile
            </button>
            <input
              id="profile-file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
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
                    backgroundColor: '#A5A58D',
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
              {/* Nickname*/}
              <div style={{ width: '100%', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
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
              <div style={{ width: '100%', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    paddingRight: '40px', // 아이콘 공간 확보
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginBottom: '20px'
                  }}
                />
                <img
                  src={isPasswordVisible ? "show_icon.png" : "hide_icon.png"}
                  alt={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '45%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ color: 'red', fontSize: '12px', marginTop: '-15px', marginBottom: '20px' }}>
                  암호를 입력한 후에 SAVE 버튼을 눌러주세요.
                </div>
              </div>


              {/* ABOUT ME */}
              <div style={{ width: '100%' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>
                  ABOUT ME
                </label>
                <hr style={{ border: '0.5px solid #ccc', margin: '20px 0' }} />
                <textarea
                  value={aboutMe}
                  placeholder='자기소개를 해주세요.'
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
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <span
                    style={{ cursor: 'pointer', color: '#0000EE', fontSize: '14px', textDecoration: 'underline', }}
                    onClick={() => {
                      setShowDeleteAccountModal(true);
                      setDeletionError('');
                      setDeletionPassword('');
                      setDeletionComplete(false);
                    }}
                  >
                    회원 탈퇴
                  </span>
                </div>
              </div>

              
            </div>

          </div>
          
          {showDeleteAccountModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}>
            <div style={{
                position: 'relative', // X 버튼을 위한 상대 포지션 적용
                backgroundColor: deletionComplete ? '#D8E8E2' : '#F4DADA',
                border: `2px solid ${deletionComplete ? '#BFD8CF' : '#E2BFBF'}`,
                borderRadius: '8px',
                padding: '30px',
                width: '380px',
                textAlign: 'center',
              }}>
              {/* X 버튼 (우측 상단) */}
              <button
                onClick={() => {
                  setShowDeleteAccountModal(false);
                  setDeletionPassword('');
                  setDeletionError('');
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                X
              </button>
                {!deletionComplete ? (
                  <>
                    {/* ───────────── 타이틀 + caution 아이콘 ───────────── */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      marginBottom: '14px',
                    }}>
                      <img src={`${process.env.PUBLIC_URL}/caution_icon.png`}
                      alt="caution" style={{ width: 24, height: 24 }} />
                      회원탈퇴를 진행하시겠습니까?
                    </div>

                    {/* 추가된 설명 문구 */}
                    <div style={{
                      fontSize: '13px',
                      color: '#555',
                      marginBottom: '20px',
                      lineHeight: '1.5',
                      textAlign: 'left',
                      marginLeft: '35px'
                    }}>
                      안전한 탈퇴를 위해 비밀번호를 다시 입력해주세요.<br />
                      탈퇴 후엔 모든 데이터가 즉시 삭제됩니다.<br />
                      삭제된 정보는 복구할 수 없습니다. 정말 탈퇴하시겠습니까?
                    </div>

                    <div style={{ position: 'relative', marginBottom: '10px' }}>
                      <input
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="비밀번호를 입력해주세요"
                        value={deletionPassword}
                        onChange={(e) => setDeletionPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 10px',  // 오른쪽에 아이콘 공간 확보
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                      <img
                        src={
                          isPasswordVisible
                            ? `${process.env.PUBLIC_URL}/show_icon.png`
                            : `${process.env.PUBLIC_URL}/hide_icon.png`
                        }
                        alt={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                        }}
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      />
                    </div>
                    {deletionError && (
                      <div style={{ color: 'red', fontSize: '13px', marginBottom: '20px' }}>
                        {deletionError}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        style={{
                          width: '70px',
                          backgroundColor: '#5B5F4A',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '5px',
                          cursor: 'pointer',
                          fontSize: '15px'
                        }}
                        onClick={confirmDeleteAccount}
                      >
                        확인
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ───────────── 완료 타이틀 + check 아이콘 ───────────── */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                      }}>
                      <img src={`${process.env.PUBLIC_URL}/check_icon.png`} 
                      alt="success" style={{ width: 24, height: 24 }} />
                      회원 탈퇴가 완료되었습니다.
                    </div>

                    <p style={{ marginBottom: '30px', fontSize: '15px', lineHeight: 1.5}}>
                      그동안 이용해주셔서 감사합니다.<br />
                      언제든 다시 돌아오신다면, <br />
                      더욱 발전된 모습으로 맞이하겠습니다.
                    </p>

                    <button
                      style={{
                        width: '140px',
                        backgroundColor: '#5B5F4A',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setShowDeleteAccountModal(false);
                        navigate('/');
                        window.location.reload(); // 로컬스토리지 삭제된 상태로 앱 다시 렌더링
                      }}
                    >
                      확인
                    </button>
                  </>
                )}
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
    
  );
};

export default SettingsPage;
