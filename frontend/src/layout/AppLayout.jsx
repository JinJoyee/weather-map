import React from "react";
import { Outlet } from "react-router-dom";
import useViewport from "../components/common/useViewport";
import SideRail from "../components/common/SideRail";
import BottomTabBar from "../components/common/BottomTabBar";
import { useTheme } from "../context/ThemeContext";
import { IconSun } from "../components/common/icons";

function MoonIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

export default function AppLayout({ loggedIn, onAccount }) {
  const isDesktop = useViewport();
  const { theme, toggleTheme } = useTheme();

  if (isDesktop) {
    return (
      <div className="flex h-screen overflow-hidden bg-bg dark:bg-dark-bg">
        <SideRail loggedIn={loggedIn} onAccount={onAccount} />
        <main className="flex-1 flex min-w-0">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg dark:bg-dark-bg">
      <Outlet />
      {/* 모바일 테마 토글 플로팅 버튼 — BottomTabBar 위 우하단 */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
        className="fixed right-4 bottom-[88px] z-50 w-11 h-11 rounded-full shadow-lg
                   bg-card dark:bg-dark-card border border-line dark:border-dark-line
                   grid place-items-center text-muted dark:text-dark-muted
                   hover:opacity-80 transition-opacity"
      >
        {theme === 'dark' ? <IconSun size={19} /> : <MoonIcon size={19} />}
      </button>
      <BottomTabBar />
    </div>
  );
}