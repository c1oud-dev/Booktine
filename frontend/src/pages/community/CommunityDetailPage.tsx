import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit3, Heart, MessageCircleReply, Send, Trash2 } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';
import { createCommunityComment, deleteCommunityComment, deleteCommunityPost, getCommunityComments, getCommunityPost, likeCommunityPost, unlikeCommunityPost, updateCommunityComment, type CommunityComment, type CommunityPost } from '@/api/communityApi';
import { useAuth } from '@/auth/AuthContext';
import { cn } from '@/lib/utils';
import { formatCommunityDate, getLikedPostIds, nestComments, saveLikedPostIds } from './communityUtils';

export default function CommunityDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const numericPostId = Number(postId);
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [replyParentId, setReplyParentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [likedIds, setLikedIds] = useState<Set<number>>(() => getLikedPostIds(user?.id));
  const [pendingLike, setPendingLike] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const likedKey = useMemo(() => [...likedIds].join(','), [likedIds]);
  const commentTree = useMemo(() => nestComments(comments), [comments]);
  const isOwner = Boolean(user && post && user.id === post.userId);
  const isLiked = post ? likedIds.has(post.id) : false;

  useEffect(() => {
    setLikedIds(getLikedPostIds(user?.id));
  }, [user?.id]);

  useEffect(() => {
    saveLikedPostIds(user?.id, likedIds);
  }, [likedKey, user?.id]);

  const load = async () => {
    if (!Number.isFinite(numericPostId)) {
      setError('올바르지 않은 게시글입니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [postResult, commentResult] = await Promise.all([
        getCommunityPost(numericPostId),
        getCommunityComments(numericPostId),
      ]);
      setPost(postResult);
      setComments(commentResult);
    } catch {
      setError('게시글을 불러오지 못했습니다. 삭제되었거나 접근할 수 없는 글일 수 있습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [numericPostId]);

  const toggleLike = async () => {
    if (!post || pendingLike) return;

    const wasLiked = likedIds.has(post.id);
    const previousPost = post;
    const previousLikedIds = new Set(likedIds);
    const nextLikedIds = new Set(likedIds);

    if (wasLiked) {
      nextLikedIds.delete(post.id);
    } else {
      nextLikedIds.add(post.id);
    }

    setPendingLike(true);
    setLikedIds(nextLikedIds);
    setPost({ ...post, likeCount: Math.max(0, post.likeCount + (wasLiked ? -1 : 1)) });

    try {
      const updated = wasLiked ? await unlikeCommunityPost(post.id) : await likeCommunityPost(post.id);
      setPost(updated);
    } catch {
      setLikedIds(previousLikedIds);
      setPost(previousPost);
      alert('좋아요 처리에 실패했습니다. 현재 좋아요 상태를 확인한 뒤 다시 시도해주세요.');
    } finally {
      setPendingLike(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !confirm('게시글을 삭제하시겠습니까? 댓글과 좋아요도 함께 삭제됩니다.')) return;

    await deleteCommunityPost(post.id);
    navigate('/community');
  };

  const submitComment = async (e: FormEvent) => {
    e.preventDefault();
    const content = commentContent.trim();
    if (!post || !content) return;

    const created = await createCommunityComment(post.id, { content, parentId: null });
    setComments((items) => [...items, created]);
    setCommentContent('');
  };

  const submitReply = async (e: FormEvent, parentId: number) => {
    e.preventDefault();
    const content = replyContent.trim();
    if (!post || !content) return;

    const created = await createCommunityComment(post.id, { content, parentId });
    setComments((items) => [...items, created]);
    setReplyContent('');
    setReplyParentId(null);
  };

  const submitCommentEdit = async (e: FormEvent, commentId: number) => {
    e.preventDefault();
    const content = editingCommentContent.trim();
    if (!content) return;

    const updated = await updateCommunityComment(commentId, { content });
    setComments((items) => items.map((item) => (item.id === commentId ? updated : item)));
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까? 대댓글이 있다면 함께 삭제됩니다.')) return;

    await deleteCommunityComment(commentId);
    setComments((items) => items.filter((item) => item.id !== commentId && item.parentId !== commentId));
  };

  const renderComment = (comment: CommunityComment, isReplyComment = false) => {
    const owned = user?.id === comment.userId;
    const isEditing = editingCommentId === comment.id;

    return (
      <div key={comment.id} className={cn('rounded-[1.25rem] border border-border bg-card p-4 shadow-soft', isReplyComment && 'ml-7 border-dashed bg-secondary/40 sm:ml-12')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-foreground">작성자 #{comment.userId}</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">{formatCommunityDate(comment.createdAt)}</p>
          </div>
          {owned ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditingCommentContent(comment.content);
                }}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => handleDeleteComment(comment.id)}
                className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>

        {isEditing ? (
          <form onSubmit={(event) => submitCommentEdit(event, comment.id)} className="mt-4 space-y-3">
            <textarea
              value={editingCommentContent}
              onChange={(event) => setEditingCommentContent(event.target.value)}
              maxLength={5000}
              rows={4}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingCommentId(null)} className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground">취소</button>
              <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">저장</button>
            </div>
          </form>
        ) : (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">{comment.content}</p>
        )}

        {!isReplyComment && !isEditing ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setReplyParentId(replyParentId === comment.id ? null : comment.id);
                setReplyContent('');
              }}
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
            >
              <MessageCircleReply className="h-4 w-4" />답글
            </button>
            {replyParentId === comment.id ? (
              <form onSubmit={(event) => submitReply(event, comment.id)} className="mt-3 space-y-3">
                <textarea
                  value={replyContent}
                  onChange={(event) => setReplyContent(event.target.value)}
                  maxLength={5000}
                  rows={3}
                  placeholder="대댓글을 입력하세요."
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setReplyParentId(null)} className="rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground">취소</button>
                  <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">등록</button>
                </div>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
          <Spinner label="게시글을 불러오는 중..." />
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
        <EmptyState title="게시글을 찾을 수 없어요" description={error || '다시 목록에서 게시글을 선택해주세요.'} actionLabel="목록으로" actionTo="/community" />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <Link to="/community" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />커뮤니티 목록
      </Link>

      <article className="rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">작성자 #{post.userId} · {formatCommunityDate(post.createdAt)}</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">{post.title}</h1>
          </div>
          {isOwner ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link to={`/community/${post.id}/edit`} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary">
                <Edit3 className="h-4 w-4" />수정
              </Link>
              <button type="button" onClick={handleDeletePost} className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground">
                <Trash2 className="h-4 w-4" />삭제
              </button>
            </div>
          ) : null}
        </div>
        <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-foreground">{post.content}</p>
        <div className="mt-8 border-t border-border/70 pt-5">
          <button
            type="button"
            onClick={toggleLike}
            disabled={pendingLike}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition',
              isLiked ? 'bg-rose-100 text-rose-700' : 'bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-700',
            )}
          >
            <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />좋아요 {post.likeCount}
          </button>
        </div>
      </article>

      <section className="space-y-5 rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">댓글 {comments.length}</h2>
          <p className="mt-1 text-sm text-muted-foreground">댓글은 1단계, 대댓글은 2단계까지 작성할 수 있습니다.</p>
        </div>

        <form onSubmit={submitComment} className="space-y-3">
          <textarea
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            maxLength={5000}
            rows={4}
            placeholder="댓글을 입력하세요."
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <div className="flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft">
              <Send className="h-4 w-4" />댓글 등록
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <EmptyState title="아직 댓글이 없어요" description="첫 댓글을 남겨 대화를 시작해보세요." />
          ) : (
            commentTree.map(({ comment, replies }) => (
              <div key={comment.id} className="space-y-3">
                {renderComment(comment)}
                {replies.map((reply) => renderComment(reply, true))}
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
