// Route/RouteCard.jsx — a single route option card for the compare sheet.
// Presentational: pass computed eta (minutes) and distance string for the active mode.
import React from "react";
import { IconCheck, IconNav } from "../common/icons";

// tone → tailwind classes for the color strip / icon tile / accents
const TONE = {
  primary: { strip: "bg-primary", tile: "bg-primary/10 text-primary", chip: "" },
  weather: { strip: "bg-weather", tile: "bg-weather/15 text-weather", chip: "" },
  custom: { strip: "bg-custom", tile: "bg-custom/15 text-custom", chip: "" },
};

function fmtEta(min) {
  if (min == null) return "—";
  return min < 60 ? `${min}분` : `${Math.floor(min / 60)}시간 ${min % 60}분`;
}

export default function RouteCard({
  title, description, Icon, tone = "primary",
  eta, distance, selected, recommended, onSelect, onNavigate,
}) {
  const t = TONE[tone];
  const disabled = eta == null;
  return (
    <div className={`overflow-hidden rounded-card bg-card transition
      ${selected ? "border-[1.5px] border-primary shadow-[0_0_0_4px_rgba(37,99,235,.12)]" : "border border-line shadow-sm"}`}>
      <div className={`h-[3px] ${t.strip}`} />
      <div className="p-[15px]">
        <div className="flex items-center gap-[9px] mb-1">
          <div className={`w-[30px] h-[30px] rounded-[9px] grid place-items-center ${t.tile}`}>
            {Icon && <Icon size={18} />}
          </div>
          <span className="text-[15.5px] font-extrabold text-ink tracking-[-0.01em] whitespace-nowrap">{title}</span>
          {recommended && (
            <span className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-semibold px-2.5 py-1 rounded-full bg-weather/15 text-[#B45309]">
              <IconCheck size={12} /> 추천
            </span>
          )}
        </div>
        <p className="ml-[39px] mb-3 text-[12.5px] text-muted leading-snug">{description}</p>

        {disabled ? (
          <div className="ml-[39px] mb-3 text-[13px] text-faint">이 이동수단은 지원하지 않아요</div>
        ) : (
          <div className="flex items-baseline gap-2 ml-[39px] mb-[13px] whitespace-nowrap">
            <span className="text-[26px] font-extrabold text-ink tracking-[-0.03em] tabular-nums">{fmtEta(eta)}</span>
            {distance && <span className="text-[13.5px] font-semibold text-muted">· {distance}</span>}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onSelect} disabled={disabled}
            className={`flex-1 py-[11px] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap
              ${selected ? "bg-primary text-white"
                : disabled ? "bg-chip text-faint"
                : "bg-primary/10 text-primary"}`}>
            {selected ? <><IconCheck size={16} /> 선택됨</> : "이 경로 선택"}
          </button>
          <button onClick={onNavigate} disabled={disabled}
            className="px-3.5 py-[11px] rounded-xl border border-line bg-card text-muted text-sm font-semibold flex items-center gap-1.5">
            <IconNav size={16} /> 안내
          </button>
        </div>
      </div>
    </div>
  );
}
