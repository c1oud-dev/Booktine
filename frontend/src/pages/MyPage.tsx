import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { BookOpen, Camera, KeyRound, Sparkles, Trash2, UserRound } from 'lucide-react';
import {
  changePassword,
  deleteMyAccount,
  deleteMyProfileImage,
  getMyProfile,
  updateMyProfile,
  uploadMyProfileImage,
  type UserProfile,
} from '@/api/userApi';
import { setAccessToken } from '@/api/http';
import Spinner from '@/components/common/Spinner';

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [intro, setIntro] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [imagePreview, setImagePreview] = useState('/default_avatar.png');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getMyProfile();
      setProfile(data);
      setNickname(data.nickname);
      setIntro(data.aboutMe ?? '');
      setImagePreview(data.profileImageUrl ?? '/default_avatar.png');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const data = await updateMyProfile({ nickname, aboutMe: intro, password: profilePassword });
      setProfile(data);
      setProfilePassword('');
      setMessage('프로필이 저장되었습니다.');
      window.dispatchEvent(new Event('auth-change'));
    } catch {
      setMessage('프로필 저장에 실패했습니다. 현재 비밀번호를 확인해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setMessage('');

    try {
      const data = await uploadMyProfileImage(file);
      setProfile(data);
      setImagePreview(data.profileImageUrl ?? localPreview);
      setMessage('프로필 이미지가 변경되었습니다.');
      window.dispatchEvent(new Event('auth-change'));
    } catch {
      setImagePreview(profile?.profileImageUrl ?? '/default_avatar.png');
      setMessage('프로필 이미지 업로드에 실패했습니다.');
    }
  };

  const handleDeleteProfileImage = async () => {
    setSaving(true);
    setMessage('');

    try {
      const data = await deleteMyProfileImage();
      setProfile(data);
      setImagePreview(data.profileImageUrl ?? '/default_avatar.png');
      setMessage('프로필 이미지가 삭제되었습니다.');
      window.dispatchEvent(new Event('auth-change'));
    } catch {
      setMessage('프로필 이미지 삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setMessage('비밀번호가 변경되었습니다.');
    } catch {
      setMessage('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSaving(true);
    setMessage('');

    try {
      await deleteMyAccount();
      setAccessToken(null);
      window.dispatchEvent(new Event('auth-change'));
      window.location.replace('/signup');
    } catch {
      setMessage('회원탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-[1.5rem] border border-border bg-card p-8 shadow-soft">
          <Spinner label="프로필을 불러오는 중..." />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card lg:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">Reader profile</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-4xl">마이 페이지</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          독서 프로필을 정리하고, 나만의 소개 문구로 오늘의 읽기 분위기를 기록하세요.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <aside className="rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-soft lg:p-8">
          <label className="group relative mx-auto flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border border-border bg-secondary p-2 shadow-soft">
            <img src={imagePreview} alt="프로필" className="h-full w-full rounded-full object-cover" />
            <span className="absolute inset-2 hidden items-center justify-center rounded-full bg-black/45 text-white group-hover:flex">
              <Camera className="h-6 w-6" aria-hidden="true" />
            </span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
          </label>
          <button
            type="button"
            onClick={handleDeleteProfileImage}
            disabled={saving || !profile?.profileImageUrl}
            className="mt-3 rounded-full border border-border bg-card px-4 py-2 text-xs font-black text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            기본 이미지로 변경
          </button>
          <p className="mt-5 text-2xl font-black tracking-tight text-foreground">{profile?.nickname ?? nickname}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{profile?.aboutMe || '소개를 작성해 주세요.'}</p>

          <div className="mt-6 grid gap-3 text-left">
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <BookOpen className="h-4 w-4" aria-hidden="true" />읽는 중
              </span>
              <span className="text-lg font-black text-foreground">{profile?.readingCount ?? 0}권</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Sparkles className="h-4 w-4" aria-hidden="true" />완독
              </span>
              <span className="text-lg font-black text-foreground">{profile?.completedCount ?? 0}권</span>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-muted-foreground">Profile settings</p>
                <h2 className="text-2xl font-black text-foreground">프로필 수정</h2>
              </div>
            </div>

          <form className="mt-7 space-y-5" onSubmit={handleProfileSubmit}>
              <label className="block text-sm font-bold text-foreground">
                닉네임
                <input className="mt-2" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
              </label>
              <label className="block text-sm font-bold text-foreground">
                소개
                <textarea className="mt-2 min-h-32 resize-y" rows={4} value={intro} onChange={(e) => setIntro(e.target.value)} />
              </label>
              <label className="block text-sm font-bold text-foreground">
                현재 비밀번호
                <input className="mt-2" type="password" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} required />
              </label>
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float disabled:opacity-60">
                변경사항 저장
              </button>
            </form>
          </article>

          <article className="rounded-[1.5rem] border border-border bg-card p-6 shadow-soft lg:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-muted-foreground">Security</p>
                <h2 className="text-2xl font-black text-foreground">비밀번호 변경</h2>
              </div>
            </div>
            <form className="mt-7 grid gap-5 md:grid-cols-2" onSubmit={handlePasswordSubmit}>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="현재 비밀번호" required />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="새 비밀번호" required />
              <button type="submit" disabled={saving} className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float disabled:opacity-60 md:col-span-2">
                비밀번호 변경
              </button>
            </form>
          </article>

          <article className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 shadow-soft lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-red-700">Danger zone</p>
                <h2 className="mt-1 text-2xl font-black text-red-950">회원탈퇴</h2>
                <p className="mt-2 text-sm font-semibold text-red-700">계정과 독서 기록이 삭제됩니다.</p>
              </div>
              <button type="button" onClick={() => setShowDeleteConfirm(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-soft hover:bg-red-700">
                <Trash2 className="h-4 w-4" aria-hidden="true" />회원탈퇴
              </button>
            </div>
          </article>
        </div>
      </div>

      {message ? <p className="rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-foreground">{message}</p> : null}

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5">
          <div className="w-full max-w-md rounded-[1.5rem] border border-border bg-card p-6 shadow-card">
            <h2 className="text-2xl font-black text-foreground">정말 탈퇴하시겠어요?</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">삭제된 계정과 독서 기록은 복구할 수 없습니다.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="rounded-full border border-border bg-card px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary">취소</button>
              <button type="button" onClick={handleDeleteAccount} disabled={saving} className="rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">탈퇴하기</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
