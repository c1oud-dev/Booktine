import { useState } from 'react';
import { BookOpen, Sparkles, UserRound } from 'lucide-react';

export default function MyPage() {
  const [nickname, setNickname] = useState('Booktine Reader');
  const [intro, setIntro] = useState('오늘도 한 장씩, 꾸준히 읽는 중입니다.');

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-card lg:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Reader profile
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          마이 페이지
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          독서 프로필을 정리하고, 나만의 소개 문구로 오늘의 읽기 분위기를 기록하세요.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <aside className="rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-soft lg:p-8">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-border bg-secondary p-2 shadow-soft">
            <img
              src="/default_avatar.png"
              alt="프로필"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <p className="mt-5 text-2xl font-black tracking-tight text-foreground">
            {nickname}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {intro}
          </p>

          <div className="mt-6 grid gap-3 text-left">
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                읽는 중
              </span>
              <span className="text-lg font-black text-foreground">4권</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                완독
              </span>
              <span className="text-lg font-black text-foreground">28권</span>
            </div>
          </div>
        </aside>

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

          <form className="mt-7 space-y-5">
            <label className="block text-sm font-bold text-foreground">
              닉네임
              <input
                className="mt-2"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </label>

            <label className="block text-sm font-bold text-foreground">
              소개
              <textarea
                className="mt-2 min-h-32 resize-y"
                rows={4}
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
              />
            </label>
            
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
            >
              변경사항 저장
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
