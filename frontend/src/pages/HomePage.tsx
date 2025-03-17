import React, { useEffect, useState } from 'react';

const HomePage: React.FC = () => {
  const username = localStorage.getItem('username');

  // (1) 연간 목표/달성 수 상태
  const [yearlyGoal, setYearlyGoal] = useState(0);
  const [yearlyAchieved, setYearlyAchieved] = useState(0);
  // 모달 열림/닫힘
  const [showGoalModal, setShowGoalModal] = useState(false);
  // 모달에서 입력받을 임시 목표값
  const [tempGoalValue, setTempGoalValue] = useState('');

  useEffect(() => {
    // 예: localStorage에서 가져오기
    const storedGoal = localStorage.getItem('yearlyGoal');
    const storedAchieved = localStorage.getItem('yearlyAchieved');
    if (storedGoal) {
      setYearlyGoal(parseInt(storedGoal, 10));
    }
    if (storedAchieved) {
      setYearlyAchieved(parseInt(storedAchieved, 10));
    }

    // 또는 /progress API를 fetch하여 setYearlyGoal, setYearlyAchieved 할 수도 있음
  }, []);

  function handleGoalSubmit() {
    // (1) 숫자 파싱
    const newGoal = parseInt(tempGoalValue, 10) || 0;
    if (newGoal <= 0) {
      alert('1 이상의 숫자를 입력하세요.');
      return;
    }
  
    // (2) localStorage 저장 (ProgressPage 등에서 동일 참조 가능)
    localStorage.setItem('yearlyGoal', String(newGoal));
  
    // (3) HomePage의 yearlyGoal 상태 갱신
    setYearlyGoal(newGoal);
  
    // (4) 모달 닫기
    setShowGoalModal(false);
  
    // (5) 필요 시, yearlyAchieved 초기화 등 추가 처리 가능
    // localStorage.setItem('yearlyAchieved', '0');
  }


  return (
    // 전체 페이지 래퍼
    <div
      style={{
        minWidth: '1200px',
        minHeight: '100vh',
        background: "url('/Main.jpg') center center / cover no-repeat",
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          width: '1200px',
          margin: '0 auto',
        }}
      >

        {/* 2x2 카드 레이아웃 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '100px',
            marginTop: '100px',
            marginLeft: '50px',
            marginRight: '50px'
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
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  padding: '25px',
                  height: '100%',
                  position: 'relative'
                }}
              >
                <h3 style={{ marginBottom: '30px', fontWeight: 'bold', fontSize: '18px' }}>올해 목표</h3>

                {/* (A) 목표 미설정 vs 설정됨 분기 */}
                {yearlyGoal === 0 ? (
                  <div 
                  style={{
                    display: 'flex',        // 전체를 세로 방향으로 배치
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '20px',
                    marginLeft: '35px'
                  }}
                >
                  {/* (A) 위쪽: 도넛 (왼) + 안내/버튼 (오른) 가로 배치 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '30px',
                      
                    }}
                  >
                    {/* 왼쪽: 0% 도넛 */}
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        border: '10px solid #E0E0E0',
                        borderRadius: '50%',
                        position: 'relative',
                        
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '18px',
                          fontWeight: 'bold',
                        }}
                      >
                        0%
                      </div>
                    </div>


                    {/* 오른쪽: 안내 문구 및 목표 설정 버튼 */}
                    <div style={{ textAlign: 'center', marginLeft: '10px' }}>
                      <p style={{ marginBottom: '20px', color: '#333', fontSize: '14px', lineHeight: '1.4' }}>
                        아직 목표가 설정되지 않았어요!<br />
                        올해 목표를 설정하고 달성해보세요!
                      </p>
                      <button style={{
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 24px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                        onClick={() => { 
                          setShowGoalModal(true); // 모달 열기
                         }}
                      >
                        목표 설정
                      </button>
                    </div>
                  </div>

                  {/* (B) 아래쪽: 달성 / 목표 레전드 */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '30px',
                    }}
                  >
                    {/* 달성 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#000', // 달성 색
                        }}
                      />
                      <span style={{ fontSize: '14px' }}>달성</span>
                    </div>

                    {/* 목표 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#A0A0A0', // 목표 색
                        }}
                      />
                      <span style={{ fontSize: '14px' }}>목표</span>
                    </div>
                  </div>
                </div>
                ) : (
                /* ── 목표 설정됨 UI ── */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '20px',
                    marginLeft: '35px'
                  }}
                >
                  {/* (A) 도넛 (왼쪽) + 정보영역 (오른쪽) 가로 배치 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '30px',
                    }}
                  >
                    {/* 왼쪽: 달성률 도넛 */}
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      border: '10px solid #F0F0F0',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '18px',
                        fontWeight: 'bold',
                      }}>
                        {Math.round((yearlyAchieved / yearlyGoal) * 100)}%
                      </div>
                    </div>

                    {/* 오른쪽: 목표/달성/남은 책 정보 + 응원 문구 */}
                    <div style={{ textAlign: 'left' }}>
                      <div style={{
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        padding: '14px 18px',
                        marginBottom: '10px',
                        width: '180px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span>목표</span>
                          <span>{yearlyGoal}권</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span>달성</span>
                          <span>{yearlyAchieved}권</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>남은 책</span>
                          <span>{yearlyGoal - yearlyAchieved}권</span>
                        </div>
                      </div>
                      <p style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        "지금 페이스를 유지하면 목표 달성 가능해요! <span role="img" aria-label="muscle">💪</span>"
                      </p>
                    </div>
                  </div>

                  {/* (B) 아래쪽: 달성 / 목표 레전드 */}
                  <div style={{ display: 'flex', gap: '30px' }}>
                    {/* 달성 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#000', // 달성 색
                        }}
                      />
                      <span style={{ fontSize: '14px' }}>달성</span>
                    </div>
                    {/* 목표 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#A0A0A0', // 목표 색
                        }}
                      />
                      <span style={{ fontSize: '14px' }}>목표</span>
                    </div>
                  </div>
                </div>

                )}
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

      {showGoalModal && (
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
              padding: '20px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* 닫기 X 버튼 */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                cursor: 'pointer',
                fontSize: '20px',
              }}
              onClick={() => setShowGoalModal(false)}
            >
              &times;
            </div>

            <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>
              올해 완독할 책의 수를 입력하세요.
            </p>

            <input
              type="number"
              value={tempGoalValue}
              onChange={(e) => setTempGoalValue(e.target.value)}
              placeholder="Value"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                marginBottom: '20px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />

            {/* 버튼들 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={() => setShowGoalModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={handleGoalSubmit} // 아래 함수 참고
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;
