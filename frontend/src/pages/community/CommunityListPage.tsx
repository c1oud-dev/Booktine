import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquareText, PenLine, Plus, UsersRound } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';
import { getCommunityComments, getCommunityPosts, likeCommunityPost, unlikeCommunityPost, type CommunityPost } from '@/api/communityApi';
import { useAuth } from '@/auth/AuthContext';
import { cn } from '@/lib/utils';
import { formatCommunityDate, getLikedPostIds, saveLikedPostIds } from './communityUtils';

const pageSize = 10;

export default function CommunityListPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [likedIds, setLikedIds] = useState<Set<number>>(() => getLikedPostIds(user?.id));
  const [pendingLikeId, setPendingLikeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const totalPageCount = Math.max(totalPages, 1);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPageCount - 1;
  const likedKey = useMemo(() => [...likedIds].join(','), [likedIds]);

  useEffect(() => {
    setLikedIds(getLikedPostIds(user?.id));
  }, [user?.id]);

  useEffect(() => {
    saveLikedPostIds(user?.id, likedIds);
  }, [likedKey, user?.id]);

  const loadPosts = async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const result = await getCommunityPosts(page, pageSize);
      setPosts(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);

      const counts = await Promise.all(
        result.content.map(async (post) => [post.id, (await getCommunityComments(post.id)).length] as const),
      );
      setCommentCounts(Object.fromEntries(counts));
    } catch {
      setError('커뮤니티 게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage]);

  const toggleLike = async (post: CommunityPost) => {
    if (pendingLikeId) return;

    const wasLiked = likedIds.has(post.id);
    const previousPosts = posts;
    const previousLikedIds = new Set(likedIds);
    const nextLikedIds = new Set(likedIds);
    const nextLikeCount = Math.max(0, post.likeCount + (wasLiked ? -1 : 1));

    if (wasLiked) {
      nextLikedIds.delete(post.id);
    } else {
      nextLikedIds.add(post.id);
    }

    setPendingLikeId(post.id);
    setLikedIds(nextLikedIds);
    setPosts((items) => items.map((item) => (item.id === post.id ? { ...item, likeCount: nextLikeCount } : item)));

    try {
      const updated = wasLiked ? await unlikeCommunityPost(post.id) : await likeCommunityPost(post.id);
      setPosts((items) => items.map((item) => (item.id === post.id ? updated : item)));
    } catch {
      setLikedIds(previousLikedIds);
      setPosts(previousPosts);
      alert('좋아요 처리에 실패했습니다. 현재 좋아요 상태를 확인한 뒤 다시 시도해주세요.');
    } finally {
      setPendingLikeId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-6 rounded-[2rem] border border-border bg-card p-6 shadow-card lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">Reader community</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">커뮤니티</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            책을 읽으며 떠오른 생각, 질문, 추천을 다른 독자와 나눠보세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-sm font-bold text-secondary-foreground">
            <UsersRound className="h-5 w-5" aria-hidden="true" />총 {totalElements}개 글
          </div>
          <Link
            to="/community/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
          >
            <Plus className="h-4 w-4" />새 글 작성
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
          <Spinner label="커뮤니티 게시글을 불러오는 중..." />
        </div>
      ) : error ? (
        <EmptyState title="목록을 불러오지 못했어요" description={error} />
      ) : posts.length === 0 ? (
        <EmptyState title="아직 게시글이 없어요" description="첫 번째 이야기를 남기고 커뮤니티를 시작해보세요." actionLabel="새 글 작성" actionTo="/community/new" />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = likedIds.has(post.id);
            return (
              <article key={post.id} className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <Link to={`/community/${post.id}`} className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      작성자 #{post.userId} · {formatCommunityDate(post.createdAt)}
                    </p>
                    <h2 className="mt-2 line-clamp-2 text-2xl font-black tracking-tight text-foreground">{post.title}</h2>
                    <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{post.content}</p>
                  </Link>
                  <Link
                    to={`/community/${post.id}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                  >
                    <PenLine className="h-4 w-4" />읽기
                  </Link>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
                  <button
                    type="button"
                    onClick={() => toggleLike(post)}
                    disabled={pendingLikeId === post.id}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition',
                      isLiked ? 'bg-rose-100 text-rose-700' : 'bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-700',
                    )}
                  >
                    <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />{post.likeCount}
                  </button>
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">
                    <MessageSquareText className="h-4 w-4" />댓글 {commentCounts[post.id] ?? 0}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
          className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          이전
        </button>
        <span className="text-sm font-bold text-muted-foreground">{currentPage + 1} / {totalPageCount}</span>
        <button
          type="button"
          disabled={isLastPage}
          onClick={() => setCurrentPage((page) => page + 1)}
          className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </section>
  );
}
