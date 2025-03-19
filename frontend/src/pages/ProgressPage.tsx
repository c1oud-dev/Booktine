import React, { useState, useEffect, useMemo } from 'react';
import AnnualLineChart from '../components/AnnualLineChart';
import MonthlyBarChart from '../components/MonthlyBarChart';
import GenreDoughnutChart from '../components/GenreDoughnutChart';

interface Post {
  id: number;
  readingStatus: '독서중' | '완독';
  endDate?: string; // 완독한 날짜 (ISO 형식)
  genre?: string;
}

// /progress API 응답 형식 (예시)
interface ProgressData {
  yearlyAchieved: number;
  monthlyAchieved: number;
  yearlyData: { month: string; count: number }[];
  recent6Months: { month: string; count: number }[];
  genreData: { label: string; value: number }[];
}

interface GenreData {
  label: string;
  value: number; // 비율 값
  count: number;       // 절대 건수
}

const ProgressPage: React.FC = () => {
  // 게시글 배열 ( /posts API )
  const [posts, setPosts] = useState<Post[]>([]);
  // Progress 통계 데이터 ( /progress API )
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  // 목표 및 달성 상태 (연간, 월간)
  const [yearlyGoal, setYearlyGoal] = useState(0);
  const [yearlyAchieved, setYearlyAchieved] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [monthlyAchieved, setMonthlyAchieved] = useState(0);

  // 차트 데이터 상태 (로컬 계산용)
  const [lineChartData, setLineChartData] = useState<{ month: string; count: number }[]>([]);
  const [barChartData, setBarChartData] = useState<{ month: string; goal: number; achieved: number }[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);

  // Modal 관련 상태
  const [showYearlyGoalModal, setShowYearlyGoalModal] = useState(false);
  const [showMonthlyGoalModal, setShowMonthlyGoalModal] = useState(false);
  const [tempGoalValue, setTempGoalValue] = useState('');
  const [tempMonthlyGoalValue, setTempMonthlyGoalValue] = useState('');

  // 현재 날짜, 연도, 월은 useMemo를 사용해 한 번만 계산
  const currentDate = useMemo(() => new Date(), []); 
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);
  const currentMonth = useMemo(() => currentDate.getMonth(), [currentDate]);

  // 선택 연도 (연도 선택 드롭다운용)
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const yearlyRatio = yearlyGoal > 0 ? (yearlyAchieved / yearlyGoal) : 0;
  const yearlyAngle = yearlyRatio * 360;
  const monthlyRatio = monthlyGoal > 0 ? (monthlyAchieved / monthlyGoal) : 0;
  const monthlyAngle = monthlyRatio * 360;

  const colorPalette = [
    '#FF6384', // 빨강
    '#36A2EB', // 파랑
    '#FFCE56', // 노랑
    '#62AADF', // 연파랑
    '#E6EEF5', // 아주연파랑
    '#b38feb', // 보라
  ];

  // ──────────────────────────────────────────────
  // (A) /posts API 호출 → 게시글 배열 저장
  // ──────────────────────────────────────────────
  useEffect(() => {
    fetch('http://localhost:8083/posts')
      .then((res) => {
        if (!res.ok) throw new Error('게시글 불러오기 실패');
        return res.json();
      })
      .then((data: Post[]) => setPosts(data))
      .catch((err) => console.error(err));
  }, []);

  // ──────────────────────────────────────────────
  // (B) /progress API 호출 → 통계 데이터 저장 (setProgressData 사용)
  // ──────────────────────────────────────────────
  useEffect(() => {
    console.log("Fetching progress data for year:", selectedYear);
    fetch(`http://localhost:8083/progress?year=${selectedYear}`)
      .then((res) => {
        if (!res.ok) throw new Error('Progress 데이터 불러오기 실패');
        return res.json();
      })
      .then((data: ProgressData) => {
        setProgressData(data);
      })
      .catch(console.error);
  }, [selectedYear]);

  // '완독' 게시글 필터링
  const finishedPosts = useMemo(() => 
    posts.filter(post => post.readingStatus === '완독'),
    [posts]
  );

  
  useEffect(() => {
    // 컴포넌트 마운트 시 localStorage에서 목표값 불러오기
    const storedYearlyGoal = localStorage.getItem('yearlyGoal');
    if (storedYearlyGoal) {
      setYearlyGoal(Number(storedYearlyGoal));
    }
    
    const storedMonthlyGoal = localStorage.getItem('monthlyGoal');
    if (storedMonthlyGoal) {
      setMonthlyGoal(Number(storedMonthlyGoal));
    }
  }, []); // 의존성 배열 비워두어야 첫 마운트 시에만 실행



  // ──────────────────────────────────────────────
  // (C) 연간 달성 수 계산 (현재 연도 기준)
  // ──────────────────────────────────────────────
  useEffect(() => {
    const finishedYearlyPosts = posts.filter((post) => {
      if (post.readingStatus !== '완독' || !post.endDate) return false;
      const d = new Date(post.endDate);
      return d.getFullYear() === currentYear;
    });
    setYearlyAchieved(finishedYearlyPosts.length);
  }, [posts, currentYear]);

  // ──────────────────────────────────────────────
  // (D) 이번달 달성 수 계산 (현재 연도, 현재 월 기준)
  // ──────────────────────────────────────────────
  useEffect(() => {
    const thisMonthFinished = posts.filter((post) => {
      if (post.readingStatus !== '완독' || !post.endDate) return false;
      const d = new Date(post.endDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    setMonthlyAchieved(thisMonthFinished.length);
  }, [posts, currentYear, currentMonth]);

  // ──────────────────────────────────────────────
  // (E) 로컬에서 연간 독서량 계산 (최근 6년)
  useEffect(() => {
    const tempData: { month: string; count: number }[] = [];
    for (let y = selectedYear - 5; y <= selectedYear; y++) {
      const count = finishedPosts.filter((p) => {
        if (!p.endDate) return false;
        const d = new Date(p.endDate);
        return d.getFullYear() === y;
      }).length;
      tempData.push({ month: `${y}년`, count });
    }
    setLineChartData(tempData);
  }, [finishedPosts, selectedYear]);

  // ──────────────────────────────────────────────
  // (F) 로컬에서 월별 독서량 계산 (최근 6개월)
  // ──────────────────────────────────────────────
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
      tempData.push({
        month: `${m}월`,
        goal: (currentYear === y && currentMonth + 1 === m) ? monthlyGoal : 0,
        achieved: achievedCount
      });
    }
    tempData.reverse();
    setBarChartData(tempData);
  }, [finishedPosts, monthlyGoal, currentYear, currentMonth]);

  // ──────────────────────────────────────────────
  // (G) 로컬에서 장르별 독서 비율 계산
  // ──────────────────────────────────────────────
  useEffect(() => {
    const postsWithGenre = posts.filter((p): p is Post & { genre: string } =>
      Boolean(p.genre && p.genre.trim() !== '')
    );
    const total = postsWithGenre.length;
    const genreCount: Record<string, number> = {};
    postsWithGenre.forEach((p) => {
      const g = p.genre;
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
    const tempData: GenreData[] = Object.keys(genreCount).map((genre) => ({
      label: genre,
      value: total > 0 ? (genreCount[genre] / total) * 100 : 0,
      count: genreCount[genre],
    }));
    setGenreData(tempData);
  }, [posts]);

  // 연간 목표 모달 'OK' 핸들러
  const handleYearlyGoalSubmit = () => {
    const newGoal = parseInt(tempGoalValue, 10) || 0;
    setYearlyGoal(newGoal);
    localStorage.setItem('yearlyGoal', String(newGoal)); // 로컬 스토리지 저장
    setShowYearlyGoalModal(false);
    setTempGoalValue('');
  };

  // 월간 목표 모달 'OK' 핸들러
  const handleMonthlyGoalSubmit = () => {
    const newGoal = parseInt(tempMonthlyGoalValue, 10) || 0;
    setMonthlyGoal(newGoal);
    localStorage.setItem('monthlyGoal', String(newGoal)); // 로컬 스토리지 저장
    setShowMonthlyGoalModal(false);
    setTempMonthlyGoalValue('');
  };

  return (
    <div
      style={{
        minWidth: '1200px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        paddingTop: '80px',  // 헤더 높이(65px)보다 조금 크게
        margin: 0,
      }}
    >
      {/* 2) 가운데 정렬 및 최소 너비 설정 */}
      <div style={{ width: '100%',  margin: '0 auto' }}>
        {/* 3) 기존의 콘텐츠 영역 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            padding: '0 120px', // 좌우 패딩 (상하는 필요시 조절)
          }}
        >
      {/* Left: Goal Management */}
      <div
        style={{
          flex: '0 0 400px',      // 기존 maxWidth: 400px → 500px
          boxSizing: 'border-box',
          marginTop: '40px',
        }}
      >
        {/* 제목 박스: 올해 목표 카드와 동일한 가로 폭 (부모 width 100%) */}
        <div
          style={{
            backgroundColor: '#D8D1B9',
            borderRadius: '10px',
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
            border: '1px solid #DADADA',
            padding: '10px 30px',
            marginBottom: '20px',
            textAlign: 'center',
            color: '#333',
            width: '100%',
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0}}>Goal Management</h2>
        </div>

        {/* Yearly Goal Card */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '25px',
            margin: '20px 0 50px 0',
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
            border: '1px solid #DADADA',
            minHeight: '480px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>올해 목표</h3>
            <span style={{ fontSize: '16px', color: '#555', marginLeft: '8px' }}>Annual Goal</span>
          </div>
          <hr style={{ border: '0.5px solid #ccc', marginBottom: '30px' }} />
          
          
          {/* Donut Graph for Yearly Goal */}
          <div
            style={{
              width: '170px',   // 도넛 크기
              height: '170px',
              borderRadius: '50%',
              margin: '0 auto 40px',
              position: 'relative',
              background: `conic-gradient(
                #FF5C00 0deg ${yearlyAngle}deg,   /* 달성 부분(진한 색) */
                #F0F0F0 ${yearlyAngle}deg 360deg  /* 나머지 부분(연한 색) */
              )`,
            }}
          >
            {/* 안쪽 흰색 원(속이 비어있는 '도넛' 형태 만들기) */}
            <div
              style={{
                width: '150px',
                height: '150px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* 중앙 텍스트 (달성률, 안내문구 등) */}
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
                {yearlyGoal === 0
                  ? '0%'
                  : yearlyAchieved >= yearlyGoal
                  ? '100%'
                  : `${Math.round(yearlyRatio * 100)}%`}
              </span>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {yearlyGoal === 0
                  ? '목표를 설정하세요'
                  : yearlyAchieved === 0
                  ? '아직 완독한 게 없어요.'
                  : yearlyAchieved < yearlyGoal
                  ? `목표 달성까지 ${100 - Math.round(yearlyRatio * 100)}% 남았어요.`
                  : '목표 달성!'}
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
            
            padding: '25px',
            marginBottom: '30px',
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
            border: '1px solid #DADADA',
            /* 아래로 많이 늘리기 위해 minHeight 지정 (예: 350px) */
            minHeight: '480px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>이번달 목표</h3>
            <span style={{ fontSize: '16px', color: '#555', marginLeft: '8px' }}>Monthly Goal</span>
          </div>
          <hr style={{ border: '0.5px solid #ccc', marginBottom: '30px' }} />

          {/* Donut Graph for Monthly Goal */}
          <div
            style={{
              width: '170px',
              height: '170px',
              borderRadius: '50%',
              margin: '0 auto 40px',
              position: 'relative',
              background: `conic-gradient(
                #62AADF 0deg ${monthlyAngle}deg,
                #F0F0F0 ${monthlyAngle}deg 360deg
              )`,
            }}
          >
            <div
              style={{
                width: '150px',
                height: '150px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
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
                {monthlyGoal === 0
                  ? '0%'
                  : monthlyAchieved >= monthlyGoal
                  ? '100%'
                  : `${Math.round(monthlyRatio * 100)}%`}
              </span>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                {monthlyGoal === 0
                  ? '목표를 설정하세요'
                  : monthlyAchieved === 0
                  ? '아직 완독한 게 없어요.'
                  : monthlyAchieved < monthlyGoal
                  ? `목표 달성까지 ${100 - Math.round(monthlyRatio * 100)}% 남았어요.`
                  : '목표 달성!'}
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
          paddingTop: '40px',
          marginLeft: '40px'
        }}
      >
        {/* 제목 박스 */}
        <div
          style={{
            backgroundColor: '#C5CAB4',
            borderRadius: '10px',
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
            border: '1px solid #DADADA',
            padding: '10px 40px',
            marginBottom: '20px',
            textAlign: 'center',
            color: '#333',
            width: '100%',
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0}}>Statistics</h2>
        </div>

        {/* Annual Reading Amount */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ fontSize: '18px', margin: '20px 0 10px 0', fontWeight: 'bold' }}>연간 독서량</h4>
          
          {/* 박스는 연도 선택과 차트만 감쌈 */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px 40px',
              boxShadow: '0 0 8px rgba(0,0,0,0.1)',
              border: '1px solid #DADADA',
              marginBottom: '30px',
            }}
          >
            {/* 연도 선택 드롭다운 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <label htmlFor="year-select" style={{ marginRight: '8px' }}>연도 선택:</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{ padding: '5px 10px' }}
              >
                {Array.from({ length: 11 }, (_, i) => currentYear - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          <AnnualLineChart chartData={lineChartData} />
        </div>
      </div>

        {/* Monthly Reading Amount */}
        <div style={{ marginBottom: '30px',  }}>
          <h4 style={{ fontSize: '18px', margin: '0 0 10px 0', fontWeight: 'bold' }}>월별 독서량</h4>
          <MonthlyBarChart chartData={barChartData} monthlyGoal={monthlyGoal} />
        </div>

        {/* Genre Reading Ratio */}
        <h4 style={{ fontSize: '18px', margin: '0 0 10px 0', fontWeight: 'bold' }}>장르별 독서 비율</h4>
        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px 40px',
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
            marginBottom: '40px',
            border: '1px solid #DADADA',
          }}
        >
          {/* 차트와 테이블을 가로 배치 (혹은 상하 배치) */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '50px', // 차트와 테이블 사이 여유
            flexWrap: 'nowrap', // 가로 배치 유지
            justifyContent: 'flex-start',
          }}>
            {/* 왼쪽: 도넛 차트 */}
            <GenreDoughnutChart genreData={genreData} />
            {/* 오른쪽: 테이블 */}
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
                      <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        아직 데이터가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    genreData.map((item, idx) => {
                      const colorDot = colorPalette[idx % colorPalette.length];
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px 0', fontSize: '13px', color: '#333' }}>
                            {/* 왼쪽에 색상 도트 표시 */}
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
                          {/* Value(예: 1권)는 별도 로직 필요 → 일단 '-' 처리 가능 */}
                          <td style={{ padding: '8px 0', fontSize: '13px', color: '#333' }}>
                            {item.count}권
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
    </div>
  );
};

export default ProgressPage;
