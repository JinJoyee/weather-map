import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconChevL, IconRoute, IconSun } from "../common/icons";

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-card dark:bg-dark-card animate-slideup">
      <div className="max-w-[440px] mx-auto px-6 pt-[62px] pb-10 box-border">
        {children}
      </div>
    </div>
  );
}

export function AuthHeader() {
  const nav = useNavigate();
  return (
    <div className="flex items-center mb-7">
      <button onClick={() => nav(-1)}
        className="w-10 h-10 rounded-xl border border-line dark:border-dark-line
                   bg-card dark:bg-dark-chip grid place-items-center">
        <IconChevL size={20} className="text-ink dark:text-dark-ink" />
      </button>
    </div>
  );
}

export function Brand({ subtitle }) {
  return (
    <div className="mb-6">
      <div className="relative w-14 h-14 rounded-[17px] mb-4 bg-primary grid place-items-center
                      shadow-[0_10px_24px_-8px_#2563EB]">
        <IconRoute size={28} className="text-white" />
        <div className="absolute -right-1.5 -top-1.5 w-[26px] h-[26px] rounded-full bg-weather
                        grid place-items-center border-[3px] border-card dark:border-dark-card">
          <IconSun size={14} className="text-white" />
        </div>
      </div>
      <h1 className="m-0 text-[27px] font-extrabold text-ink dark:text-dark-ink tracking-[-0.03em]">
        Weather Map
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-[14.5px] text-muted dark:text-dark-muted leading-normal">{subtitle}</p>
      )}
    </div>
  );
}

export function Field({ icon, type = "text", placeholder, value, onChange, trailing, autoFocus }) {
  const [focus, setFocus] = useState(false);
  return (
    <div className={`flex items-center gap-2.5 px-3.5 h-[52px] rounded-[14px]
                     bg-bg dark:bg-dark-bg border-[1.5px] transition
                     ${focus
                       ? "border-primary shadow-[0_0_0_4px_rgba(37,99,235,.12)]"
                       : "border-line2 dark:border-dark-line2"}`}>
      {icon}
      <input
        type={type} placeholder={placeholder} value={value} autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        className="flex-1 min-w-0 bg-transparent outline-none text-[15.5px]
                   text-ink dark:text-dark-ink placeholder:text-faint dark:placeholder:text-dark-faint"
      />
      {trailing}
    </div>
  );
}

export function pwStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  score = Math.min(score, 3);
  const labels = ["약함", "약함", "보통", "강함"];
  const colors = ["text-red-600", "text-red-600", "text-weather", "text-custom"];
  const bars   = ["bg-red-600",   "bg-red-600",   "bg-weather",   "bg-custom"];
  return { score, label: pw ? labels[score] : "", color: colors[score], bar: bars[score] };
}