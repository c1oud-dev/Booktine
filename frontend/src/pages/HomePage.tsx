import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../api/http';
import { getBestsellers, getHomeStats, getRecentPosts, type BasicStats, type BestsellerBook, type HomePost } from '../api/homeApi';

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
    return (
      <section>
        <h2>Booktine에 오신 것을 환영합니다</h2>
        <p>로그인 후 나의 독서 현황, 최근 기록, 베스트셀러를 한 번에 확인할 수 있어요.</p>
        <p>
          <Link to="/login">로그인하기</Link>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Home</h2>
      {loading && <p>불러오는 중...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <>
          <h3>내 독서 요약</h3>
          <ul>
            <li>총 완독 권수: {stats?.totalFinished ?? 0}</li>
            <li>올해 완독 권수: {stats?.currentYearFinished ?? 0}</li>
            <li>이번 달 완독 권수: {stats?.currentMonthFinished ?? 0}</li>
          </ul>

          <h3>최근 작성한 책 기록</h3>
          {recentPosts.length === 0 ? (
            <p>아직 작성한 책 기록이 없습니다.</p>
          ) : (
            <ul>
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link to={`/books/${post.id}`}>{post.title}</Link>
                  {' · '}
                  {post.author || '저자 미입력'}
                  {' · '}
                  {statusLabel[post.readingStatus] ?? post.readingStatus}
                </li>
              ))}
            </ul>
          )}

          <h3>베스트셀러</h3>
          {bestsellers.length === 0 ? (
            <p>베스트셀러 데이터가 없습니다.</p>
          ) : (
            <ul>
              {bestsellers.map((book) => (
                <li key={book.isbn13}>
                  <strong>{book.title}</strong> - {book.author}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}