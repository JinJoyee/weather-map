// common/feedback.jsx — Spinner, Dots, Skeleton, SkeletonRouteCard, StateView.
import React from "react";

export function Spinner({ size = 22, className = "text-primary", strokeWidth = 2.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      className={`animate-[wm-spin_.8s_linear_infinite] ${className}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.18" strokeWidth={strokeWidth} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function Dots({ className = "bg-primary" }) {
  return (
    <span className="inline-flex items-center gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`w-[5px] h-[5px] rounded-full ${className}`}
          style={{ animation: `wm-pulse 1s ease-in-out ${i * 0.16}s infinite` }} />
      ))}
    </span>
  );
}

// Shimmer placeholder. Width/height via style or className.
export function Skeleton({ className = "", style }) {
  return (
    <span
      className={`block bg-chip animate-shimmer ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(100deg, #EEEAE0 30%, #f7f4ec 50%, #EEEAE0 70%)",
        backgroundSize: "200% 100%",
        ...style,
      }}
    />
  );
}

export function SkeletonRouteCard() {
  return (
    <div className="bg-card rounded-card border border-line overflow-hidden shadow-sm">
      <Skeleton className="w-full h-[3px] rounded-none" />
      <div className="p-[15px]">
        <div className="flex items-center gap-[9px] mb-3">
          <Skeleton className="w-[30px] h-[30px] rounded-[9px]" />
          <Skeleton className="w-[110px] h-4 rounded-md" />
          <Skeleton className="w-[46px] h-5 rounded-full ml-auto" />
        </div>
        <Skeleton className="w-[72%] h-3 rounded-md ml-[39px] mb-3.5" />
        <Skeleton className="w-[92px] h-6 rounded-[7px] ml-[39px] mb-[15px]" />
        <div className="flex gap-2">
          <Skeleton className="w-full h-10 rounded-xl" />
          <Skeleton className="w-[70px] h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Generic empty / error / success state.
const TONES = {
  neutral: "bg-primary/10 text-primary",
  warn: "bg-weather/15 text-[#B45309]",
  error: "bg-red-600/10 text-red-600",
};

export function StateView({ Icon, tone = "neutral", title, desc, primary, onPrimary, secondary, onSecondary, compact }) {
  return (
    <div className={`flex flex-col items-center text-center mx-auto max-w-[340px] ${compact ? "py-9 px-7" : "py-[52px] px-8"}`}>
      <div className={`w-16 h-16 rounded-[20px] mb-[18px] grid place-items-center ${TONES[tone]}`}>
        {Icon && <Icon size={30} />}
      </div>
      <h2 className="m-0 mb-2 text-[19px] font-extrabold text-ink tracking-[-0.02em]">{title}</h2>
      {desc && <p className="m-0 text-sm text-muted leading-relaxed">{desc}</p>}
      {(primary || secondary) && (
        <div className="flex flex-col gap-2.5 w-full mt-[22px]">
          {primary && (
            <button onClick={onPrimary}
              className="h-[50px] rounded-[13px] bg-cta text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-md whitespace-nowrap">
              {primary}
            </button>
          )}
          {secondary && (
            <button onClick={onSecondary}
              className="h-12 rounded-[14px] border border-line2 bg-card text-ink text-[14.5px] font-bold whitespace-nowrap">
              {secondary}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
