// common/SideRail.jsx — DESKTOP left navigation rail (replaces BottomTabBar at ≥1024px).
// Mirrors the mobile tabs as a vertical icon rail with the brand mark on top and
// the account button at the bottom. Uses react-router NavLink so active state follows the route.
import React from "react";
import { NavLink } from "react-router-dom";
import { IconMap, IconRoute, IconPen, IconBookmark, IconUser, IconSun } from "./icons";

const ITEMS = [
  { to: "/map", label: "지도", Icon: IconMap },
  { to: "/routes", label: "경로", Icon: IconRoute },
  { to: "/draw", label: "그리기", Icon: IconPen },
  { to: "/custom", label: "내 경로", Icon: IconBookmark },
];

export default function SideRail({ loggedIn, onAccount }) {
  return (
    <div className="w-[84px] shrink-0 bg-card border-r border-line flex flex-col items-center py-[18px] gap-1.5 z-30">
      {/* brand */}
      <div className="relative w-11 h-11 rounded-[14px] bg-primary grid place-items-center mb-3.5 shadow-md">
        <IconRoute size={24} className="text-white" />
        <span className="absolute -right-1 -top-1 w-5 h-5 rounded-full bg-weather grid place-items-center border-[2.5px] border-card">
          <IconSun size={11} className="text-white" />
        </span>
      </div>

      {ITEMS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} title={label}
          className={({ isActive }) =>
            `w-16 py-2.5 rounded-[14px] flex flex-col items-center gap-1.5 transition-colors
             ${isActive ? "bg-primary/10 text-primary" : "text-faint hover:bg-chip"}`}>
          {({ isActive }) => (
            <>
              <Icon size={24} strokeWidth={isActive ? 2.3 : 1.9} />
              <span className={`text-[11px] whitespace-nowrap ${isActive ? "font-bold" : "font-medium"}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}

      <div className="flex-1" />

      <button onClick={onAccount} title={loggedIn ? "내 계정" : "로그인"}
        className={`w-[46px] h-[46px] rounded-full grid place-items-center
          ${loggedIn ? "bg-primary text-white" : "border border-line2 bg-card text-muted"}`}>
        <IconUser size={21} />
      </button>
    </div>
  );
}
