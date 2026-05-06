import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, Target, Trophy } from 'lucide-react';
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
import EmptyState from '@/components/common/EmptyState';

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
  const [isMonthlyEditing, setIsMonthlyEditing] = useState(false);
  const [isAnnualEditing, setIsAnnualEditing] = useState(false);
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

  const statItems = [
    { label: '총 완독', value: stats?.totalFinished ?? 0, icon: Trophy },
    { label: '올해 완독', value: stats?.currentYearFinished ?? 0, icon: CalendarDays },
    { label: '이번 달 완독', value: stats?.currentMonthFinished ?? 0, icon: Target },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-card lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Progress dashboard
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            독서 진행 현황
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            완독 추이와 장르 분포, 월간·연간 목표를 함께 보며 꾸준한 독서 리듬을 조정하세요.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
          <Spinner label="진행도 데이터를 불러오는 중..." />
        </div>
      ) : (
        <>
          {message ? (
            <p className="rounded-[1.25rem] border border-border bg-secondary/70 px-4 py-3 text-sm font-bold text-secondary-foreground">
              {message}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            {statItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-bold text-muted-foreground">{item.label}</p>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-4 text-4xl font-black tracking-tight text-foreground">
                    {item.value}
                    <span className="ml-1 text-lg font-semibold text-muted-foreground">권</span>
                  </p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Monthly goal
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-foreground">
                    월간 목표
                  </h3>
                </div>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}월
                    </option>
                  ))}
                </select>
              </div>

              {isMonthlyEditing ? (
                <form
                  onSubmit={async (e) => {
                    await submitMonthlyGoal(e);
                    setIsMonthlyEditing(false);
                  }}
                  className="mt-5 space-y-3"
                >
                  <input
                    type="number"
                    min={1}
                    value={monthlyGoalCount || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMonthlyGoalCount(val === '' ? 0 : Number(val));
                    }}
                    placeholder="목표 권수를 입력하세요"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMonthlyEditing(false)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary"
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-4xl font-black text-foreground">
                    {monthlyGoal ? monthlyGoal.goalCount : '-'}
                    {monthlyGoal && (
                      <span className="ml-1 text-lg font-semibold text-muted-foreground">권</span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMonthlyGoalCount(monthlyGoal?.goalCount ?? 1);
                      setIsMonthlyEditing(true);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                  >
                    {monthlyGoal ? '목표 수정' : '목표 설정'}
                  </button>
                </div>
              )}
            </article>

            <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Annual goal
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-foreground">
                    연간 목표
                  </h3>
                </div>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Array.from({ length: 10 }, (_, i) => defaultYear - i).map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </select>
              </div>

              {isAnnualEditing ? (
                <form
                  onSubmit={async (e) => {
                    await submitAnnualGoal(e);
                    setIsAnnualEditing(false);
                  }}
                  className="mt-5 space-y-3"
                >
                  <input
                    type="number"
                    min={1}
                    value={annualGoalCount || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnnualGoalCount(val === '' ? 0 : Number(val));
                    }}
                    placeholder="목표 권수를 입력하세요"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnnualEditing(false)}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary"
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-4xl font-black text-foreground">
                    {annualGoal ? annualGoal.goalCount : '-'}
                    {annualGoal && (
                      <span className="ml-1 text-lg font-semibold text-muted-foreground">권</span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAnnualGoalCount(annualGoal?.goalCount ?? 1);
                      setIsAnnualEditing(true);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                  >
                    {annualGoal ? '목표 수정' : '목표 설정'}
                  </button>
                </div>
              )}
            </article>
          </div>

          <div className="grid gap-6">
            <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <BookGenreIcon />
                </span>
                <div>
                  <p className="text-sm font-bold text-muted-foreground">Genre insights</p>
                  <h2 className="text-2xl font-black text-foreground">장르 통계</h2>
                </div>
              </div>

              {genres.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="장르 통계가 없어요"
                    description="독서 노트에 장르를 기록하면 취향 분포를 볼 수 있어요."
                  />
                </div>
              ) : (
                <ul className="mt-6 space-y-4">
                  {genres.map((genre) => (
                    <li key={genre.genre}>
                      <div className="mb-2 flex justify-between gap-4 text-sm font-bold">
                        <span className="text-foreground">{genre.genre}</span>
                        <span className="text-muted-foreground">
                          {genre.count}권 · {genre.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${genre.percentage}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-muted-foreground">Monthly trend</p>
                  <h2 className="text-2xl font-black text-foreground">{year}년 월별 독서량</h2>
                </div>
              </div>

              {trend.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="독서 데이터가 없어요"
                    description="책을 완독하면 월별 독서량이 표시돼요."
                  />
                </div>
              ) : (
                <div className="mt-6">
                  {(() => {
                    const maxCount = Math.max(...trend.map((t) => t.count), 1);
                    return (
                      <div className="flex items-end gap-2">
                        {Array.from({ length: 12 }, (_, i) => {
                          const data = trend.find((t) => t.month === i + 1);
                          const count = data?.count ?? 0;
                          const heightPercent = (count / maxCount) * 100;
                          const isCurrentMonth = i + 1 === defaultMonth && year === defaultYear;

                          return (
                            <div key={i} className="flex flex-1 flex-col items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">
                                {count > 0 ? count : ''}
                              </span>
                              <div
                                className="w-full rounded-t-lg bg-muted"
                                style={{ height: '8rem' }}
                              >
                                <div
                                  className={`w-full rounded-t-lg transition-all ${
                                    isCurrentMonth ? 'bg-primary' : 'bg-primary/40'
                                  }`}
                                  style={{
                                    height: `${heightPercent}%`,
                                    marginTop: `${100 - heightPercent}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={`text-xs font-bold ${
                                  isCurrentMonth ? 'text-primary' : 'text-muted-foreground'
                                }`}
                              >
                                {i + 1}월
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}

function BookGenreIcon() {
  return <BarChart3 className="h-5 w-5" aria-hidden="true" />;
}
