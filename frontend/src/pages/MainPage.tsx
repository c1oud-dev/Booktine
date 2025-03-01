//메인 페이지 구현

import React from "react";

export default function MainPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{
        // 배경 이미지를 설정 (Main.png는 public/images/ 폴더에 있다고 가정)
        backgroundImage: `url("/images/Main.png")`,
      }}
    >
      {/* 상단 네비게이션 바 */}
      <header className="flex justify-between items-center px-8 py-4">
        {/* 좌측 로고 or 사이트명 */}
        <div className="text-2xl font-bold">Booktine</div>

        {/* 중앙 메뉴 (원하면 숨기거나 링크로 교체 가능) */}
        <nav className="space-x-6 hidden md:block">
          <a href="/" className="hover:text-gray-700">
            Home
          </a>
          <a href="/book-note" className="hover:text-gray-700">
            Book Note
          </a>
          <a href="/progress" className="hover:text-gray-700">
            Progress
          </a>
          <a href="/settings" className="hover:text-gray-700">
            Settings
          </a>
        </nav>

        {/* 우측 버튼들 */}
        <div className="space-x-2">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-100">
            Log In
          </button>
          <button className="border px-4 py-2 rounded-lg bg-black text-white hover:opacity-90">
            Sign Up
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-800">
          안녕하세요 Booktine입니다.
        </h1>
        <p className="text-gray-600 mb-6">
          독서 습관 추적 & 목표 관리 서비스<br />
          랜덤 책 추천 서비스<br />
          독서 노트 & 메모 서비스
        </p>

        {/* 중앙의 Log In 버튼 */}
        <button className="border border-black px-6 py-3 rounded-full text-lg hover:bg-black hover:text-white transition">
          Log In
        </button>
      </main>
    </div>
  );
}
