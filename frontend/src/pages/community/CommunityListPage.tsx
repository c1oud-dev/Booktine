import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquareText, PenLine, Plus } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';
import {
  getCommunityComments,
  getCommunityPosts,
  getPopularCommunityPostsByComments,
  getPopularCommunityPostsByLikes,
  likeCommunityPost,
  unlikeCommunityPost,
  type CommunityPost,
} from '@/api/communityApi';
import { cn } from '@/lib/utils';
import { formatCommunityDate } from './communityUtils';

const pageSize = 10;
const defaultAvatar = '/default_avatar.png';

const getAuthorName = (post: CommunityPost) => post.authorNickname || `작성자 #${post.userId}`;

export default function CommunityListPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [pendingLikeId, setPendingLikeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  const [error, setError] = useState('');
  const [popularLikes, setPopularLikes] = useState<CommunityPost[]>([]);
  const [popularComments, setPopularComments] = useState<CommunityPost[]>([]);
  const [category, setCategory] = useState<'ALL' | 'GENERAL' | 'REVIEW' | 'QUESTION' | 'RECOMMEND'>('ALL');

  const totalPageCount = Math.max(totalPages, 1);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPageCount - 1;

  const loadPosts = async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const result = await getCommunityPosts(page, pageSize, category === 'ALL' ? undefined : category);
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
  }, [currentPage, category]);

  const loadPopularPosts = async () => {
    setPopularLoading(true);
    try {
      const [likes, comments] = await Promise.all([
        getPopularCommunityPostsByLikes(),
        getPopularCommunityPostsByComments(),
      ]);
      setPopularLikes(likes);
      setPopularComments(comments);
    } finally {
      setPopularLoading(false);
    }
  };

  useEffect(() => {
    loadPopularPosts();
  }, []);

  const toggleLike = async (post: CommunityPost) => {
    if (pendingLikeId) return;

    const wasLiked = post.isLiked;
    const previousPosts = posts;
    const nextLikeCount = Math.max(0, post.likeCount + (wasLiked ? -1 : 1));

    setPendingLikeId(post.id);
    setPosts((items) => items.map((item) => (item.id === post.id ? { ...item, isLiked: !wasLiked, likeCount: nextLikeCount } : item)));

    try {
      const updated = wasLiked ? await unlikeCommunityPost(post.id) : await likeCommunityPost(post.id);
      setPosts((items) => items.map((item) => (item.id === post.id ? updated : item)));
    } catch {
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
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">커뮤니티</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            책을 읽으며 떠오른 생각, 질문, 추천을 다른 독자와 나눠보세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/community/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
          >
            <Plus className="h-4 w-4" />새 글 작성
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ALL', 'GENERAL', 'REVIEW', 'QUESTION', 'RECOMMEND'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setCurrentPage(0);
              setCategory(item as typeof category);
            }}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-bold',
              category === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
            )}
          >
            {item === 'ALL' ? '전체' : item === 'GENERAL' ? '일반' : item === 'REVIEW' ? '독서 후기' : item === 'QUESTION' ? '질문' : '추천'}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <aside className="order-first space-y-4 lg:order-last">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <h3 className="text-sm font-black">커뮤니티 요약</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-secondary px-3 py-2">
                <p className="text-xs font-bold text-muted-foreground">총 게시글</p>
                <p className="text-lg font-black text-foreground">{totalElements}</p>
              </div>
              <div className="rounded-xl bg-secondary px-3 py-2">
                <p className="text-xs font-bold text-muted-foreground">오늘 게시글</p>
                <p className="text-lg font-black text-foreground">
                  {posts.filter((post) => new Date(post.createdAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-400" />
              <h3 className="text-sm font-black text-foreground">좋아요 인기글</h3>
            </div>
            {popularLoading ? (
              <div className="mt-3 space-y-2">
                {[0, 1, 2, 3, 4].map((item) => (
                  <div key={`likes-skeleton-${item}`} className="h-5 animate-pulse rounded bg-secondary" />
                ))}
              </div>
            ) : (
              <ul className="mt-3 space-y-1">
                {popularLikes.map((post, index) => (
                  <li key={`popular-likes-${post.id}`}>
                    <Link
                      to={`/community/${post.id}`}
                      className="flex items-start gap-2 rounded-xl p-2 transition hover:bg-secondary"
                    >
                      <span className="mt-0.5 shrink-0 text-xs font-black text-rose-400">
                        {index + 1}
                      </span>
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">
                        {post.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-sky-400" />
              <h3 className="text-sm font-black text-foreground">댓글 인기글</h3>
            </div>
            {popularLoading ? (
              <div className="mt-3 space-y-2">
                {[0, 1, 2, 3, 4].map((item) => (
                  <div key={`comments-skeleton-${item}`} className="h-5 animate-pulse rounded bg-secondary" />
                ))}
              </div>
            ) : (
              <ul className="mt-3 space-y-1">
                {popularComments.map((post, index) => (
                  <li key={`popular-comments-${post.id}`}>
                    <Link
                      to={`/community/${post.id}`}
                      className="flex items-start gap-2 rounded-xl p-2 transition hover:bg-secondary"
                    >
                      <span className="mt-0.5 shrink-0 text-xs font-black text-sky-400">
                        {index + 1}
                      </span>
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">
                        {post.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
        <div className="order-last lg:order-first">
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
                const isLiked = post.isLiked;
                return (
                  <article key={post.id} className="rounded-[1.25rem] border border-border bg-card p-3.5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <Link to={`/community/${post.id}`} className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={post.authorProfileImageUrl || defaultAvatar}
                            alt=""
                            className="h-9 w-9 overflow-hidden rounded-full border border-border object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-foreground">{getAuthorName(post)}</p>
                            <p className="text-xs font-semibold text-muted-foreground">
                              {formatCommunityDate(post.createdAt)} {post.isEdited && !post.isDeleted ? '· 수정됨' : ''}
                            </p>
                          </div>
                        </div>
                        <h2
                          className={cn(
                            'mt-3 line-clamp-2 text-base font-black tracking-tight sm:text-lg',
                            post.isDeleted ? 'text-muted-foreground' : 'text-foreground',
                          )}
                        >
                          {post.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {post.isDeleted ? '삭제된 게시글입니다' : post.content}
                        </p>
                      </Link>
                      <Link
                        to={`/community/${post.id}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                      >
                        <PenLine className="h-4 w-4" />읽기
                      </Link>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-border/70 pt-3">
                      <button
                        type="button"
                        onClick={() => toggleLike(post)}
                        disabled={pendingLikeId === post.id || post.isDeleted}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition',
                          post.isDeleted ? 'cursor-not-allowed bg-secondary text-muted-foreground' : isLiked ? 'bg-rose-100 text-rose-700' : 'bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-700',
                        )}
                      >
                        <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                        {post.likeCount}
                      </button>
                      <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-sm font-bold text-secondary-foreground">
                        <MessageSquareText className="h-4 w-4" />댓글 {commentCounts[post.id] ?? 0}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
          className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          이전
        </button>
        <span className="text-sm font-bold text-muted-foreground">
          {currentPage + 1} / {totalPageCount}
        </span>
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
