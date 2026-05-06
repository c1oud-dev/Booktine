import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, PenLine, TrendingUp } from 'lucide-react';
import { getAccessToken } from '../api/http';
import { getBestsellers, getHomeStats, getRecentPosts, type BasicStats, type BestsellerBook, type HomePost } from '../api/homeApi';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

const statusLabel: Record<string, string> = {
  COMPLETED: '완독',
  READING: '읽는 중',
  WISHLIST: '읽고 싶은 책',
  WANT_TO_READ: '읽고 싶은 책',
  PAUSED: '중단',
};

const featureItems = [
  {
    icon: CheckCircle2,
    title: '습관과 목표를 한눈에',
    description: '이번 달 완독 권수와 진행 상황을 깔끔한 카드로 확인하세요.',
  },
  {
    icon: PenLine,
    title: '문장과 생각을 기록',
    description: '책마다 떠오른 감상과 메모를 독서노트에 차곡차곡 남길 수 있어요.',
  },
  {
    icon: TrendingUp,
    title: '다음 책 선택까지',
    description: '베스트셀러와 추천 흐름을 참고해 다음 독서 리스트를 확장하세요.',
  },
];

export default function HomePage() {
  const isLoggedIn = useMemo(() => Boolean(getAccessToken()), []);
  const [stats, setStats] = useState<BasicStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<HomePost[]>([]);
  const [bestsellers, setBestsellers] = useState<BestsellerBook[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHome = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [statsData, postsPage, bestPage] = await Promise.all([
          getHomeStats(),
          getRecentPosts(),
          getBestsellers(),
        ]);

        setStats(statsData);
        setRecentPosts(postsPage.content);
        setBestsellers(bestPage.content);
      } catch {
        setError('홈 정보를 불러오지 못했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <section className="bg-card">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground shadow-soft">
              독서 습관 추적 & 목표 관리 서비스
            </p>
            <h1 className="mt-7 text-5xl font-black tracking-tight text-foreground break-keep sm:text-6xl lg:text-7xl">
              Booktine으로 독서 루틴을 더 선명하게.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              매일의 읽기, 책마다 남긴 노트, 완독까지의 진행률을 한 곳에서 정리하세요.
              불필요한 장식은 덜어내고 기록에 집중할 수 있게 만들었습니다.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-soft hover:shadow-float"
              >
                독서 노트 시작하기
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-4 text-base font-bold text-foreground shadow-soft hover:bg-secondary"
              >
                로그인
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {featureItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft min-w-0">
                    <Icon className="h-5 w-5 text-foreground" />
                    <h2 className="mt-4 text-base font-black text-foreground">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 hidden rounded-2xl border border-border bg-card p-5 shadow-card lg:block">
              <p className="text-sm font-bold text-muted-foreground">누적 독서 노트</p>
              <p className="mt-1 text-4xl font-black text-foreground">∞</p>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-border bg-secondary shadow-card">
              <img
                src="/Main.png"
                alt="가지런히 쌓인 책 이미지"
                className="h-full min-h-[28rem] w-full object-cover object-center"
              />
            </div>
            <div className="absolute -bottom-6 right-6 hidden max-w-xs rounded-2xl border border-border bg-card p-5 shadow-card sm:block">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-muted-foreground">오늘의 루틴</p>
                  <p className="text-base font-black text-foreground">30분 읽기 완료</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-8 rounded-[2rem] border border-border bg-card p-6 shadow-card lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Reading dashboard
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground break-keep sm:text-5xl">
            오늘의 독서 흐름을 확인하세요.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            완독 통계, 최근 독서 노트, 많이 읽히는 책을 한 화면에서 정리해 독서 루틴을 이어갈 수 있어요.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/books"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
            >
              독서노트 작성하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/progress"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary"
            >
              진도 보기
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-secondary">
          <img
            src="/Home1.png"
            alt="책과 독서 기록 이미지"
            className="h-80 w-full object-cover object-center lg:h-full brightness-110"
          />
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <Spinner label="홈 정보를 불러오는 중..." />
        </div>
      )}

      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float">
              <p className="text-sm font-bold text-muted-foreground">총 완독 권수</p>
              <p className="mt-3 text-4xl font-black text-foreground">
                {stats?.totalFinished ?? 0}
                <span className="ml-1 text-lg font-semibold text-muted-foreground">권</span>
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float">
              <p className="text-sm font-bold text-muted-foreground">올해 완독</p>
              <p className="mt-3 text-4xl font-black text-foreground">
                {stats?.currentYearFinished ?? 0}
                <span className="ml-1 text-lg font-semibold text-muted-foreground">권</span>
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float">
              <p className="text-sm font-bold text-muted-foreground">이번 달 완독</p>
              <p className="mt-3 text-4xl font-black text-foreground">
                {stats?.currentMonthFinished ?? 0}
                <span className="ml-1 text-lg font-semibold text-muted-foreground">권</span>
              </p>
            </article>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground">Recently updated</p>
                  <h2 className="mt-2 text-2xl font-black text-foreground">최근 독서 노트</h2>
                </div>
                <Link
                  to="/books"
                  className="text-sm font-bold text-foreground underline-offset-4 hover:underline"
                >
                  전체 보기
                </Link>
              </div>

              {recentPosts.length === 0 ? (
                <EmptyState
                  title="기록이 아직 없어요"
                  description="첫 독서 노트를 추가해 보세요."
                  actionLabel="독서노트로 이동"
                  actionTo="/books"
                />
              ) : (
                <ul className="mt-5 space-y-3">
                  {recentPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        to={`/books/${post.id}`}
                        className="block rounded-2xl border border-border bg-background p-4 transition hover:bg-card hover:shadow-soft"
                      >
                        <p className="text-base font-black text-foreground">
                          {post.title}
                        </p>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">
                          {post.author || '저자 미입력'} · {statusLabel[post.readingStatus] ?? post.readingStatus}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground">Popular picks</p>
                  <h2 className="mt-2 text-2xl font-black text-foreground">요즘 많이 읽는 책</h2>
                </div>
                <Link
                  to="/recommendations"
                  className="text-sm font-bold text-foreground underline-offset-4 hover:underline"
                >
                  추천 보기
                </Link>
              </div>

              {bestsellers.length === 0 ? (
                <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
                  베스트셀러 데이터를 불러올 수 없어요. 잠시 후 다시 확인해 주세요.
                </p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {bestsellers.slice(0, 5).map((book, index) => (
                    <li
                      key={book.isbn13}
                      className="flex gap-4 rounded-2xl border border-border bg-background p-4 transition hover:bg-card hover:shadow-soft"
                    >
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-black text-foreground">{book.title}</p>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                          {book.author} · {book.publisher}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}