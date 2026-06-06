// common/BottomTabBar.jsx — thumb-reachable bottom navigation (replaces the top NavBar).
// Uses react-router NavLink so active state follows the route.
import React from "react";
import { NavLink } from "react-router-dom";
import { IconMap, IconRoute, IconPen, IconBookmark } from "./icons";

const TABS = [
  { to: "/map", label: "지도", Icon: IconMap },
  { to: "/routes", label: "경로", Icon: IconRoute },
  { to: "/draw", label: "그리기", Icon: IconPen },
  { to: "/custom", label: "내 경로", Icon: IconBookmark },
];

export default function BottomTabBar() {
  return (
    <nav className="fixed left-0 right-0 bottom-0 z-40 grid grid-cols-4 pt-2 pb-[26px]
                    bg-card border-t border-line">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 ${isActive ? "text-primary" : "text-faint"}`}>
          {({ isActive }) => (
            <>
              <Icon size={23} strokeWidth={isActive ? 2.3 : 1.9} />
              <span className={`text-[11px] whitespace-nowrap ${isActive ? "font-bold" : "font-medium"}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
