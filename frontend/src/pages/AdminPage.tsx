import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { LibraryBig, MessageSquareText, Plus, ShieldCheck, Tags, Trash2, UsersRound } from 'lucide-react';
import { createAdminGenre, deleteAdminGenre, getAdminGenres, getAdminInquiries, getAdminPosts, getAdminUsers } from '@/api/adminApi';
import type { Genre } from '@/api/genreApi';
import type { Inquiry } from '@/api/inquiryApi';
import type { PageResponse } from '@/types/api';
import type { BookNote } from '@/types/bookNote';
import type { UserProfile } from '@/api/userApi';
import { STATUS_LABEL } from '@/constants/readingStatus';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/common/EmptyState';

export default function AdminPage() {
  const [users, setUsers] = useState<PageResponse<UserProfile> | null>(null);
  const [posts, setPosts] = useState<PageResponse<BookNote> | null>(null);
  const [inquiries, setInquiries] = useState<PageResponse<Inquiry> | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [userPage, setUserPage] = useState(0);
  const [postPage, setPostPage] = useState(0);
  const [inquiryPage, setInquiryPage] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadGenres = async () => {
    const genreData = await getAdminGenres();
    setGenres(genreData);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMessage('');
      try {
        const [userData, postData, inquiryData, genreData] = await Promise.all([
          getAdminUsers(userPage),
          getAdminPosts(postPage),
          getAdminInquiries(inquiryPage),
          getAdminGenres(),
        ]);
        setUsers(userData);
        setPosts(postData);
        setInquiries(inquiryData);
        setGenres(genreData);
      } catch {
        setMessage('관리자 데이터를 불러오지 못했습니다. 관리자 권한을 확인해 주세요.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userPage, postPage, inquiryPage]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="rounded-[2rem] border border-border bg-card p-4 shadow-card sm:p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">Admin console</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              관리자 페이지
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          사용자/게시물 목록과 장르, 문의/제안을 관리합니다.
        </p>
      </div>

      {message ? <p className="rounded-[1.25rem] border border-border bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p> : null}

      {loading ? (
        <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft"><Spinner label="관리자 데이터를 불러오는 중..." /></div>
      ) : (
        <div className="grid auto-rows-fr gap-6 xl:grid-cols-2">
          <AdminGenres genres={genres} onReload={loadGenres} />
          <AdminInquiries inquiries={inquiries} page={inquiryPage} onPageChange={setInquiryPage} />
          <AdminUsers users={users} page={userPage} onPageChange={setUserPage} />
          <AdminPosts posts={posts} page={postPage} onPageChange={setPostPage} />
        </div>
      )}
    </section>
  );
}

function AdminGenres({ genres, onReload }: { genres: Genre[]; onReload: () => Promise<void> }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await createAdminGenre(name);
      setName('');
      await onReload();
    } catch {
      setMessage('장르를 추가하지 못했습니다. 중복 여부를 확인해 주세요.');
    }
  };

  const onDelete = async (id: number) => {
    setMessage('');
    try {
      await deleteAdminGenre(id);
      await onReload();
    } catch {
      setMessage('장르를 삭제하지 못했습니다.');
    }
  };

  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
      <SectionHeading icon={<Tags className="h-5 w-5" aria-hidden="true" />} title="장르 관리" description={`${genres.length}개`} />
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="추가할 장르명" required />
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft">
          <Plus className="h-4 w-4" aria-hidden="true" /> 추가
        </button>
      </form>
      {message ? <p className="mt-3 text-sm font-bold text-red-700">{message}</p> : null}
      {genres.length === 0 ? (
        <div className="mt-8"><EmptyState title="추가 장르가 없어요" description="기본 장르 외에 필요한 장르를 추가해 주세요." /></div>
      ) : (
        <ul className="mt-6 flex flex-wrap gap-2">
          {genres.map((genre) => (
            <li key={genre.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">
              {genre.name}
              <button type="button" onClick={() => onDelete(genre.id)} className="text-muted-foreground hover:text-red-600" aria-label={`${genre.name} 삭제`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function AdminInquiries({ inquiries, page, onPageChange }: { inquiries: PageResponse<Inquiry> | null; page: number; onPageChange: (page: number) => void }) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
      <SectionHeading icon={<MessageSquareText className="h-5 w-5" aria-hidden="true" />} title="문의/제안 목록" description={`${inquiries?.totalElements ?? 0}개`} />
      {!inquiries || inquiries.content.length === 0 ? (
        <div className="mt-8"><EmptyState title="문의가 없어요" description="사용자 문의/제안이 아직 없습니다." /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {inquiries.content.map((inquiry) => (
            <div key={inquiry.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-black text-foreground">{inquiry.subject}</p>
                <p className="text-xs font-bold text-muted-foreground">{new Date(inquiry.createdAt).toLocaleString()}</p>
              </div>
              <p className="mt-1 text-xs font-bold text-muted-foreground">{inquiry.userNickname} · {inquiry.userEmail}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{inquiry.message}</p>
            </div>
          ))}
          <Pager page={page} totalPages={inquiries.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </article>
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
          <table className="min-w-[42rem] w-full table-fixed text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-3">ID</th>
                <th className="w-[34%] px-2">이메일</th>
                <th className="w-[18%] px-2">닉네임</th>
                <th className="w-[18%] px-2">권한</th>
                <th className="w-[12%] px-2">완독</th>
              </tr></thead>
            <tbody className="divide-y divide-border">
              {users.content.map((user) => (
                <tr key={user.id} className="font-semibold text-foreground">
                  <td className="px-2 py-3">{user.id}</td>
                  <td className="px-2">{user.email}</td>
                  <td className="px-2">{user.nickname}</td>
                  <td className="px-2">
                    <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">
                      {user.role === 'ROLE_ADMIN' ? '관리자' : '일반 사용자'}
                    </span>
                  </td>
                  <td className="px-2">{user.completedCount}권</td>
                </tr>
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
          <table className="min-w-[42rem] w-full table-fixed text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-3">ID</th>
                <th className="px-2">제목</th>
                <th className="px-2">저자</th>
                <th className="px-2">장르</th>
                <th className="px-2">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.content.map((post) => (
                <tr key={post.id} className="font-semibold text-foreground">
                  <td className="px-2 py-3">{post.id}</td>
                  <td className="px-2">{post.title}</td>
                  <td className="px-2">{post.author}</td>
                  <td className="px-2">{post.genre}</td>
                  <td className="px-2">
                    <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-black text-foreground">
                      {STATUS_LABEL[post.readingStatus]}
                    </span>
                  </td>
                </tr>
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
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        {icon}
      </span>
      <div>
        <h2 className="text-xl font-black text-foreground sm:text-2xl">{title}</h2>
        <p className="text-sm font-bold text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Pager({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
        className="rounded-full border border-border px-4 py-2 text-sm font-bold disabled:opacity-40"
      >
        이전
      </button>
      <span className="text-sm font-bold text-muted-foreground">
        {page + 1} / {Math.max(totalPages, 1)}
      </span>
      <button
        type="button"
        disabled={page + 1 >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-full border border-border px-4 py-2 text-sm font-bold disabled:opacity-40"
      >
        다음
      </button>
    </div>
  );
}
