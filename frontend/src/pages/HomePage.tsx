import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../api/http';
import { getBestsellers, getHomeStats, getRecentPosts, type BasicStats, type BestsellerBook, type HomePost } from '../api/homeApi';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

const statusLabel: Record<string, string> = {
  COMPLETED: '완독',
  READING: '읽는 중',
  WISHLIST: '읽고 싶은 책',
  PAUSED: '중단',
};

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
    return <EmptyState 
    title="Booktine에 오신 것을 환영합니다" 
    description="로그인 후 오늘의 독서 현황과 최근 메모를 확인해 보세요." 
    actionLabel="로그인하기" actionTo="/login" />;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-semibold">오늘의 독서 대시보드</h2>
      {loading && <Spinner />}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float"><p className="text-sm text-muted-foreground">총 완독 권수</p><p className="mt-2 text-3xl font-semibold">{stats?.totalFinished ?? 0}</p></article>
            <article className="rounded-xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float"><p className="text-sm text-muted-foreground">올해 완독</p><p className="mt-2 text-3xl font-semibold">{stats?.currentYearFinished ?? 0}</p></article>
            <article className="rounded-xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float"><p className="text-sm text-muted-foreground">이번 달 완독</p><p className="mt-2 text-3xl font-semibold">{stats?.currentMonthFinished ?? 0}</p></article>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl border bg-card p-5">
              <h3 className="text-xl font-semibold">최근 독서 노트</h3>
              {recentPosts.length === 0 ? <EmptyState title="기록이 아직 없어요" description="첫 독서 노트를 추가해 보세요." actionLabel="독서노트로 이동" actionTo="/books" /> : (
                <ul className="mt-4 space-y-3">
                  {recentPosts.map((post) => <li key={post.id} className="rounded-lg border bg-background p-3"><Link to={`/books/${post.id}`} className="font-medium">{post.title}</Link><p className="text-sm text-muted-foreground">{post.author || '저자 미입력'} · {statusLabel[post.readingStatus] ?? post.readingStatus}</p></li>)}
                </ul>
              )}
            </article>

          <article className="rounded-xl border bg-card p-5">
              <h3 className="text-xl font-semibold">요즘 많이 읽는 책</h3>
              {bestsellers.length === 0 ? <EmptyState title="베스트셀러 데이터 없음" description="잠시 후 다시 확인해 주세요." /> : (
                <ul className="mt-4 space-y-3">
                  {bestsellers.slice(0, 5).map((book) => <li key={book.isbn13} className="rounded-lg border bg-background p-3"><p className="font-medium">{book.title}</p><p className="text-sm text-muted-foreground">{book.author} · {book.publisher}</p></li>)}
                </ul>
              )}
            </article>
          </div>
        </>
      )}
    </section>
  );
}