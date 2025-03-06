import React from 'react';

const HomePage: React.FC = () => {
  const username = localStorage.getItem('username');

  return (
    // 전체 페이지 래퍼
    <div
      style={{
        // 배경 이미지 설정
        background: "url('/Main.jpg') center center / cover no-repeat",
        minHeight: '100vh', // 세로 길이 화면 꽉 채우기
        paddingTop: '50px',
        paddingLeft: '200px',
        paddingRight: '200px',
        paddingBottom: '50px'
      }}
    >
      {/* 상단 타이틀 */}
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        Welcome, {username || 'User'}!
      </h2>

      {/* 2x2 카드 레이아웃 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '100px',
        }}
      >

        {/* (1) 목표 관리 제목 + 카드 컨테이너 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 카드 위에 배치된 제목 */}
          <h3 style={{ 
            margin: 0,
            fontWeight: 'bold', 
            fontSize: '20px'
          }}>목표 관리</h3>

          {/* 바깥쪽(회색 반투명) */}
          <div
            style={{
              backgroundColor: 'rgba(128,128,128,0.2)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            {/* 안쪽(흰색) */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '20px',
                height: '100%',
              }}
            >
              <p>이곳에 목표 관련 내용을 표시</p>
              <button>예시 버튼</button>
            </div>
          </div>
        </div>


	      {/* (2) 통계 제목 + 카드 컨테이너 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 카드 위에 배치된 제목 */}
          <h3 style={{ 
            margin: 0,
            fontWeight: 'bold', 
            fontSize: '20px'
          }}>통계</h3>

          {/* 바깥쪽(회색 반투명) */}
          <div
            style={{
              backgroundColor: 'rgba(128,128,128,0.2)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            {/* 안쪽(흰색) */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '20px',
                height: '100%',
              }}
            >
	            <p>독서 진행률 등 각종 통계 표시</p>
            </div>
          </div>
        </div>


        {/* (3) 독서 기록 카드 + 카드 컨테이너 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 카드 위에 배치된 제목 */}
          <h3 style={{ 
            margin: 0,
            fontWeight: 'bold', 
            fontSize: '20px'
          }}>독서 기록</h3>

          {/* 바깥쪽(회색 반투명) */}
          <div
            style={{
              backgroundColor: 'rgba(128,128,128,0.2)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            {/* 안쪽(흰색) */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '20px',
                height: '100%',
              }}
            >
	            <p>독서 진행률 등 각종 통계 표시</p>
            </div>
          </div>
        </div>


        {/* (4) 추천 도서 카드 + 카드 컨테이너 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* 카드 위에 배치된 제목 */}
          <h3 style={{ 
            margin: 0,
            fontWeight: 'bold', 
            fontSize: '20px'
          }}>추천 도서</h3>

          {/* 바깥쪽(회색 반투명) */}
          <div
            style={{
              backgroundColor: 'rgba(128,128,128,0.2)',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            {/* 안쪽(흰색) */}
            <div
              style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '20px',
                height: '100%',
              }}
            >
	            <p>사용자 취향에 맞는 도서 추천</p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default HomePage;
