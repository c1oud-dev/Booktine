import { useEffect, useState, type ReactNode } from 'react';
import { ShieldCheck, UsersRound, LibraryBig } from 'lucide-react';
import { getAdminPosts, getAdminUsers } from '@/api/adminApi';
import type { PageResponse } from '@/types/api';
import type { BookNote } from '@/types/bookNote';
import type { UserProfile } from '@/api/userApi';
import { STATUS_LABEL } from '@/constants/readingStatus';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

export default function AdminPage() {
  const [users, setUsers] = useState<PageResponse<UserProfile> | null>(null);
  const [posts, setPosts] = useState<PageResponse<BookNote> | null>(null);
  const [userPage, setUserPage] = useState(0);
  const [postPage, setPostPage] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMessage('');
      try {
        const [userData, postData] = await Promise.all([
          getAdminUsers(userPage),
          getAdminPosts(postPage),
        ]);
        setUsers(userData);
        setPosts(postData);
      } catch {
        setMessage('관리자 데이터를 불러오지 못했습니다. 관리자 권한을 확인해 주세요.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userPage, postPage]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card lg:p-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">Admin console</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground sm:text-5xl">관리자 페이지</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">백엔드 Admin API로 전체 사용자와 독서 노트 목록을 확인합니다.</p>
      </div>

      {message ? <p className="rounded-[1.25rem] border border-border bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p> : null}

      {loading ? (
        <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft"><Spinner label="관리자 데이터를 불러오는 중..." /></div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <AdminUsers users={users} page={userPage} onPageChange={setUserPage} />
          <AdminPosts posts={posts} page={postPage} onPageChange={setPostPage} />
        </div>
      )}
    </section>
  );
}

function AdminUsers({ users, page, onPageChange }: { users: PageResponse<UserProfile> | null; page: number; onPageChange: (page: number) => void }) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
      <SectionHeading icon={<UsersRound className="h-5 w-5" aria-hidden="true" />} title="사용자 목록" description={`${users?.totalElements ?? 0}명`} />
      {!users || users.content.length === 0 ? (
        <div className="mt-8"><EmptyState title="사용자가 없어요" description="조회된 사용자 데이터가 없습니다." /></div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="py-3">ID</th><th>이메일</th><th>닉네임</th><th>권한</th><th>완독</th></tr></thead>
            <tbody className="divide-y divide-border">
              {users.content.map((user) => (
                <tr key={user.id} className="font-semibold text-foreground"><td className="py-3">{user.id}</td><td>{user.email}</td><td>{user.nickname}</td><td>{user.role}</td><td>{user.completedCount}권</td></tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} totalPages={users.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </article>
  );
}

function AdminPosts({ posts, page, onPageChange }: { posts: PageResponse<BookNote> | null; page: number; onPageChange: (page: number) => void }) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
      <SectionHeading icon={<LibraryBig className="h-5 w-5" aria-hidden="true" />} title="게시물 목록" description={`${posts?.totalElements ?? 0}개`} />
      {!posts || posts.content.length === 0 ? (
        <div className="mt-8"><EmptyState title="게시물이 없어요" description="조회된 독서 노트가 없습니다." /></div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="py-3">ID</th><th>제목</th><th>저자</th><th>장르</th><th>상태</th></tr></thead>
            <tbody className="divide-y divide-border">
              {posts.content.map((post) => (
                <tr key={post.id} className="font-semibold text-foreground"><td className="py-3">{post.id}</td><td>{post.title}</td><td>{post.author}</td><td>{post.genre}</td><td>{STATUS_LABEL[post.readingStatus]}</td></tr>
              ))}
            </tbody>
          </table>
          <Pager page={page} totalPages={posts.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </article>
  );
}

function SectionHeading({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="flex items-center gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">{icon}</span><div><h2 className="text-2xl font-black text-foreground">{title}</h2><p className="text-sm font-bold text-muted-foreground">{description}</p></div></div>;
}

function Pager({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  return <div className="mt-5 flex items-center justify-end gap-2"><button type="button" disabled={page <= 0} onClick={() => onPageChange(page - 1)} className="rounded-full border border-border px-4 py-2 text-sm font-bold disabled:opacity-40">이전</button><span className="text-sm font-bold text-muted-foreground">{page + 1} / {Math.max(totalPages, 1)}</span><button type="button" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded-full border border-border px-4 py-2 text-sm font-bold disabled:opacity-40">다음</button></div>;
}
