import React, { useState, useEffect } from 'react';
import AnnualLineChart from '../components/AnnualLineChart';
import MonthlyBarChart from '../components/MonthlyBarChart';
import GenreDoughnutChart from '../components/GenreDoughnutChart';

interface Post {
  id: number;
  readingStatus: '독서중' | '완독';
  endDate?: string; // 완독한 날짜 (ISO 형식)
  genre?: string;
}

const ProgressPage: React.FC = () => {
  // 포스트 데이터
  const [posts, setPosts] = useState<Post[]>([]);

  // 목표 및 달성 상태 (연간, 월간)
  const [yearlyGoal, setYearlyGoal] = useState(0);
  const [yearlyAchieved, setYearlyAchieved] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [monthlyAchieved, setMonthlyAchieved] = useState(0);

  // 차트 데이터 상태
  const [lineChartData, setLineChartData] = useState<{ month: string; count: number }[]>([]);
  const [barChartData, setBarChartData] = useState<{ month: string; goal: number; achieved: number }[]>([]);
  const [genreData, setGenreData] = useState<{ label: string; value: number }[]>([]);

  // Modal 관련 상태
  const [showYearlyGoalModal, setShowYearlyGoalModal] = useState(false);
  const [showMonthlyGoalModal, setShowMonthlyGoalModal] = useState(false);
  const [tempGoalValue, setTempGoalValue] = useState('');
  const [tempMonthlyGoalValue, setTempMonthlyGoalValue] = useState('');

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // 백엔드에서 게시글 가져오기
  useEffect(() => {
    fetch('http://localhost:8083/posts')
      .then((res) => {
        if (!res.ok) throw new Error('게시글 불러오기 실패');
        return res.json();
      })
      .then((data: Post[]) => setPosts(data))
      .catch((err) => console.error(err));
  }, []);

  // '완독' 게시글 필터링
  const finishedPosts = posts.filter(post => post.readingStatus === '완독');

  // 연간 달성 수 계산 (현재 연도 기준)
  useEffect(() => {
    const finishedYearlyPosts = posts.filter((post) => {
      if (post.readingStatus !== '완독' || !post.endDate) return false;
      const d = new Date(post.endDate);
      return d.getFullYear() === currentYear;
    });
    setYearlyAchieved(finishedYearlyPosts.length);
  }, [posts, currentYear]);

  // 이번달 달성 수 계산 (현재 연도, 현재 월 기준)
  useEffect(() => {
    const thisMonthFinished = posts.filter((post) => {
      if (post.readingStatus !== '완독' || !post.endDate) return false;
      const d = new Date(post.endDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    setMonthlyAchieved(thisMonthFinished.length);
  }, [posts, currentYear, currentMonth]);

  // 연간 독서량 (꺾은선형) 데이터: 현재 연도의 1월~12월
  useEffect(() => {
    const tempData: { month: string; count: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      const count = finishedPosts.filter((p) => {
        if (!p.endDate) return false;
        const d = new Date(p.endDate);
        return d.getFullYear() === currentYear && d.getMonth() + 1 === m;
      }).length;
      tempData.push({ month: `${m}월`, count });
    }
    setLineChartData(tempData);
  }, [finishedPosts, currentYear]);

  // 월별 독서량 (막대형) 데이터: 최근 6개월 기준
  useEffect(() => {
    const today = new Date();
    const tempData: { month: string; goal: number; achieved: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const target = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const y = target.getFullYear();
      const m = target.getMonth() + 1;
      const achievedCount = finishedPosts.filter((p) => {
        if (!p.endDate) return false;
        const d = new Date(p.endDate);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      }).length;
      tempData.push({ month: `${m}월`, goal: monthlyGoal, achieved: achievedCount });
    }
    tempData.reverse();
    setBarChartData(tempData);
  }, [finishedPosts, monthlyGoal]);

  // 장르별 독서 비율 (도넛형): 전체 완독 게시물 기준
  useEffect(() => {
    const total = finishedPosts.length;
    const genreCount: Record<string, number> = {};
    finishedPosts.forEach((p) => {
      if (!p.genre) return;
      genreCount[p.genre] = (genreCount[p.genre] || 0) + 1;
    });
    const tempData = Object.keys(genreCount).map((genre) => ({
      label: genre,
      value: total > 0 ? (genreCount[genre] / total) * 100 : 0,
    }));
    setGenreData(tempData);
  }, [finishedPosts]);

  // 연간 목표 모달 'OK' 핸들러
  const handleYearlyGoalSubmit = () => {
    const newGoal = parseInt(tempGoalValue, 10) || 0;
    setYearlyGoal(newGoal);
    setShowYearlyGoalModal(false);
    setTempGoalValue('');
  };

  // 월간 목표 모달 'OK' 핸들러
  const handleMonthlyGoalSubmit = () => {
    const newGoal = parseInt(tempMonthlyGoalValue, 10) || 0;
    setMonthlyGoal(newGoal);
    setShowMonthlyGoalModal(false);
    setTempMonthlyGoalValue('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '40px 100px 20px 100px', // 상, 우, 하, 좌 순서
        backgroundColor: '#fff',
      }}
    >
      {/* Left: Goal Management */}
      <div
        style={{
          flex: '1 1 30%', // flex-grow, flex-shrink, flex-basis: 기본 300px로 시작하여 필요 시 줄어들거나 늘어남
          maxWidth: '400px',
          backgroundColor: '#DADADA',
          borderRadius: '20px',
          padding: '40px 30px',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '40px' }}>Goal Management</h2>

        {/* Yearly Goal Card */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '50px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>올해 목표</h3>
            <span style={{ fontSize: '16px', color: '#555', marginLeft: '8px' }}>Annual Goal</span>
          </div>
          <hr style={{ border: '0.5px solid #ccc', marginBottom: '20px' }} />

          {/* Donut Graph for Yearly Goal */}
          <div
            style={{
              //width: '180px',
              width: '100%',
              maxWidth: '150px',       // 최대 150px, 부모 너비에 따라 줄어듦
              aspectRatio: '1',        // 정사각형 유지 (CSS 지원 안될 경우, padding-bottom: '100%' 대체)
              //height: '180px',
              borderRadius: '50%',
              border: '10px solid #F0F0F0',
              margin: '0 auto 20px',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {yearlyGoal === 0 ? '0%' : `${Math.round((yearlyAchieved / yearlyGoal) * 100)}%`}
              </span>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {yearlyGoal === 0 ? '목표를 설정하세요' : '진행 중'}
              </div>
            </div>
          </div>

          {/* Yearly Goal Modal Trigger */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              onClick={() => setShowYearlyGoalModal(true)}
              style={{
                backgroundColor: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              목표 설정
            </button>
          </div>

          {/* Yearly Goal / Achieved Display */}
          <div
            style={{
              backgroundColor: '#FEF9F3',
              borderRadius: '8px',
              padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>목표</div>
              <div style={{ fontSize: '14px' }}>{yearlyGoal}권</div>
            </div>
            <hr style={{ border: '0.1px solid #C5BBB1', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>달성</div>
              <div style={{ fontSize: '14px' }}>{yearlyAchieved}권</div>
            </div>
          </div>
        </div>

        {/* Monthly Goal Card */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>이번달 목표</h3>
            <span style={{ fontSize: '16px', color: '#555', marginLeft: '8px' }}>Monthly Goal</span>
          </div>
          <hr style={{ border: '0.5px solid #ccc', marginBottom: '20px' }} />

          {/* Donut Graph for Monthly Goal */}
          <div
            style={{
              //width: '180px',
              //height: '180px',
              width: '100%',
              maxWidth: '150px',
              aspectRatio: '1',
              borderRadius: '50%',
              border: '10px solid #F0F0F0',
              margin: '0 auto 20px',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {monthlyGoal === 0 ? '0%' : `${Math.round((monthlyAchieved / monthlyGoal) * 100)}%`}
              </span>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {monthlyGoal === 0 ? '목표를 설정하세요' : '진행 중'}
              </div>
            </div>
          </div>

          {/* Monthly Goal Modal Trigger */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              onClick={() => setShowMonthlyGoalModal(true)}
              style={{
                backgroundColor: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              목표 설정
            </button>
          </div>

          {/* Monthly Goal / Achieved Display */}
          <div
            style={{
              backgroundColor: '#FEF9F3',
              borderRadius: '8px',
              padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>목표</div>
              <div style={{ fontSize: '14px' }}>{monthlyGoal}권</div>
            </div>
            <hr style={{ border: '0.1px solid #C5BBB1', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>달성</div>
              <div style={{ fontSize: '14px' }}>{monthlyAchieved}권</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Statistics */}
      <div
        style={{
          flex: '2 1 50%',
          minWidth: '300px',
          boxSizing: 'border-box',
          paddingTop: '40px'
        }}
      >
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '30px' }}>Statistics</h2>

        {/* Annual Reading Amount */}
        <div style={{ marginBottom: '50px' }}>
          <h4 style={{ fontSize: '18px', margin: '0 0 20px 0', fontWeight: 'bold' }}>연간 독서량</h4>
          <AnnualLineChart chartData={lineChartData} />
        </div>

        {/* Monthly Reading Amount */}
        <div style={{ marginBottom: '50px' }}>
          <h4 style={{ fontSize: '18px', margin: '0 0 20px 0', fontWeight: 'bold' }}>월별 독서량</h4>
          <MonthlyBarChart chartData={barChartData} monthlyGoal={monthlyGoal} />
        </div>

        {/* Genre Reading Ratio */}
        <h4 style={{ fontSize: '18px', margin: '0 0 20px 0', fontWeight: 'bold' }}>장르별 독서 비율</h4>
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
            marginBottom: '40px',
            border: '1px solid #DADADA',
          }}
        >
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* 왼쪽: 도넛 차트 */}
            <div style={{ 
              //width: '220px', 
              width: '100%',
              maxWidth: '220px',
              //height: '220px', 
              position: 'relative' 
              }}
            >
              {genreData.length > 0 ? (
                <GenreDoughnutChart genreData={genreData} />
              ) : (
                <div
                  style={{
                    //width: '220px',
                    //height: '220px',
                    width: '100%',
                    aspectRatio: '1/1', // 정사각형 유지 (CSS aspect-ratio 지원 안 될 경우, padding-bottom: '100%' 대체)
                    borderRadius: '50%',
                    border: '8px solid #eee',
                    position: 'relative',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#999',
                      textAlign: 'center',
                      fontSize: '14px',
                    }}
                  >
                    가장 많이 읽은<br />장르는?
                  </div>
                </div>
              )}
            </div>

            {/* 오른쪽: 장르 / Value / % 표 */}
            <div style={{ flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '8px 0', fontSize: '14px', fontWeight: 'bold' }}>장르</th>
                    <th style={{ padding: '8px 0', fontSize: '14px', fontWeight: 'bold' }}>Value</th>
                    <th style={{ padding: '8px 0', fontSize: '14px', fontWeight: 'bold' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {genreData.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
                        아직 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    genreData.map((item, idx) => {
                      const absoluteCount = Math.round((item.value / 100) * finishedPosts.length);
                      const colorPalette = ['#FF6384', '#36A2EB', '#FFCE56', '#62AADF', '#E6EEF5', '#b38feb'];
                      const colorDot = colorPalette[idx % colorPalette.length];
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px 0', fontSize: '13px', color: '#333' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: colorDot,
                                marginRight: '6px',
                              }}
                            />
                            {item.label}
                          </td>
                          <td style={{ padding: '8px 0', fontSize: '13px', color: '#333' }}>
                            {absoluteCount}권
                          </td>
                          <td style={{ padding: '8px 0', fontSize: '13px', color: '#333' }}>
                            {item.value.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Goal Modal */}
      {showYearlyGoalModal && (
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
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                cursor: 'pointer',
                fontSize: '20px',
              }}
              onClick={() => setShowYearlyGoalModal(false)}
            >
              &times;
            </div>

            <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>
              달성할 책의 수를 입력하세요.
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
                onClick={() => setShowYearlyGoalModal(false)}
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
                onClick={handleYearlyGoalSubmit}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Goal Modal */}
      {showMonthlyGoalModal && (
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
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                cursor: 'pointer',
                fontSize: '20px',
              }}
              onClick={() => setShowMonthlyGoalModal(false)}
            >
              &times;
            </div>

            <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>
              이번달 달성할 책의 수를 입력하세요.
            </p>

            <input
              type="number"
              value={tempMonthlyGoalValue}
              onChange={(e) => setTempMonthlyGoalValue(e.target.value)}
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
                onClick={() => setShowMonthlyGoalModal(false)}
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
                onClick={handleMonthlyGoalSubmit}
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

export default ProgressPage;
