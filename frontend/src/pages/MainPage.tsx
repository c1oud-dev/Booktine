import React from 'react';

const MainPage: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 60px)', // 헤더 높이 제외
        background: 'url(/main.jpg) no-repeat left top / cover', 
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
          onClick={() => {
            // 원한다면 여기서 바로 모달 열기 또는 /login 페이지 이동
          }}
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default MainPage;

