import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { BarChart3, CalendarDays, Target, Trophy } from 'lucide-react';
import {
  createAnnualGoal,
  createMonthlyGoal,
  getAnnualCompletedCounts,
  getAnnualCompletedSummary,
  getAnnualGoal,
  getBasicStats,
  getGenreStats,
  getMonthlyGoal,
  updateAnnualGoal,
  updateMonthlyGoal,
  type AnnualCompletedSummary,
  type AnnualGoal,
  type BasicStats,
  type GenreStats,
  type MonthlyGoal,
  type MonthlyReadCount,
} from '../api/progressApi';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

export default function ProgressPage() {
  const now = useMemo(() => new Date(), []);
  const { user } = useAuth();
  const defaultYear = now.getFullYear();
  const startYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : defaultYear;
  const defaultMonth = now.getMonth() + 1;

  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [stats, setStats] = useState<BasicStats | null>(null);
  const [genres, setGenres] = useState<GenreStats[]>([]);
  const [completedCounts, setCompletedCounts] = useState<MonthlyReadCount[]>([]);
  const [completedSummary, setCompletedSummary] = useState<AnnualCompletedSummary | null>(null);
  const [monthlyGoal, setMonthlyGoal] = useState<MonthlyGoal | null>(null);
  const [annualGoal, setAnnualGoal] = useState<AnnualGoal | null>(null);
  const [monthlyGoalCount, setMonthlyGoalCount] = useState(1);
  const [annualGoalCount, setAnnualGoalCount] = useState(1);
  const [isMonthlyEditing, setIsMonthlyEditing] = useState(false);
  const [isAnnualEditing, setIsAnnualEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [statsLoading, setStatsLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(true);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      setStats(await getBasicStats());
    } catch {
      setMessage('현재 기준 통계를 불러오지 못했습니다.');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadPeriodData = async (clearMessage = true) => {
    setPeriodLoading(true);
    if (clearMessage) {
      setMessage('');
    }
    try {
      const [genreStats, annualCompletedCounts, annualSummary] = await Promise.all([
        getGenreStats(year, month),
        getAnnualCompletedCounts(year),
        getAnnualCompletedSummary(year),
      ]);
      setGenres(genreStats);
      setCompletedCounts(annualCompletedCounts);
      setCompletedSummary(annualSummary);

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
      setMessage('선택 기간 데이터를 불러오지 못했습니다.');
    } finally {
      setPeriodLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadPeriodData();
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
    setIsMonthlyEditing(false);
    await loadPeriodData(false);
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
    setIsAnnualEditing(false);
    await loadPeriodData(false);
  };

  const statItems = [
    { label: '총 완독', value: stats?.totalFinished ?? 0, icon: Trophy, cardClass: 'bg-emerald-50/80 border-emerald-100', iconClass: 'bg-emerald-100 text-emerald-700' },
    { label: '올해 완독', value: stats?.currentYearFinished ?? 0, icon: CalendarDays, cardClass: 'bg-sky-50/80 border-sky-100', iconClass: 'bg-sky-100 text-sky-700' },
    { label: '이번 달 완독', value: stats?.currentMonthFinished ?? 0, icon: Target, cardClass: 'bg-amber-50/80 border-amber-100', iconClass: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="rounded-[2rem] border border-border bg-card p-4 shadow-card sm:p-6 lg:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">Progress dashboard</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">독서 진행 현황</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          현재 기준 통계와 선택 기간의 목표·장르·연간 완독 흐름을 분리해서 확인하세요.
        </p>
      </div>

      {message ? (
        <p className="rounded-[1.25rem] border border-border bg-secondary/70 px-4 py-3 text-sm font-bold text-secondary-foreground">
          {message}
        </p>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Today snapshot</p>
          <h2 className="mt-2 text-2xl font-black text-foreground">현재 기준 통계</h2>
        </div>
        {statsLoading ? (
          <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
            <Spinner label="현재 통계를 불러오는 중..." />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.label} className={`rounded-[1.5rem] border p-6 shadow-soft ${item.cardClass}`}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-bold text-muted-foreground">{item.label}</p>
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconClass}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-4 text-4xl font-black tracking-tight text-foreground">
                    {item.value}<span className="ml-1 text-lg font-semibold text-muted-foreground">권</span>
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <article className="rounded-[1.75rem] border border-border bg-card p-6 shadow-card lg:p-8">
        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Selectable period</p>
            <h2 className="mt-2 text-2xl font-black text-foreground">목표와 장르 통계 기간</h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{year}년 {month}월 기준으로 목표와 장르 통계를 계산합니다.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="연도 선택" className="min-w-[7.5rem] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-soft">
              {Array.from({ length: defaultYear - startYear + 1 }, (_, i) => startYear + i).map((y) => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} aria-label="월 선택" className="min-w-[7.5rem] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-soft">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}월</option>)}
            </select>
          </div>
        </div>


        {periodLoading ? (
          <div className="pt-8"><Spinner label="선택 기간 데이터를 불러오는 중..." /></div>
        ) : (
          <div className="space-y-8 pt-6">
            <section>
              <h3 className="text-xl font-black text-foreground">목표 현황</h3>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <GoalCard title="월간 목표" eyebrow="Monthly goal" value={monthlyGoal?.goalCount} editing={isMonthlyEditing} count={monthlyGoalCount} setCount={setMonthlyGoalCount} onEdit={() => setIsMonthlyEditing(true)} onCancel={() => setIsMonthlyEditing(false)} onSubmit={submitMonthlyGoal} actionLabel={monthlyGoal ? '목표 수정' : '목표 설정'} />
                <GoalCard title="연간 목표" eyebrow="Annual goal" value={annualGoal?.goalCount} editing={isAnnualEditing} count={annualGoalCount} setCount={setAnnualGoalCount} onEdit={() => setIsAnnualEditing(true)} onCancel={() => setIsAnnualEditing(false)} onSubmit={submitAnnualGoal} actionLabel={annualGoal ? '목표 수정' : '목표 설정'} />
              </div>
            </section>

                    <section className="border-t border-border pt-8">
              <SectionTitle icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />} eyebrow="Genre insights" title={`${year}년 ${month}월 장르 통계`} />
              {genres.length === 0 ? (
                <div className="mt-6"><EmptyState title="장르 통계가 없어요" description="선택한 기간에 완독한 책의 장르가 표시됩니다." /></div>
              ) : (
                <ul className="mt-6 space-y-4">
                  {genres.map((genre) => (
                    <li key={genre.genre}>
                      <div className="mb-2 flex justify-between gap-4 text-sm font-bold">
                        <span className="text-foreground">{genre.genre}</span>
                        <span className="text-muted-foreground">{genre.count}권 · {genre.percentage.toFixed(1)}%</span>
                      </div>
                    <div className="h-3 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${genre.percentage}%` }} /></div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="border-t border-border pt-8">
              <SectionTitle icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />} eyebrow="Annual reading trend" title={`${year}년 연간 독서량 추이`} />
              <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
                월별 완독 권수 기준으로 차트와 요약 수치를 계산합니다.
              </p>
              <AnnualCompletedSummaryCard summary={completedSummary} />
              <MonthlyBarChart data={completedCounts} currentYear={defaultYear} currentMonth={defaultMonth} selectedYear={year} />
            </section>
          </div>
        )}
      </article>
    </section>
  );
}

function GoalCard({ title, eyebrow, value, editing, count, setCount, onEdit, onCancel, onSubmit, actionLabel }: { title: string; eyebrow: string; value?: number; editing: boolean; count: number; setCount: (count: number) => void; onEdit: () => void; onCancel: () => void; onSubmit: (e: FormEvent) => void; actionLabel: string }) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-gradient-to-br from-sky-50 via-sky-100/60 to-indigo-50 p-6">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-black text-foreground">{title}</h3>
      {editing ? (
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input type="number" min={1} value={count || ''} onChange={(e) => setCount(e.target.value === '' ? 0 : Number(e.target.value))} placeholder="목표 권수를 입력하세요" required />
          <div className="flex gap-2">
            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft">저장</button>
            <button type="button" onClick={onCancel} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary">취소</button>
          </div>
        </form>
      ) : (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-4xl font-black text-foreground">{value ?? '-'}{value ? <span className="ml-1 text-lg font-semibold text-muted-foreground">권</span> : null}</p>
          <button type="button" onClick={onEdit} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary">{actionLabel}</button>
        </div>
      )}
    </article>
  );
}

function SectionTitle({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">{icon}</span>
      <div><p className="text-sm font-bold text-muted-foreground">{eyebrow}</p><h2 className="text-2xl font-black text-foreground">{title}</h2></div>
    </div>
  );
}

function AnnualCompletedSummaryCard({ summary }: { summary: AnnualCompletedSummary | null }) {

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <MiniStat label="연간 완독" value={`${summary?.totalCount ?? 0}권`} tone="indigo" />
      <MiniStat label="최고 월" value={summary?.bestMonth ? `${summary.bestMonth}월 · ${summary.bestMonthCount}권` : '-'} tone="emerald" />
      <MiniStat label="완독한 달" value={`${summary?.activeMonthCount ?? 0}개월`} tone="amber" />
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: 'indigo' | 'emerald' | 'amber' }) {
  return (
    <div className={`rounded-[1.25rem] border px-4 py-3 ${tone === 'indigo' ? 'border-indigo-200 bg-indigo-50/60' : tone === 'emerald' ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/70'}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-black text-foreground">{value}</p>
    </div>
  );
}

function MonthlyBarChart({ data, currentYear, currentMonth, selectedYear }: { data: MonthlyReadCount[]; currentYear: number; currentMonth: number; selectedYear: number }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const hasData = data.some((item) => item.count > 0);

  if (!hasData) {
    return <div className="mt-6"><EmptyState title="독서 데이터가 없어요" description="책을 완독하면 월별 완독 권수가 표시돼요." /></div>;
  }

  return (
    <div className="mt-6 flex items-end gap-2">
      {Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const count = data.find((item) => item.month === month)?.count ?? 0;
        const heightPercent = count > 0 ? Math.max((count / maxCount) * 100, 8) : 0;
        const isCurrentMonth = month === currentMonth && selectedYear === currentYear;
        const monthColors = [
          'bg-rose-300',
          'bg-orange-300',
          'bg-amber-300',
          'bg-lime-300',
          'bg-emerald-300',
          'bg-teal-300',
          'bg-cyan-300',
          'bg-sky-300',
          'bg-blue-300',
          'bg-indigo-300',
          'bg-violet-300',
          'bg-fuchsia-300',
        ];
        return (
          <div key={month} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">{count > 0 ? count : ''}</span>
            <div className="flex h-40 w-full items-end rounded-t-lg bg-muted">
              <div
                className={`w-full rounded-t-lg transition-all ${isCurrentMonth ? 'ring-2 ring-indigo-400' : ''} ${monthColors[i]}`}
                style={{ height: `${heightPercent}%` }}
              />
            </div>
          <span className={`text-xs font-bold ${isCurrentMonth ? 'text-primary' : 'text-muted-foreground'}`}>{month}월</span>
          </div>
        );
      })}
    </div>
  );
}