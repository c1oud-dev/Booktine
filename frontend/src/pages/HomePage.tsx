import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // BookNote 페이지로 이동하기 위해 추가
import AnnualLineChart from '../components/AnnualLineChart';
import MonthlyBarChart from '../components/MonthlyBarChart';
import HomeGenreDoughnutChart from '../components/HomeGenreDoughnutChart';

interface ProgressData {
  yearlyData: { month: string; count: number }[];     // 연간 독서량
  recent6Months: { month: string; count: number }[]; // 최근 6개월 독서량
  genreData: { label: string; value: number }[];     // 장르별 비율
}

// 게시글 타입 (백엔드 API 응답 구조에 맞게 필요 시 수정)
interface Post {
  id: number;
  title: string;
  readingStatus: '독서중' | '완독';
  startDate?: string;
  endDate?: string;
  genre?: string;
}

interface RecommendedBook {
  title: string;
  author: string;
  summary: string;
  coverUrl?: string;  // 표지 이미지 경로 (없으면 회색 배경 처리)
}

const HomePage: React.FC = () => {

  // (1) 연간 목표/달성 수 상태
  const [yearlyGoal, setYearlyGoal] = useState(0);
  const [yearlyAchieved, setYearlyAchieved] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [statTabIndex, setStatTabIndex] = useState(0);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  
  // 모달 열림/닫힘
  const [showGoalModal, setShowGoalModal] = useState(false);
  // 모달에서 입력받을 임시 목표값
  const [tempGoalValue, setTempGoalValue] = useState('');

  // 독서 기록을 위한 게시글 관련 state 추가
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentReading, setCurrentReading] = useState<Post[]>([]);
  const [finishedReading, setFinishedReading] = useState<Post[]>([]);

  const navigate = useNavigate(); // BookNote 페이지로 이동하기 위한 훅

  // 추천 도서 관련 state
  const [recommendationStep, setRecommendationStep] = useState<'select' | 'result'>('select');
  const [defaultRecommendedBook, setDefaultRecommendedBook] = useState<RecommendedBook | null>(null); 
  const [modalRecommendedBook, setModalRecommendedBook] = useState<RecommendedBook | null>(null);

  // 추천 모달 열림/닫힘
  const [showRecommendModal, setShowRecommendModal] = useState(false);

  // 사용자가 모달에서 선택한 장르
  const [selectedGenre, setSelectedGenre] = useState('');

  const ratio = yearlyGoal > 0 ? (yearlyAchieved / yearlyGoal) : 0;
  const angle = ratio * 360;

  const [homeYearlyChartData, setHomeYearlyChartData] = useState<{ month: string; count: number }[]>([]);


  const getCheerMessage = (ratio: number): string => {
    const percent = Math.round(ratio * 100);
    if (percent === 0) {
      return "아직 시작하지 않았어요. 도전해보세요!";
    } else if (percent > 0 && percent <= 20) {
      return "시작이 반입니다! 조금만 더 힘내보세요! 🔥";
    } else if (percent > 20 && percent <= 50) {
      return "좋은 출발이에요! 꾸준히 하면 목표 달성이 눈앞에 있어요! 😊";
    } else if (percent > 50 && percent <= 80) {
      return "훌륭해요! 지금도 목표에 한 걸음 더 다가섰어요! 👍";
    } else if (percent > 80 && percent < 100) {
      return "거의 다 왔어요! 마지막 힘을 내서 꼭 달성하세요! 💪";
    } else if (percent >= 100) {
      return "목표 달성을 축하합니다! 이제 새로운 도전을 시작해보세요! 🎉";
    }
    return "";
  };
  

  useEffect(() => {
    const storedGoal = localStorage.getItem('yearlyGoal');
    const storedAchieved = localStorage.getItem('yearlyAchieved');
    if (storedGoal) {
      setYearlyGoal(parseInt(storedGoal, 10));
    }
    if (storedAchieved) {
      setYearlyAchieved(parseInt(storedAchieved, 10));
    }

    // 추가: localStorage에서 월간 목표 불러오기
    const storedMonthlyGoal = localStorage.getItem('monthlyGoal');
    if (storedMonthlyGoal) {
      setMonthlyGoal(parseInt(storedMonthlyGoal, 10));
    }
  }, []);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
  
    fetch(`http://localhost:8083/progress?year=${currentYear}`)
      .then((res) => {
        if (!res.ok) throw new Error('Progress 데이터 불러오기 실패');
        return res.json();
      })
      .then((data: ProgressData) => {
        setProgressData(data);
      })
      .catch(console.error);
  }, []);


  // 게시글 fetch (BookNote 페이지의 게시글 API와 동일한 엔드포인트 사용)
  useEffect(() => {
    fetch('http://localhost:8083/posts')
      .then((res) => {
        if (!res.ok) throw new Error('게시글 불러오기 실패');
        return res.json();
      })
      .then((data: Post[]) => {
        setPosts(data);
      })
      .catch((error) => console.error('Error fetching posts:', error));
  }, []);

  // 최근 6년 연간 독서량 데이터 (완독 상태의 게시글 기준)
  useEffect(() => {
    const finished = posts.filter(p => p.readingStatus === '완독' && p.endDate);
    const currentYear = new Date().getFullYear();
    const tempData = [];
    for (let y = currentYear - 5; y <= currentYear; y++) {
      const count = finished.filter(p => new Date(p.endDate!).getFullYear() === y).length;
      tempData.push({ month: `${y}년`, count });
    }
    setHomeYearlyChartData(tempData);
  }, [posts]);


  // posts 변경 시, 독서 상태별 분류 (최대 3개씩)
  useEffect(() => {
    const current = posts.filter((p) => p.readingStatus === '독서중');
    const finished = posts
      .filter(
        (p) =>
          p.readingStatus === '완독' &&
          p.endDate &&
          new Date(p.endDate).getFullYear() === new Date().getFullYear()
      )
      .sort((a, b) => new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime());
    setCurrentReading(current.slice(0, 2));
    setFinishedReading(finished.slice(0, 2));
    setYearlyAchieved(finished.length); // 여기서 완독 게시물 수를 업데이트
  }, [posts]);

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

  /* 기본 추천 도서 불러오기 */
  useEffect(() => { 
    fetch('http://localhost:8083/recommend') 
    .then((res) => { 
      if (!res.ok) 
        throw new Error('Failed to fetch default recommendation'); 
      return res.json(); 
    }) 
    .then((data: RecommendedBook) => {
      setDefaultRecommendedBook(data); 
    }) 
    .catch((err) => console.error(err)); 
  }, []);
  

  /* 추천받기 로직 (OK 버튼 핸들러 */
  function handleRecommendOk() {
    if (!selectedGenre) {
      alert('장르를 선택해주세요.');
      return;
    }
  
    fetch(`http://localhost:8083/recommend?genre=${selectedGenre}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch recommendation');
        return res.json();
      })
      .then((data: RecommendedBook) => {
        setModalRecommendedBook(data);
        setRecommendationStep('result');
      })
      .catch((err) => {
        console.error(err);
        alert('추천 도서를 불러오는 중 오류가 발생했습니다.');
      });
  }
  
  
  
  

  //통계 Card의 장르별 독서 비율
  const computedGenreData = useMemo(() => {
    // 모든 게시글 중 genre가 존재하는 항목 선택 (완독, 독서중 모두 포함)
    const postsWithGenre = posts.filter(p => p.genre && p.genre.trim() !== '');
    const total = postsWithGenre.length;
    const genreCount: Record<string, number> = {};
    postsWithGenre.forEach((p) => {
      const genre = p.genre!;
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
    const genreData = Object.keys(genreCount).map((genre) => ({
      label: genre,
      value: total > 0 ? (genreCount[genre] / total) * 100 : 0,
    }));
    return genreData;
  }, [posts]);


  return (
    // 전체 페이지 래퍼
    <div
      style={{
        position: 'relative',
        minWidth: '1300px',
        backgroundColor: 'rgba(255,255,255,0)',
        margin: 0,
        paddingTop: '10px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('/Home1.png') center center / cover no-repeat",
          opacity: 0.6,
          zIndex: -1,
        }}
      />
      {/* 가운데 정렬 및 콘텐츠 영역 래퍼 */}
      <div style={{ 
        maxWidth: '1200px',
        width: '100%', 
        margin: '0 auto',
        paddingBottom: '80px'
        }}>

        {/* 2x2 카드 레이아웃 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '100px',
            marginTop: '100px',
            marginLeft: '20px',
            marginRight: '20px'
          }}
        >

          {/* (1) 목표 관리 제목 + 카드 컨테이너 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 카드 위에 배치된 제목 */}
            <h3 style={{ 
              margin: 0,
              fontWeight: 'bold', 
              fontSize: '25px'
            }}>
              목표 관리
            </h3>

            {/* 바깥쪽(회색 반투명) */}
            <div
              style={{
                backgroundColor: 'rgba(128,128,128,0.2)',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
              }}
            >
              {/* 안쪽(흰색) - 고정 크기 */}
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  width: '500px',   // 원하는 고정 폭
                  height: '300px',  // 원하는 고정 높이
                  margin: '0 auto', // 바깥 컨테이너 안에서 가운데 정렬
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* 상단 타이틀 영역 */}
                <div
                  style={{
                    padding: '10px 20px',
                    borderBottom: '1px solid #eee',
                    fontWeight: 'bold',
                    fontSize: '20px',
                  }}
                >
                  올해 목표
                </div>

                {/* 본문 영역: 좌우 2컬럼 배치 */}
                <div
                  style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    alignItems: 'center',
                    padding: '10px 20px',
                    gap: '10px',
                  }}
                >
                  {/* (A) 왼쪽: 도넛 그래프 영역 */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column', // 도넛 아래에 레전드를 배치하기 위해 column
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid #eee',
                      paddingRight: '10px',
                      height: '100%',
                    }}
                  >

                    {/* (A) 목표 미설정 vs 설정됨 분기 */}
                    {yearlyGoal === 0 ? (
                      // 0% 도넛
                      <div
                      style={{
                        width: '90px',
                        height: '90px',
                        border: '8px solid #E0E0E0',
                        borderRadius: '50%',
                        position: 'relative',
                      }}
                    >
                      {/* (A) 위쪽: 도넛 (왼) + 안내/버튼 (오른) 가로 배치 */}
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
                  ) : (
                    // 달성률 도넛
                    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                      {/* (1) 남은 부분 (얇은 링) - 아래 레이어 */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: `conic-gradient(
                            #F0F0F0 ${angle}deg 360deg, /* angle~360deg는 연한 회색 */
                            transparent 0deg ${angle}deg /* 0~angle은 투명 */
                          )`,
                          zIndex: 1,
                        }}
                      >
                        {/* 안쪽 흰색 원 (크게) → 두께가 얇아짐 */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#fff',
                            borderRadius: '50%',
                          }}
                        />
                      </div>

                      {/* (2) 달성 부분 (두꺼운 링) - 위 레이어 */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          background: `conic-gradient(
                            #FF5C00 0deg ${angle}deg,
                            transparent ${angle}deg 360deg
                          )`,
                          zIndex: 2,
                        }}
                      >
                        {/* 안쪽 흰색 원 (작게) → 두께가 두꺼워짐 */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80px',   // 아래 레이어와 똑같이 80px
                            height: '80px',
                            backgroundColor: '#fff',
                            borderRadius: '50%',
                          }}
                        />
                      </div>

                      {/* (3) 중앙 텍스트 (퍼센트) */}
                      <div
                        style={{
                          position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 3,
                        fontSize: '18px',
                        fontWeight: 'bold',
                        }}
                      >
                        {Math.round(ratio * 100)}%
                      </div>
                    </div>
                )}

                  {/* 레전드 (달성/목표) - 도넛 차트 바로 아래 */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '30px', // 달성/목표 사이의 간격
                      marginTop: '45px', //차트와의 간격
                    }}
                  >
                    {/* 달성 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#FF5C00',
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
                          backgroundColor: '#A0A0A0',
                        }}
                      />
                      <span style={{ fontSize: '14px' }}>목표</span>
                    </div>
                  </div>
                </div>
                  
                {/* (B) 오른쪽: 목표 설정 or 달성 정보 */}
                <div style={{ paddingLeft: '10px' }}>
                  {yearlyGoal === 0 ? (
                    /* 목표 미설정 UI */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ fontSize: '14px', lineHeight: '2', color: '#333' }}>
                        아직 목표가 설정되지 않았어요! <br />
                        아래의 목표 설정 버튼을 클릭하여 
                        올해 목표를 설정하고 달성해보세요!
                      </p>
                      <button
                        style={{
                          backgroundColor: '#000',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '8px 20px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          alignSelf: 'center',
                        }}
                        onClick={() => setShowGoalModal(true)}
                      >
                        목표 설정
                      </button>
                    </div>
                  ) : (
                    /* 목표 설정됨 UI */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* 목표/달성/남은 책 정보 */}
                    <div
                      style={{
                        backgroundColor: '#F8F3EE',
                        borderRadius: '8px',
                        padding: '10px',
                        width: '250px',
                      }}
                    >
                      <div
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          borderBottom: '1px solid #C5BBB1', 
                          
                          margin: '0 -10px',
                          padding: '5px 20px',
                        }}
                      >
                        <span>목표</span>
                        <span>{yearlyGoal}권</span>
                      </div>
                      <div
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          borderBottom: '1px solid #C5BBB1',

                          margin: '0 -10px',
                          padding: '8px 20px',
                        }}
                      >
                        <span>달성</span>
                        <span>{yearlyAchieved}권</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: '0 -10px',
                        padding: '8px 20px 5px',
                        }}>
                        <span>남은 책</span>
                        <span>{yearlyGoal - yearlyAchieved}권</span>
                      </div>
                    </div>

                    {/* 응원 문구 */}
                    <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
                      "{getCheerMessage(ratio)}"
                    </p>
                  </div>
                )}
              </div>
            </div>

              
          </div>
        </div>
      </div>


      {/* (2) 통계 제목 + 카드 컨테이너 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* 카드 위에 배치된 제목 */}
        <h3 style={{ 
          margin: 0,
          fontWeight: 'bold', 
          fontSize: '25px'
        }}>
          통계
        </h3>

        {/* 바깥쪽(회색 반투명) */}
        <div
          style={{
            backgroundColor: 'rgba(128,128,128,0.2)',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
          }}
        >
          {/* 안쪽(흰색) */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              width: '500px',
              height: '300px',
              margin: '0 auto',
              padding: '20px',
              position: 'relative',
            }}
          >
            {/* 오른쪽 상단 점 3개 (탭 전환) */}
            <div 
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: '8px',
              }}
            >
              <div
                onClick={() => setStatTabIndex(0)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: statTabIndex === 0 ? '#000' : '#ccc',
                  cursor: 'pointer',
                }}
              />
              <div
                onClick={() => setStatTabIndex(1)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: statTabIndex === 1 ? '#000' : '#ccc',
                  cursor: 'pointer',
                }}
              />
              <div
                onClick={() => setStatTabIndex(2)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: statTabIndex === 2 ? '#000' : '#ccc',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* 실제 통계 차트/그래프 표시 (ProgressPage와 연동) */}
            {progressData ? (
              <>
                {/* 첫 번째 점: 연간 독서량 */}
                {statTabIndex === 0 && (
                  <AnnualLineChart chartData={homeYearlyChartData} />
                )}

                {/* 두 번째 점: 월간 독서량 */}
                {statTabIndex === 1 && (() => {
                  const currentMonth = new Date().getMonth() + 1;
                  return (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden'
                      }}
                    >
                      <MonthlyBarChart
                        chartData={
                          progressData.recent6Months.map(item => ({
                            month: item.month,
                            // item.month가 "현재월월"과 일치하면 monthlyGoal을, 아니면 0
                            goal: item.month === `${currentMonth}월` ? monthlyGoal : 0,
                            achieved: item.count
                          }))
                        }
                        monthlyGoal={monthlyGoal}
                      />
                    </div>
                  );
                })()}


                {/* 세 번째 점: 장르별 독서 비율 */}
                {statTabIndex === 2 && (
                  <HomeGenreDoughnutChart
                    genreData={computedGenreData}
                  />
                )}
              </>
            ) : (
              <p>통계 데이터를 불러오는 중...</p>
            )}
          </div>
        </div>
      </div>


      {/* (3) 독서 기록 카드 + 카드 컨테이너 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* 카드 위에 배치된 제목 */}
        <h3 style={{ 
          margin: 0,
          fontWeight: 'bold', 
          fontSize: '25px'
        }}>독서 기록</h3>

        {/* 바깥쪽(회색 반투명) */}
        <div
          style={{
            backgroundColor: 'rgba(128,128,128,0.2)',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
          }}
        >
          {/* 안쪽(흰색) */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              width: '500px',
              height: '300px',
              margin: '0 auto',
              padding: '20px',
            }}
          >
            {currentReading.length === 0 && finishedReading.length === 0 ? (
              // 초기 사용자: 게시글이 하나도 없을 경우
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '18px', color: '#555', marginBottom: '20px' }}>
                  아직 독서 기록이 없습니다.
                </p>
                <button
                  onClick={() => navigate('/booknote')}
                  style={{
                    backgroundColor: '#333',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  독서 노트 작성하러 가기
                </button>
              </div>
            ) : (
              // 게시글이 있을 경우: 현재 읽는 책과 최근 완독한 책 각각 최대 2개씩 표시
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* 현재 읽고 있는 책 */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
                    현재 읽고 있는 책
                  </h4>
                  {currentReading.length === 0 ? (
                    <p style={{ color: '#777' }}>현재 읽고 있는 책이 없습니다.</p>
                  ) : (
                    currentReading.map((post) => (
                      <div
                        key={post.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        <span style={{ fontSize: '15px' }}>{post.title}</span>
                        <span style={{ fontSize: '14px', color: '#555' }}>
                          {post.startDate ? `시작일 | ${post.startDate}` : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* 최근 완독한 책 */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
                    최근 완독한 책
                  </h4>
                  {finishedReading.length === 0 ? (
                    <p style={{ color: '#777' }}>최근 완독한 책이 없습니다.</p>
                  ) : (
                    finishedReading.map((post) => (
                      <div
                        key={post.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        <span style={{ fontSize: '15px' }}>{post.title}</span>
                        <span style={{ fontSize: '14px', color: '#555' }}>
                          {post.endDate ? `완독일 | ${post.endDate}` : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* (4) 추천 도서 카드 + 카드 컨테이너 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* 카드 위에 배치된 제목 */}
        <h3 style={{ 
          margin: 0,
          fontWeight: 'bold', 
          fontSize: '25px'
        }}>추천 도서</h3>

        {/* 바깥쪽(회색 반투명) */}
        <div
          style={{
            backgroundColor: 'rgba(128,128,128,0.2)',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
          }}
        >
          {/* 안쪽(흰색) */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              width: '500px',
              height: '300px',
              margin: '0 auto',
              padding: '20px',
              display: 'flex',         // 왼쪽(텍스트) + 오른쪽(이미지) 가로 배치
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* 왼쪽: 책 정보 */}
            <div style={{ flex: 1, marginRight: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>
                {defaultRecommendedBook?.title || '책 제목'}
              </h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#555' }}>
                {defaultRecommendedBook?.author || '저자'}
              </p>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', lineHeight: '1.4' }}>
                {defaultRecommendedBook?.summary || '이곳에 책의 정보가 표시됩니다.'}
              </p>
              <button
                onClick={() => setShowRecommendModal(true)}
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                추천받기
              </button>
            </div>
            {/* 오른쪽: 책 표지 */}
            <div
              style={{
                width: '160px',
                height: '290px',
                backgroundColor: '#ccc',
                //borderRadius: '8px',
                //overflow: 'hidden',
              }}
            >
              {defaultRecommendedBook?.coverUrl ? (
                <img
                  src={defaultRecommendedBook.coverUrl}
                  alt="Book Cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>


      </div>

    </div>


      {/* 목표 관리 Modal */}
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
                fontSize: '20px',
                textAlign: 'center',
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

      {showRecommendModal && (
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
              width: '300px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* 닫기 버튼 */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                cursor: 'pointer',
                fontSize: '20px',
              }}
              onClick={() => {
                setShowRecommendModal(false);
                setRecommendationStep('select');
              }}
            >
              &times;
            </div>

            {recommendationStep === 'select' ? (
              <>
                <h3 style={{ margin: '10px 0 20px 0', fontWeight: 'bold', fontSize: '20px' }}>
                  책 추천
                </h3>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="">장르를 선택하세요.</option>
                  <option value="국내도서">국내도서</option>
                  <option value="소설">소설</option>
                  <option value="자기계발">자기계발</option>
                  <option value="에세이">에세이</option>
                  <option value="컴퓨터/IT">컴퓨터/IT</option>
                  <option value="기술/공학">기술/공학</option>
                  <option value="경제/경영">경제/경영</option>
                  <option value="자연과학">자연과학</option>
                  <option value="사회과학">사회과학</option>
                  <option value="인문">인문</option>
                  <option value="역사">역사</option>
                </select>
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                  장르를 선택하세요.
                </p>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
                  장르를 선택하면 그에 맞는 책을 추천드립니다.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => {
                      setShowRecommendModal(false);
                      setSelectedGenre('');
                    }}
                    style={{
                      backgroundColor: '#fff',
                      color: '#333',
                      border: '1px solid #ccc',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      flex: 1,
                      marginRight: '5px',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecommendOk}
                    style={{
                      backgroundColor: '#333',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      flex: 1,
                      marginLeft: '5px',
                    }}
                  >
                    OK
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <h3 style={{ margin: '10px 0 20px 0', fontWeight: 'bold', fontSize: '20px' }}>
                    책 추천
                  </h3>
                  <div
                    style={{
                      width: '120px',
                      height: '160px',
                      backgroundColor: '#ccc',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '20px',
                    }}
                  >
                    {modalRecommendedBook?.coverUrl ? (
                      <img
                        src={modalRecommendedBook.coverUrl}
                        alt="Book Cover"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : null}
                  </div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
                    {modalRecommendedBook?.title || '추천할 책이 없습니다.'}
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
                    {modalRecommendedBook?.author || ''}
                  </p>
                  <p
                    style={{
                      margin: '0 0 20px 0',
                      fontSize: '14px',
                      lineHeight: '1.4',
                      textAlign: 'center',
                    }}
                  >
                    {modalRecommendedBook?.summary || ''}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => {
                      setRecommendationStep('select');
                      setSelectedGenre('');
                      setModalRecommendedBook(null);
                    }}
                    style={{
                      backgroundColor: '#fff',
                      color: '#333',
                      border: '1px solid #ccc',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      flex: 1,
                      marginRight: '5px',
                    }}
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => {
                      setShowRecommendModal(false);
                      setRecommendationStep('select');
                      setSelectedGenre('');
                    }}
                    style={{
                      backgroundColor: '#333',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      flex: 1,
                      marginLeft: '5px',
                    }}
                  >
                    OK
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}





    </div>
  );
};

export default HomePage;
