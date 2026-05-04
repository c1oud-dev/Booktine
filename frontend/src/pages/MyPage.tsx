import { useState } from 'react';

export default function MyPage() {
  const [nickname, setNickname] = useState('Booktine Reader');
  const [intro, setIntro] = useState('오늘도 한 장씩, 꾸준히 읽는 중입니다.');

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-semibold">마이 페이지</h2>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border bg-card p-6 shadow-soft text-center shadow-soft">
          <img src="/default_avatar.png" alt="프로필" className="mx-auto h-24 w-24 rounded-full border object-cover" />
          <p className="mt-4 text-xl font-semibold">{nickname}</p>
          <p className="mt-2 text-sm text-muted-foreground">{intro}</p>
          <div className="mt-4 grid gap-2 text-sm">
            <p className="rounded-lg bg-background/70 px-3 py-2">읽는 중: 4권</p>
            <p className="rounded-lg bg-background/70 px-3 py-2">완독: 28권</p>
          </div>
        </aside>

        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <h3 className="text-2xl font-semibold">프로필 수정</h3>
          <form className="mt-4 space-y-4">
            <label className="block text-sm">닉네임
              <input className="mt-2 w-full rounded-lg border bg-background px-3 py-2" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </label>
            <label className="block text-sm">소개
              <textarea className="mt-2 w-full rounded-lg border bg-background px-3 py-2" rows={4} value={intro} onChange={(e) => setIntro(e.target.value)} />
            </label>
            <button type="button">변경사항 저장</button>
          </form>
        </div>
      </div>
    </section>
  );
}
