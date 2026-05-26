import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getCommunityPostsByUser, getCommunityUserProfile, type CommunityPost, type CommunityUserProfile } from '@/api/communityApi';
import { panelSpring } from '@/lib/motion';
import { formatCommunityDate } from '@/pages/community/communityUtils';
import { useEffect, useState } from 'react';

const defaultAvatar = '/default_avatar.png';

interface AuthorProfileModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthorProfileModal({ userId, isOpen, onClose }: AuthorProfileModalProps) {
  const [profile, setProfile] = useState<CommunityUserProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) {
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [profileResult, postsResult] = await Promise.all([
          getCommunityUserProfile(userId),
          getCommunityPostsByUser(userId, 5),
        ]);
        setProfile(profileResult);
        setPosts(postsResult.content);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, userId]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5"
          onClick={onClose}
        >
          <motion.article
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={panelSpring}
            className="w-full max-w-lg rounded-[1.75rem] border border-border bg-card p-6 shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 animate-pulse rounded bg-secondary" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                  </div>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <div key={`skeleton-post-${item}`} className="h-14 animate-pulse rounded-2xl bg-secondary" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={profile?.profileImageUrl || defaultAvatar}
                    alt=""
                    className="h-14 w-14 rounded-full border border-border object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-black text-foreground">{profile?.nickname || '작성자'}</h2>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">
                      {profile?.aboutMe || '작성된 자기소개가 없습니다.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-black text-foreground">최근 작성 글</h3>
                  <ul className="mt-3 space-y-2">
                    {posts.length === 0 ? (
                      <li className="rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-muted-foreground">
                        최근 작성한 게시글이 없습니다.
                      </li>
                    ) : (
                      posts.map((post) => (
                        <li key={`author-post-${post.id}`}>
                          <Link
                            to={`/community/${post.id}`}
                            onClick={onClose}
                            className="block rounded-2xl border border-border px-4 py-3 hover:bg-secondary"
                          >
                            <p className="line-clamp-1 text-sm font-bold text-foreground">{post.title}</p>
                            <p className="mt-1 text-xs font-semibold text-muted-foreground">{formatCommunityDate(post.createdAt)}</p>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground hover:bg-secondary"
                  >
                    닫기
                  </button>
                </div>
              </>
            )}
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
