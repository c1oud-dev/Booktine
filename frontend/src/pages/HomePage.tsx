import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // BookNote 페이지로 이동하기 위해 추가
import AnnualLineChart from '../components/AnnualLineChart';
import MonthlyBarChart from '../components/MonthlyBarChart';
import HomeGenreDoughnutChart from '../components/HomeGenreDoughnutChart';
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8083';

interface ProgressData {
  yearlyData: { month: string; count: number }[];     // 연간 독서량
  recent6Months: { month: string; count: number }[]; // 최근 6개월 독서량
  genreData: { label: string; value: number }[];     // 장르별 비율
}

interface Post {
  id: number;
  title: string;
  readingStatus: '독서중' | '완독';
  startDate?: string;
  endDate?: string;
  genre?: string;
  lastModified?: string;
}

interface RecommendedBook {
  title: string;
  author: string;
  summary: string;
  coverUrl?: string;
}

const HomePage: React.FC = () => {
  // 목표 관련 상태
  const [yearlyGoal, setYearlyGoal] = useState(0);
  const [yearlyAchieved, setYearlyAchieved] = useState(0);
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [statTabIndex, setStatTabIndex] = useState(0);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  // 모달 열림/닫힘 상태 및 임시 목표 값
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoalValue, setTempGoalValue] = useState('');

  // 독서 기록 관련 상태
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentReading, setCurrentReading] = useState<Post[]>([]);
  const [finishedReading, setFinishedReading] = useState<Post[]>([]);
  // 탭 상태: 현재 읽는 책과 최근 완독한 책을 선택할 수 있도록 함.
  const [recordTab, setRecordTab] = useState<'current' | 'finished'>('current');

  const navigate = useNavigate(); // BookNote 페이지로 이동
  const currentYearLocal = new Date().getFullYear();
  const registrationYear = Number(localStorage.getItem("registrationYear")) || currentYearLocal;


  // 추천 도서 관련 상태
  const [recommendationStep, setRecommendationStep] = useState<'select' | 'result'>('select');
  const [defaultRecommendedBook, setDefaultRecommendedBook] = useState<RecommendedBook | null>(null); 
  const [modalRecommendedBook, setModalRecommendedBook] = useState<RecommendedBook | null>(null);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');

  const ratio = yearlyGoal > 0 ? (yearlyAchieved / yearlyGoal) : 0;
  const angle = ratio * 360;
  const [homeYearlyChartData, setHomeYearlyChartData] = useState<{ month: string; count: number }[]>([]);
  const [selectedGoalYear, setSelectedGoalYear] = useState(currentYearLocal);
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
    const currentEmail = localStorage.getItem('email');
    const goalEmail = localStorage.getItem('goalEmail');
    const currentYear = new Date().getFullYear();
  
    // 현재 로그인한 이메일과 저장된 목표 이메일이 다르다면 기존 목표 데이터를 모두 제거(일반 및 연도/월별 키)
    if (!goalEmail || goalEmail !== currentEmail) {
      localStorage.removeItem('yearlyGoal');
      localStorage.removeItem('yearlyAchieved');
      localStorage.removeItem('monthlyGoal');
      localStorage.removeItem(`yearlyGoal_${currentYear}`);
      for (let m = 1; m <= 12; m++) {
        localStorage.removeItem(`monthlyGoal_${currentYear}_${m}`);
      }
      localStorage.setItem('goalEmail', currentEmail || '');
    }
  
    // 저장된 목표가 연도별 키에 있으면 우선 사용
    const storedYearlyGoal =
      localStorage.getItem(`yearlyGoal_${currentYear}`) ||
      localStorage.getItem('yearlyGoal');
    if (storedYearlyGoal) {
      setYearlyGoal(parseInt(storedYearlyGoal, 10));
    }
  
    const storedAchieved = localStorage.getItem('yearlyAchieved');
    if (storedAchieved) {
      setYearlyAchieved(parseInt(storedAchieved, 10));
    }
  
    const storedMonthlyGoal = localStorage.getItem('monthlyGoal');
    if (storedMonthlyGoal) {
      setMonthlyGoal(parseInt(storedMonthlyGoal, 10));
    }
  }, []);
  

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    fetch(`${BASE_URL}/progress?year=${currentYear}`)
      .then((res) => {
        if (!res.ok) throw new Error('Progress 데이터 불러오기 실패');
        return res.json();
      })
      .then((data: ProgressData) => {
        setProgressData(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/posts`)
      .then((res) => {
        if (!res.ok) throw new Error('게시글 불러오기 실패');
        return res.json();
      })
      .then((data: Post[]) => {
        setPosts(data);
      })
      .catch((error) => console.error('Error fetching posts:', error));
  }, []);

  useEffect(() => {
    // registrationYear와 currentYearLocal를 이용한 범위 결정:
    // 가입 연도와 현재 연도가 같다면 [currentYearLocal, currentYearLocal+5]
    // 그렇지 않다면 [registrationYear, currentYearLocal]
    let startYear: number, endYear: number;
    if (registrationYear === currentYearLocal) {
      startYear = currentYearLocal;
      endYear = currentYearLocal + 5;
    } else {
      startYear = registrationYear;
      endYear = currentYearLocal;
    }
    const tempData: { month: string; count: number }[] = [];
    // full range의 각 연도별로 완독된 게시물 수 계산 (단, endDate가 null이 아니고 연도만 비교)
    for (let y = startYear; y <= endYear; y++) {
      const count = posts.filter(p => {
        if (p.readingStatus !== '완독' || !p.endDate) return false;
        const d = new Date(p.endDate);
        return d.getFullYear() === y;
      }).length;
      tempData.push({ month: `${y}년`, count });
    }
    setHomeYearlyChartData(tempData);
  }, [posts, registrationYear, currentYearLocal]);
  

  useEffect(() => {
    const current = posts.filter((p) => p.readingStatus === '독서중');
    const finished = posts.filter(
      (p) =>
        p.readingStatus === '완독' &&
        p.endDate &&
        new Date(p.endDate).getFullYear() === selectedGoalYear
    );
    const sortedCurrent = [...current].sort((a, b) => {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA;
    });
    const sortedFinished = [...finished].sort((a, b) => {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : (a.endDate ? new Date(a.endDate).getTime() : 0);
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : (b.endDate ? new Date(b.endDate).getTime() : 0);
      return dateB - dateA;
    });
    setCurrentReading(sortedCurrent.slice(0, 5));
    setFinishedReading(sortedFinished.slice(0, 5));
    setYearlyAchieved(sortedFinished.length);
  }, [posts, selectedGoalYear]);


  function handleGoalSubmit() {
    const newGoal = parseInt(tempGoalValue, 10) || 0;
    if (newGoal <= 0) {
      alert('1 이상의 숫자를 입력하세요.');
      return;
    }
    
    const currentYear = new Date().getFullYear();
    localStorage.setItem("yearlyGoal", String(newGoal));
    localStorage.setItem(`yearlyGoal_${currentYear}`, String(newGoal));
  
    setYearlyGoal(newGoal);
    setShowGoalModal(false);
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setStatTabIndex(prevIndex => (prevIndex + 1) % 3);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // 기본 추천 도서 불러오기
  useEffect(() => { 
    fetch(`${BASE_URL}/recommend`) 
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

  function handleRecommendOk() {
    if (!selectedGenre) {
      alert('장르를 선택해주세요.');
      return;
    }
  
    fetch(`${BASE_URL}/recommend?genre=${selectedGenre}`)
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

  const computedGenreData = useMemo(() => {
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
      <div style={{ 
        maxWidth: '1200px',
        width: '100%', 
        margin: '0 auto',
        paddingBottom: '80px'
      }}>
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
          {/* 목표 관리 카드 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '25px' }}>목표 관리</h3>
            <div
              style={{
                backgroundColor: 'rgba(128,128,128,0.2)',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
              }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  width: '500px',
                  height: '300px',
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
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
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid #eee',
                      paddingRight: '10px',
                      height: '100%',
                    }}
                  >
                    {yearlyGoal === 0 ? (
                      <div
                        style={{
                          width: '90px',
                          height: '90px',
                          border: '8px solid #E0E0E0',
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
                    ) : (
                      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: `conic-gradient(
                              #F0F0F0 ${angle}deg 360deg,
                              transparent 0deg ${angle}deg
                            )`,
                            zIndex: 1,
                          }}
                        >
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
                    <div
                      style={{
                        display: 'flex',
                        gap: '30px',
                        marginTop: '45px',
                      }}
                    >
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
                  <div style={{ paddingLeft: '10px' }}>
                    {yearlyGoal === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <p style={{ fontSize: '14px', lineHeight: '2', color: '#333' }}>
                          아직 목표가 설정되지 않았어요! <br />
                          아래의 목표 설정 버튼을 클릭하여 올해 목표를 설정하고 달성해보세요!
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
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #F8F3EE, #FFFFFF)',
                            borderRadius: '8px',
                            padding: '15px',
                            width: '260px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #C5BBB1',
                                padding: '5px 0',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px', fontSize: '16px' }}>📚</span>
                                <span style={{ fontWeight: 'bold' }}>목표</span>
                              </div>
                              <span>{yearlyGoal}권</span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #C5BBB1',
                                padding: '8px 0',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px', fontSize: '16px' }}>✅</span>
                                <span style={{ fontWeight: 'bold' }}>달성</span>
                              </div>
                              <span>{yearlyAchieved}권</span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px', fontSize: '16px' }}>⏳</span>
                                <span style={{ fontWeight: 'bold' }}>남은 책</span>
                              </div>
                              <span>{yearlyGoal - yearlyAchieved}권</span>
                            </div>
                          </div>
                          <div
                            style={{
                              paddingTop: '5px',
                              marginTop: '1px',
                              textAlign: 'center',
                            }}
                          >
                            <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#FF5C00' }}>
                              {getCheerMessage(ratio)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '25px' }}>통계</h3>
            <div
              style={{
                backgroundColor: 'rgba(128,128,128,0.2)',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
              }}
            >
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
                {progressData ? (
                  <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      display: 'flex',
                      transform: `translateX(-${statTabIndex * 100}%)`,
                      transition: 'transform 0.5s ease'
                    }}>
                      <div style={{ flex: '0 0 100%' }}>
                        <AnnualLineChart chartData={homeYearlyChartData} registrationYear={registrationYear} fromLabel={`가입 연도: ${registrationYear}년 ~ 최근`} />
                      </div>
                      <div style={{ flex: '0 0 100%' }}>
                        {(() => {
                          const currentMonth = new Date().getMonth() + 1;
                          return (
                            <MonthlyBarChart
                              chartData={progressData.recent6Months.map(item => ({
                                month: item.month,
                                goal: item.month === `${currentMonth}월` ? monthlyGoal : 0,
                                achieved: item.count
                              }))}
                              monthlyGoal={monthlyGoal}
                            />
                          );
                        })()}
                      </div>
                      <div style={{ flex: '0 0 100%' }}>
                        <HomeGenreDoughnutChart genreData={computedGenreData} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>통계 데이터를 불러오는 중...</p>
                )}
              </div>
            </div>
          </div>

          {/* 독서 기록 카드 (탭 인터페이스 적용) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '25px' }}>독서 기록</h3>
            <div
              style={{
                backgroundColor: 'rgba(128,128,128,0.2)',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
              }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  width: '500px',
                  height: '300px',
                  margin: '0 auto',
                  padding: '0px 20px',
                }}
              >
                {/* 탭 헤더 */}
                <div style={{ margin: '0 -20px', padding: 0 }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px', padding: 0 }}>
                    <button
                      onClick={() => setRecordTab('current')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: recordTab === 'current' ? '#556B2F' : '#fff',
                        color: recordTab === 'current' ? '#fff' : '#333',
                        border: 'none',
                        borderBottom: recordTab === 'current' ? '2px solid #556B2F' : 'none',
                        cursor: 'pointer',
                        borderTopLeftRadius: '8px', // 왼쪽 상단 둥글게
                      }}
                    >
                      현재 읽고 있는 책
                    </button>
                    <button
                      onClick={() => setRecordTab('finished')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: recordTab === 'finished' ? '#4B3621' : '#fff',
                        color: recordTab === 'finished' ? '#fff' : '#333',
                        border: 'none',
                        borderBottom: recordTab === 'finished' ? '2px solid #4B3621' : 'none',
                        cursor: 'pointer',
                        borderTopRightRadius: '8px', // 오른쪽 상단 둥글게
                      }}
                    >
                      최근 완독한 책
                    </button>
                  </div>
                </div>

                {recordTab === 'current' && (
                  currentReading.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <p style={{ fontSize: '18px', color: '#555', marginBottom: '20px' }}>
                        현재 읽고 있는 책이 없습니다.
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
                    currentReading.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => navigate(`/post/${post.id}`)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: '1px solid #eee',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '15px' }}>{post.title}</span>
                        <span style={{ fontSize: '14px', color: '#555' }}>
                          {post.startDate ? `시작일 | ${post.startDate}` : ''}
                        </span>
                      </div>
                    ))
                  )
                )}

                {recordTab === 'finished' && (
                  finishedReading.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <p style={{ fontSize: '18px', color: '#555', marginBottom: '20px' }}>
                        최근 완독한 책이 없습니다.
                      </p>
                    </div>
                  ) : (
                    finishedReading.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => navigate(`/post/${post.id}`)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: '1px solid #eee',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '15px' }}>{post.title}</span>
                        <span style={{ fontSize: '14px', color: '#555' }}>
                          {post.endDate ? `완독일 | ${post.endDate}` : ''}
                        </span>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>

          {/* 추천 도서 카드 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '25px' }}>추천 도서</h3>
            <div
              style={{
                backgroundColor: 'rgba(128,128,128,0.2)',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
              }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  width: '500px',
                  height: '300px',
                  margin: '0 auto',
                  padding: '30px 5px 30px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
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
                <div
                  style={{
                    width: '180px',
                    height: '290px',
                    backgroundColor: '#ccc',
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
            <div
              style={{
                position: 'absolute',
                top: '1px',
                right: '10px',
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
                fontSize: '15px',
                textAlign: 'center',
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
                onClick={handleGoalSubmit}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 추천 도서 Modal */}
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
                      width: '180px',
                      height: '260px',
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
                        style={{ width: '180px', height: '260px', objectFit: 'cover' }}
                      />
                    ) : null}
                  </div>
                  <h4 style={{ margin: '0 0 20px 0', fontSize: '17px', fontWeight: 'bold' }}>
                    {modalRecommendedBook?.title || '추천할 책이 없습니다.'}
                  </h4>
                  <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#555' }}>
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
