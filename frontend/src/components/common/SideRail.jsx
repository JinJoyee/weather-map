import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { IconMap, IconRoute, IconPen, IconBookmark, IconUser, IconSun } from "./icons";

const ITEMS = [
  { to: "/map",    label: "지도",   Icon: IconMap      },
  { to: "/routes", label: "경로",   Icon: IconRoute    },
  { to: "/draw",   label: "그리기", Icon: IconPen      },
  { to: "/custom", label: "내 경로",Icon: IconBookmark },
];

function MoonIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

export default function SideRail({ loggedIn, onAccount }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-[84px] shrink-0 bg-card dark:bg-dark-card border-r border-line dark:border-dark-line
                    flex flex-col items-center py-[18px] gap-1.5 z-30">
      {/* brand */}
      <div className="relative w-11 h-11 rounded-[14px] bg-primary grid place-items-center mb-3.5 shadow-md">
        <IconRoute size={24} className="text-white" />
        <span className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-weather grid place-items-center
                         border-[2.5px] border-card dark:border-dark-card">
          <IconSun size={11} className="text-white" />
        </span>
      </div>

      {ITEMS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} title={label}
          className={({ isActive }) =>
            `w-16 py-2.5 rounded-[14px] flex flex-col items-center gap-1.5 transition-colors
             ${isActive
               ? "bg-primary/10 text-primary"
               : "text-faint dark:text-dark-faint hover:bg-chip dark:hover:bg-dark-chip"}`}>
          {({ isActive }) => (
            <>
              <Icon size={24} strokeWidth={isActive ? 2.3 : 1.9} />
              <span className={`text-[11px] whitespace-nowrap ${isActive ? "font-bold" : "font-medium"}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      <div className="flex-1" />

      {/* 테마 토글 버튼 */}
      <button onClick={toggleTheme} title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
        className="w-[46px] h-[46px] rounded-full grid place-items-center mb-1
                   border border-line dark:border-dark-line bg-chip dark:bg-dark-chip
                   text-muted dark:text-dark-muted hover:opacity-70 transition-opacity">
        {theme === 'dark' ? <IconSun size={19} /> : <MoonIcon size={19} />}
      </button>

      {/* 계정 버튼 */}
      <button onClick={onAccount} title={loggedIn ? "내 계정" : "로그인"}
        className={`w-[46px] h-[46px] rounded-full grid place-items-center
          ${loggedIn
            ? "bg-primary text-white"
            : "border border-line2 dark:border-dark-line2 bg-card dark:bg-dark-card text-muted dark:text-dark-muted"}`}>
        <IconUser size={21} />
      </button>
    </div>
  );
}