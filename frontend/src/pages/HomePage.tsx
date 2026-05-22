import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, PenLine, TrendingUp } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { getBestsellers, getHomeStats, getRecentPosts, type BasicStats, type BestsellerBook, type HomePost } from '../api/homeApi';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';
import { STATUS_CLASS_NAME, STATUS_LABEL } from '../constants/readingStatus';
import slideHome from '@/assets/slides/slide-home.png';
import slideBooknote from '@/assets/slides/slide-booknote.png';
import slideProgress from '@/assets/slides/slide-progress.png';
import slideRecommendation from '@/assets/slides/slide-recommendation.png';
import slideCommunity from '@/assets/slides/slide-community.png';

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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10).replace(/-/g, '.');
  }

  return date.toISOString().slice(0, 10).replace(/-/g, '.');
}

export default function HomePage() {
  const { isAuthenticated: isLoggedIn, initializing } = useAuth();
  const [stats, setStats] = useState<BasicStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<HomePost[]>([]);
  const [bestsellers, setBestsellers] = useState<BestsellerBook[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    { src: slideHome, alt: '홈 대시보드 화면' },
    { src: slideBooknote, alt: '독서 기록 화면' },
    { src: slideProgress, alt: 'Progress 목표 및 통계 화면' },
    { src: slideRecommendation, alt: '도서 추천 화면' },
    { src: slideCommunity, alt: '커뮤니티 화면' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const loadHome = async () => {
      if (initializing || !isLoggedIn) {
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
  }, [initializing, isLoggedIn]);

  if (!initializing && !isLoggedIn) {
    return (
      <section className="bg-card">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-muted-foreground shadow-soft">
              독서 습관 추적 & 목표 관리 서비스
            </p>
            <h1 className="mt-7 text-4xl font-black tracking-tight text-foreground break-keep sm:text-5xl lg:text-6xl">
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

            <div className="mt-12 grid gap-4 sm:grid-cols-3 sm:items-stretch">
              {featureItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article key={item.title} className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft">
                    <Icon className="h-5 w-5 text-foreground" />
                    <h2 className="mt-4 text-sm font-black text-foreground sm:text-base">
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
            <div className="absolute -left-6 top-10 z-30 hidden rounded-2xl border border-border bg-card/95 p-5 shadow-float backdrop-blur-sm lg:block">
              <p className="text-sm font-bold text-muted-foreground">누적 독서 노트</p>
              <p className="mt-1 text-4xl font-black text-foreground">∞</p>
            </div>
            <div className="relative overflow-visible rounded-[2rem] border border-border bg-secondary shadow-card">
              <img
                src={slides[activeSlide].src}
                alt={slides[activeSlide].alt}
                className="h-full min-h-[28rem] w-full object-cover object-center transition-all duration-500"
              />
              <div className="absolute -bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full border border-border bg-foreground/95 px-3 py-2 shadow-card">
                {slides.map((slide, index) => (
                  <button
                    key={slide.alt}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      index === activeSlide ? 'w-6 bg-white' : 'bg-white/55 hover:bg-white/80'
                    }`}
                    aria-label={`${index + 1}번 슬라이드로 이동`}
                  />
                ))}
              </div>
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
      <div className="grid gap-8 rounded-[2rem] border border-border bg-card p-6 shadow-card lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Reading dashboard
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground break-keep sm:text-4xl">
            오늘의 독서 흐름을 확인하세요.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            완독 통계부터 최근 독서 노트와 많이 읽히는 책까지 한 번에 확인하고, 오늘 읽을 분량과 다음 기록 계획을 자연스럽게 이어갈 수 있어요.
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
            className="h-72 w-full object-cover object-center lg:h-full brightness-110"
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
            <article className="rounded-2xl border border-border border-l-4 border-l-indigo-300 bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float">
              <p className="text-sm font-bold text-muted-foreground"><span className="text-foreground">총</span> 완독 권수</p>
              <p className="mt-3 text-4xl font-black text-indigo-400">
                {stats?.totalFinished ?? 0}
                <span className="ml-1 text-lg font-semibold text-muted-foreground">권</span>
              </p>
            </article>
            <article className="rounded-2xl border border-border border-l-4 border-l-violet-300 bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float">
              <p className="text-sm font-bold text-muted-foreground"><span className="text-foreground">올해</span> 완독</p>
              <p className="mt-3 text-4xl font-black text-violet-400">
                {stats?.currentYearFinished ?? 0}
                <span className="ml-1 text-lg font-semibold text-muted-foreground">권</span>
              </p>
            </article>
            <article className="rounded-2xl border border-border border-l-4 border-l-amber-300 bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float">
              <p className="text-sm font-bold text-muted-foreground"><span className="text-foreground">이번 달</span> 완독</p>
              <p className="mt-3 text-4xl font-black text-amber-400">
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
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-base font-bold text-foreground hover:bg-secondary"
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
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-base font-black text-foreground">
                            {post.title}
                          </p>
                          <span
                            className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-black ${STATUS_CLASS_NAME[post.readingStatus as keyof typeof STATUS_CLASS_NAME] ?? 'bg-secondary text-secondary-foreground'}`}
                          >
                            {STATUS_LABEL[post.readingStatus as keyof typeof STATUS_LABEL] ?? post.readingStatus}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-muted-foreground">
                          {post.author || '저자 미입력'} · {formatDate(post.createdAt)}
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
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-base font-bold text-foreground hover:bg-secondary"
                >
                  추천 보기
                </Link>
              </div>

              {bestsellers.length === 0 ? (
                <ul className="mt-5 space-y-3" aria-label="베스트셀러 로딩 스켈레톤">
                  {Array.from({ length: 5 }, (_, index) => (
                    <li key={`skeleton-${index}`} className="flex gap-4 rounded-2xl border border-border bg-background p-4">
                      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                      </div>
                    </li>
                  ))}
                </ul>
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