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
import Spinner from '@/components/common/Spinner';

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
      const [basicStats, genreStats, annualTrend] = await Promise.all([getBasicStats(), getGenreStats(), getAnnualTrend(year)]);
      setStats(basicStats); setGenres(genreStats); setTrend(annualTrend);
      try { const monthly = await getMonthlyGoal(year, month); setMonthlyGoal(monthly); setMonthlyGoalCount(monthly.goalCount); } catch { setMonthlyGoal(null); setMonthlyGoalCount(1); }
      try { const annual = await getAnnualGoal(year); setAnnualGoal(annual); setAnnualGoalCount(annual.goalCount); } catch { setAnnualGoal(null); setAnnualGoalCount(1); }
    } catch { setMessage('진행도 데이터를 불러오지 못했습니다.'); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [year, month]);

  const submitMonthlyGoal = async (e: FormEvent) => { 
    e.preventDefault(); 
    const payload = { year, month, goalCount: monthlyGoalCount }; 
    if (monthlyGoal) { await updateMonthlyGoal(year, month, payload); 
      setMessage('월간 목표를 수정했습니다.'); } else { await createMonthlyGoal(payload); 
        setMessage('월간 목표를 생성했습니다.'); } 
        await load(); 
      };
  const submitAnnualGoal = async (e: FormEvent) => { 
    e.preventDefault(); 
    const payload = { year, goalCount: annualGoalCount }; 
    if (annualGoal) { await updateAnnualGoal(year, payload); 
      setMessage('연간 목표를 수정했습니다.'); } else { await createAnnualGoal(payload); 
        setMessage('연간 목표를 생성했습니다.'); } 
        await load(); 
      };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-5">
        <h2 className="mr-auto font-serif text-3xl">독서 Progress</h2>
        <label className="text-sm">연도
          <input className="ml-2 w-24 rounded-lg border bg-background px-2 py-1" type="number" min={2000} value={year} onChange={(e) => setYear(Number(e.target.value))} /></label>
        <label className="text-sm">월
          <input className="ml-2 w-20 rounded-lg border bg-background px-2 py-1" type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} /></label>
      </div>
      {loading ? <Spinner /> : (
        <>
          {message && <p className="rounded-lg bg-secondary/60 px-3 py-2 text-sm">{message}</p>}
          <div className="grid gap-4 md:grid-cols-3">
            {[['총 완독', stats?.totalFinished ?? 0], ['올해 완독', stats?.currentYearFinished ?? 0], ['이번 달 완독', stats?.currentMonthFinished ?? 0]].map(([k, v]) => (
              <article key={String(k)} className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{k}</p><p className="mt-2 font-serif text-3xl">{v}</p></article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border bg-card p-5">
              <h3 className="font-serif text-xl">{year}년 월별 완독 추이</h3>
              <ul className="mt-4 space-y-2">
                {trend.map((row) => <li key={row.month}><div className="mb-1 flex justify-between text-sm"><span>{row.month}월</span><span>{row.count}권</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, row.count * 10)}%` }} /></div></li>)}
              </ul>
            </article>
            <article className="rounded-2xl border bg-card p-5">
              <h3 className="font-serif text-xl">장르 통계</h3>
              <ul className="mt-4 space-y-2">
                {genres.map((genre) => <li key={genre.genre}><div className="mb-1 flex justify-between text-sm"><span>{genre.genre}</span><span>{genre.count}권 · {genre.percentage.toFixed(1)}%</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-accent" style={{ width: `${genre.percentage}%` }} /></div></li>)}
              </ul>
            </article>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <form onSubmit={submitMonthlyGoal} className="rounded-xl border bg-card p-4">
              <h4 className="font-serif text-lg">월간 목표</h4>
              <input className="mt-3 w-full rounded-lg border bg-background px-3 py-2" type="number" min={1} value={monthlyGoalCount} onChange={(e) => setMonthlyGoalCount(Number(e.target.value))} required />
              <button className="mt-3" type="submit">
                {monthlyGoal ? '월간 목표 수정' : '월간 목표 생성'}
              </button>
            </form>
            <form onSubmit={submitAnnualGoal} className="rounded-xl border bg-card p-4">
              <h4 className="font-serif text-lg">연간 목표</h4>
              <input className="mt-3 w-full rounded-lg border bg-background px-3 py-2" type="number" min={1} value={annualGoalCount} onChange={(e) => setAnnualGoalCount(Number(e.target.value))} required />
              <button className="mt-3" type="submit">
                {annualGoal ? '연간 목표 수정' : '연간 목표 생성'}
              </button>
            </form>
          </div>
        </>
      )}
    </section>
  );
}
