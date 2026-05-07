import type { CommunityComment } from '@/api/communityApi';

export const formatCommunityDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

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
