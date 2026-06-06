// common/icons.jsx — inline SVG icon set (no dependency). Color via `text-*`; size via prop.
import React from "react";

const S = ({ d, children, size = 22, className = "", fill = false, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}
    fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children || (d && <path d={d} />)}
  </svg>
);

export const IconMap = (p) => <S {...p}><polygon points="9 4 3 6 3 20 9 18 15 20 21 18 21 4 15 6 9 4" /><line x1="9" y1="4" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="20" /></S>;
export const IconRoute = (p) => <S {...p}><circle cx="6" cy="19" r="2.4" /><circle cx="18" cy="5" r="2.4" /><path d="M8.4 18.2h6.2a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h2.4" /></S>;
export const IconPen = (p) => <S {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></S>;
export const IconBookmark = (p) => <S {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></S>;
export const IconUser = (p) => <S {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></S>;
export const IconSearch = (p) => <S {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></S>;
export const IconClock = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>;
export const IconSun = (p) => <S {...p}><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></S>;
export const IconCloud = (p) => <S {...p}><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6.5 19Z" /></S>;
export const IconRain = (p) => <S {...p}><path d="M17.5 15a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6.5 15" /><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" /></S>;
export const IconNav = (p) => <S {...p}><polygon points="3 11 22 2 13 21 11 13 3 11" /></S>;
export const IconPlus = (p) => <S {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>;
export const IconChevR = (p) => <S {...p}><polyline points="9 6 15 12 9 18" /></S>;
export const IconChevL = (p) => <S {...p}><polyline points="15 6 9 12 15 18" /></S>;
export const IconCheck = (p) => <S {...p}><polyline points="20 6 9 17 4 12" /></S>;
export const IconX = (p) => <S {...p}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></S>;
export const IconWalk = (p) => <S {...p}><circle cx="13" cy="4" r="1.6" /><path d="M11 22l1.5-7-2.5-2 1-5 3 2 2 2" /><path d="M9 11l1-3M12.5 15l-2.5 4" /></S>;
export const IconBike = (p) => <S {...p}><circle cx="6" cy="17" r="3.2" /><circle cx="18" cy="17" r="3.2" /><path d="M6 17l4-7h5l-2.5 7M10 10l-1.5-3H6.5M14 7h3" /></S>;
export const IconCar = (p) => <S {...p}><path d="M5 16v2M19 16v2" /><path d="M3 13l1.6-5A2 2 0 0 1 6.5 6.6h11a2 2 0 0 1 1.9 1.4L21 13v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /></S>;
export const IconStar = (p) => <S {...p}><polygon points="12 3 14.8 9 21 9.7 16.5 14 17.8 20 12 17 6.2 20 7.5 14 3 9.7 9.2 9" /></S>;
export const IconLock = (p) => <S {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></S>;
export const IconGlobe = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></S>;
export const IconWifiOff = (p) => <S {...p}><path d="M2 8.8a16 16 0 0 1 5-3.1M10.7 4.2a16 16 0 0 1 11.3 4.6" /><path d="M5 12.5a11 11 0 0 1 3.5-2.3M15 10a11 11 0 0 1 4 2.5" /><path d="M8.5 16.1a6 6 0 0 1 7 0" /><line x1="2" y1="2" x2="22" y2="22" /></S>;
export const IconMapOff = (p) => <S {...p}><path d="M9 4 3 6v14l6-2 6 2 6-2V8" /><path d="M9 4v8M15 8v8" /><line x1="3" y1="3" x2="21" y2="21" /></S>;
export const IconMail = (p) => <S {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 7 8.5 6 8.5-6" /></S>;
export const IconLayers = (p) => <S {...p}><polygon points="12 3 21 8 12 13 3 8 12 3" /><polyline points="3 13 12 18 21 13" /></S>;

export function WeatherGlyph({ kind = "맑음", size = 22, className }) {
  if (kind === "비") return <IconRain size={size} className={className || "text-blue-500"} />;
  if (kind === "눈") return <IconCloud size={size} className={className || "text-blue-300"} />;
  if (kind === "흐림" || kind === "구름많음") return <IconCloud size={size} className={className || "text-slate-400"} />;
  return <IconSun size={size} className={className || "text-weather"} />;
}
