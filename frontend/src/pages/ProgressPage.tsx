import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  createAnnualGoal,
  createMonthlyGoal,
  getAnnualGoal,
  getAnnualTrend,
  getBasicStats,
  getGenreStats,
  getMonthlyGoal,
  updateAnnualGoal,
  updateMonthlyGoal,
  type AnnualGoal,
  type BasicStats,
  type GenreStats,
  type MonthlyGoal,
  type MonthlyReadCount,
} from '../api/progressApi';

export default function ProgressPage() {
  const now = useMemo(() => new Date(), []);
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;

  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [stats, setStats] = useState<BasicStats | null>(null);
  const [genres, setGenres] = useState<GenreStats[]>([]);
  const [trend, setTrend] = useState<MonthlyReadCount[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<MonthlyGoal | null>(null);
  const [annualGoal, setAnnualGoal] = useState<AnnualGoal | null>(null);
  const [monthlyGoalCount, setMonthlyGoalCount] = useState(1);
  const [annualGoalCount, setAnnualGoalCount] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [basicStats, genreStats, annualTrend] = await Promise.all([
        getBasicStats(),
        getGenreStats(),
        getAnnualTrend(year),
      ]);
      setStats(basicStats);
      setGenres(genreStats);
      setTrend(annualTrend);

      try {
        const monthly = await getMonthlyGoal(year, month);
        setMonthlyGoal(monthly);
        setMonthlyGoalCount(monthly.goalCount);
      } catch {
        setMonthlyGoal(null);
        setMonthlyGoalCount(1);
      }

      try {
        const annual = await getAnnualGoal(year);
        setAnnualGoal(annual);
        setAnnualGoalCount(annual.goalCount);
      } catch {
        setAnnualGoal(null);
        setAnnualGoalCount(1);
      }
    } catch {
      setMessage('진행도 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [year, month]);

  const submitMonthlyGoal = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { year, month, goalCount: monthlyGoalCount };
    if (monthlyGoal) {
      await updateMonthlyGoal(year, month, payload);
      setMessage('월간 목표를 수정했습니다.');
    } else {
      await createMonthlyGoal(payload);
      setMessage('월간 목표를 생성했습니다.');
    }
    await load();
  };

  const submitAnnualGoal = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { year, goalCount: annualGoalCount };
    if (annualGoal) {
      await updateAnnualGoal(year, payload);
      setMessage('연간 목표를 수정했습니다.');
    } else {
      await createAnnualGoal(payload);
      setMessage('연간 목표를 생성했습니다.');
    }
    await load();
  };

  return (
    <section>
      <h2>Progress</h2>
      <label>
        연도
        <input type="number" min={2000} value={year} onChange={(e) => setYear(Number(e.target.value))} />
      </label>
      <label>
        월
        <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
      </label>

      {loading && <p>불러오는 중...</p>}
      {message && <p>{message}</p>}

      {!loading && (
        <>
          <h3>기본 통계</h3>
          <ul>
            <li>총 완독: {stats?.totalFinished ?? 0}</li>
            <li>올해 완독: {stats?.currentYearFinished ?? 0}</li>
            <li>이번 달 완독: {stats?.currentMonthFinished ?? 0}</li>
          </ul>

          <h3>장르 통계</h3>
          <ul>
            {genres.map((genre) => (
              <li key={genre.genre}>{genre.genre}: {genre.count}권 ({genre.percentage.toFixed(1)}%)</li>
            ))}
          </ul>

          <h3>{year}년 월별 완독 추이</h3>
          <ul>
            {trend.map((row) => (
              <li key={row.month}>{row.month}월: {row.count}권</li>
            ))}
          </ul>

          <h3>월간 목표</h3>
          <form onSubmit={submitMonthlyGoal} className="auth-form">
            <input
              type="number"
              min={1}
              value={monthlyGoalCount}
              onChange={(e) => setMonthlyGoalCount(Number(e.target.value))}
              required
            />
            <button type="submit">{monthlyGoal ? '월간 목표 수정' : '월간 목표 생성'}</button>
          </form>

          <h3>연간 목표</h3>
          <form onSubmit={submitAnnualGoal} className="auth-form">
            <input
              type="number"
              min={1}
              value={annualGoalCount}
              onChange={(e) => setAnnualGoalCount(Number(e.target.value))}
              required
            />
            <button type="submit">{annualGoal ? '연간 목표 수정' : '연간 목표 생성'}</button>
          </form>
        </>
      )}
    </section>
  );
}
