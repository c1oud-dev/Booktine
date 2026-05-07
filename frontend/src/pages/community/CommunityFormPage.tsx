import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Spinner from '@/components/common/Spinner';
import { createCommunityPost, getCommunityPost, updateCommunityPost } from '@/api/communityApi';
import { useAuth } from '@/auth/AuthContext';

export default function CommunityFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const numericPostId = Number(postId);
  const isEditMode = mode === 'edit';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditMode) return;

    const loadPost = async () => {
      if (!Number.isFinite(numericPostId)) {
        setError('올바르지 않은 게시글입니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const post = await getCommunityPost(numericPostId);
        if (user?.id !== post.userId) {
          setError('본인이 작성한 게시글만 수정할 수 있습니다.');
          return;
        }
        setTitle(post.title);
        setContent(post.content);
      } catch {
        setError('수정할 게시글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [isEditMode, numericPostId, user?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextTitle = title.trim();
    const nextContent = content.trim();

    if (!nextTitle || !nextContent) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (isEditMode) {
        const updated = await updateCommunityPost(numericPostId, { title: nextTitle, content: nextContent });
        navigate(`/community/${updated.id}`);
        return;
      }

      const created = await createCommunityPost({ title: nextTitle, content: nextContent });
      navigate(`/community/${created.id}`);
    } catch {
      setError(isEditMode ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
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

  if (isEditMode && error && !title && !content) {
    return (
      <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
        <EmptyState title="수정할 수 없어요" description={error} actionLabel="목록으로" actionTo="/community" />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <Link to={isEditMode ? `/community/${numericPostId}` : '/community'} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />{isEditMode ? '게시글 상세' : '커뮤니티 목록'}
      </Link>

      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">Community editor</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">{isEditMode ? '게시글 수정' : '새 게시글 작성'}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">제목은 200자, 내용은 10,000자까지 입력할 수 있습니다.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-foreground">제목</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              placeholder="어떤 이야기를 나눌까요?"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-base font-semibold outline-none focus:border-primary"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-foreground">내용</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={10000}
              rows={14}
              placeholder="책과 독서에 대한 생각을 자유롭게 작성해주세요."
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-7 outline-none focus:border-primary"
            />
          </label>

          {error ? <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-3">
            <Link to={isEditMode ? `/community/${numericPostId}` : '/community'} className="rounded-full border border-border px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary">
              취소
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />{submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
