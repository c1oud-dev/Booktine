import type { CommunityComment } from '@/api/communityApi';

export const formatCommunityDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const getLikedPostIds = (userId?: number) => {
  if (!userId) return new Set<number>();

  const raw = window.localStorage.getItem(`booktine:community:liked:${userId}`);
  if (!raw) return new Set<number>();

  try {
    const ids = JSON.parse(raw) as number[];
    return new Set(ids.filter((id) => Number.isFinite(id)));
  } catch {
    return new Set<number>();
  }
};

export const saveLikedPostIds = (userId: number | undefined, ids: Set<number>) => {
  if (!userId) return;
  window.localStorage.setItem(`booktine:community:liked:${userId}`, JSON.stringify([...ids]));
};

export const nestComments = (comments: CommunityComment[]) => {
  const parents = comments.filter((comment) => comment.depth === 1 || comment.parentId === null);
  const repliesByParentId = comments.reduce<Record<number, CommunityComment[]>>((acc, comment) => {
    if (comment.parentId !== null) {
      acc[comment.parentId] = [...(acc[comment.parentId] ?? []), comment];
    }
    return acc;
  }, {});

  return parents.map((comment) => ({
    comment,
    replies: repliesByParentId[comment.id] ?? [],
  }));
};
