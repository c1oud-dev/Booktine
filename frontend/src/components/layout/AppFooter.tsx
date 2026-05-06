import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export default function AppFooter() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-border/80 bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link to="/" className="text-lg font-black tracking-tight text-foreground">
              Booktine
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              더 선명한 독서 습관을 위한 기록 공간
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="hover:text-foreground"
            >
              서비스 소개
            </button>
            <Link to="/books" className="hover:text-foreground">
              독서노트
            </Link>
            <Link to="/progress" className="hover:text-foreground">
              진도 관리
            </Link>
            <Link to="/mypage" className="hover:text-foreground">
              마이페이지
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Booktine</p>
        </div>
      </footer>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative mx-4 w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Booktine 소개
            </h2>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              더 선명한 독서 습관을 위한 기록 공간
            </p>

            <ul className="mt-6 space-y-4">
              <li className="rounded-2xl border border-border bg-background p-4">
                <p className="font-black text-foreground">📚 독서 노트 & 메모</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  읽은 책마다 감상과 메모를 기록하고 언제든 꺼내볼 수 있어요.
                </p>
              </li>
              <li className="rounded-2xl border border-border bg-background p-4">
                <p className="font-black text-foreground">🎯 목표 설정 & 진도 관리</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  월간·연간 독서 목표를 세우고 달성 현황을 한눈에 확인하세요.
                </p>
              </li>
              <li className="rounded-2xl border border-border bg-background p-4">
                <p className="font-black text-foreground">✨ 도서 추천</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Aladin API 기반으로 장르별 베스트셀러와 맞춤 도서를 추천해드려요.
                </p>
              </li>
            </ul>

            <Link
              to="/signup"
              onClick={() => setIsModalOpen(false)}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft hover:shadow-float"
            >
              지금 시작하기
            </Link>
          </div>
        </div>
      )}
    </>
  );
}