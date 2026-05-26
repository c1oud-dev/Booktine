import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit3, Heart, MessageCircleReply, Send, Trash2 } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';
import { createCommunityComment, deleteCommunityComment, deleteCommunityPost, getCommunityComments, getCommunityPost, likeCommunityPost, unlikeCommunityPost, updateCommunityComment, type CommunityComment, type CommunityPost } from '@/api/communityApi';
import { useAuth } from '@/auth/AuthContext';
import { cn } from '@/lib/utils';
import AuthorProfileModal from '@/components/community/AuthorProfileModal';
import { formatCommunityDate, nestComments } from './communityUtils';
import { panelSpring } from '@/lib/motion';

const defaultAvatar = '/default_avatar.png';

type DeleteTarget =
  | { type: 'post'; id: number }
  | { type: 'comment'; id: number };
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
  const [pendingLike, setPendingLike] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);

  const commentTree = useMemo(() => nestComments(comments), [comments]);
  const isOwner = Boolean(user && post && user.id === post.userId);
  const isLiked = post?.isLiked ?? false;
  const authorName = (() => {
    if (!post) {
      return '작성자';
    }
    const nickname = post.authorNickname?.trim();
    if (!nickname || nickname.includes('@')) {
      return `작성자 #${post.userId}`;
    }
    return nickname;
  })();

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

    const wasLiked = post.isLiked;
    const previousPost = post;

    setPendingLike(true);
    setPost({ ...post, isLiked: !wasLiked, likeCount: Math.max(0, post.likeCount + (wasLiked ? -1 : 1)) });

    try {
      const updated = wasLiked ? await unlikeCommunityPost(post.id) : await likeCommunityPost(post.id);
      setPost(updated);
    } catch {
      setPost(previousPost);
      alert('좋아요 처리에 실패했습니다. 현재 좋아요 상태를 확인한 뒤 다시 시도해주세요.');
    } finally {
      setPendingLike(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;

    await deleteCommunityPost(post.id);
    setDeleteTarget(null);
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
    setComments((items) => items.map((item) => (item.id === commentId ? { ...updated, isEdited: true } : item)));
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleDeleteComment = async (commentId: number) => {
    await deleteCommunityComment(commentId);
    setDeleteTarget(null);
    await load();
  };

  const renderComment = (comment: CommunityComment, isReplyComment = false) => {
    const owned = user?.id === comment.userId;
    const isEditing = editingCommentId === comment.id;
    const nickname = comment.authorNickname?.trim();
    const commentAuthorName = !nickname || nickname.includes('@')
      ? `작성자 #${comment.userId}`
      : nickname;

    return (
      <div key={comment.id} className={cn('rounded-[1.1rem] border border-border bg-card p-3.5 shadow-soft sm:p-4', isReplyComment && 'ml-7 border-dashed bg-secondary/40 sm:ml-12')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedAuthorId(comment.userId)}
            className="flex min-w-0 items-center gap-2.5 text-left"
          >
            <img
              src={comment.authorProfileImageUrl || defaultAvatar}
              alt=""
              className="h-8 w-8 overflow-hidden rounded-full border border-border object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground">{commentAuthorName}</p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                {formatCommunityDate(comment.createdAt)} {comment.isEdited && !comment.isDeleted ? '· 수정됨' : ''}
              </p>
            </div>
          </button>
          {owned && !comment.isDeleted ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditingCommentContent(comment.isDeleted ? '' : comment.content);
                }}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-secondary"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget({ type: 'comment', id: comment.id })}
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
          <p className={cn('mt-3 whitespace-pre-wrap text-sm leading-7', comment.isDeleted ? 'font-bold text-muted-foreground' : 'text-foreground')}>{comment.isDeleted ? '삭제된 댓글입니다' : comment.content}</p>
        )}

        {!isReplyComment && !isEditing && !comment.isDeleted ? (
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

      <article className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setSelectedAuthorId(post.userId)}
              className="flex items-center gap-3 text-left"
            >
              <img
                src={post.authorProfileImageUrl || defaultAvatar}
                alt=""
                className="h-10 w-10 overflow-hidden rounded-full border border-border object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-foreground">{authorName}</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {formatCommunityDate(post.createdAt)} {post.isEdited && !post.isDeleted ? '· 수정됨' : ''}
                </p>
              </div>
            </button>
            <h1 className={cn("mt-4 text-2xl font-black tracking-tight sm:text-3xl", post.isDeleted ? "text-muted-foreground" : "text-foreground")}>{post.title}</h1>
          </div>
          {isOwner && !post.isDeleted ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link to={`/community/${post.id}/edit`} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary">
                <Edit3 className="h-4 w-4" />수정
              </Link>
              <button type="button" onClick={() => setDeleteTarget({ type: 'post', id: post.id })} className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground">
                <Trash2 className="h-4 w-4" />삭제
              </button>
            </div>
          ) : null}
        </div>
        <p className={cn("mt-6 whitespace-pre-wrap text-base leading-8", post.isDeleted ? "font-bold text-muted-foreground" : "text-foreground")}>{post.isDeleted ? "삭제된 게시글입니다" : post.content}</p>
        <div className="mt-8 border-t border-border/70 pt-5">
          <button
            type="button"
            onClick={toggleLike}
            disabled={pendingLike || post.isDeleted}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition',
              post.isDeleted ? 'cursor-not-allowed bg-secondary text-muted-foreground' : isLiked ? 'bg-rose-100 text-rose-700' : 'bg-secondary text-secondary-foreground hover:bg-rose-50 hover:text-rose-700',
            )}
          >
            <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />좋아요 {post.likeCount}
          </button>
        </div>
      </article>

      <section className="space-y-5 rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-6">
        <div>
          <h2 className="text-lg font-black tracking-tight text-foreground">댓글 {comments.length}개</h2>
          <p className="mt-1 text-sm text-muted-foreground">자유롭게 의견을 나눠보세요.</p>
        </div>
          
        {!post.isDeleted ? (
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
        ) : null}

        <div className="space-y-3">
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

      <AnimatePresence>
        {deleteTarget ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={panelSpring}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-card"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-2xl font-black text-foreground">정말 삭제하시겠습니까?</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {deleteTarget.type === 'post'
                  ? '댓글이 없으면 게시글이 완전히 삭제되고, 댓글이 있으면 내용만 삭제된 게시글로 표시됩니다.'
                  : '대댓글이 없으면 댓글이 완전히 삭제되고, 대댓글이 있으면 내용만 삭제된 댓글로 표시됩니다.'}
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => (deleteTarget.type === 'post' ? handleDeletePost() : handleDeleteComment(deleteTarget.id))}
                  className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:shadow-soft"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AuthorProfileModal
        userId={selectedAuthorId}
        isOpen={selectedAuthorId !== null}
        onClose={() => setSelectedAuthorId(null)}
      />
    </section>
  );
}
