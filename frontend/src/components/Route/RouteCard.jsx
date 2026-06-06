import React from "react";

export default function RouteCard({
  tone = "primary", Icon, title, recommended,
  description, eta, distance,
  selected, onSelect, onNavigate,
}) {
  const accent = tone === "weather"
    ? "border-weather/40 bg-weather/5 dark:bg-weather/10"
    : "border-primary/30 bg-primary/5 dark:bg-primary/10";

  return (
    <div
      className={`rounded-card border p-4 transition-shadow cursor-pointer
                  bg-card dark:bg-dark-card border-line dark:border-dark-line
                  ${selected ? "shadow-lg ring-2 ring-primary/30" : "shadow-sm hover:shadow-md"}
                  ${accent}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0
                         ${tone === "weather" ? "bg-weather/15" : "bg-primary/15"}`}>
          <Icon size={19} className={tone === "weather" ? "text-weather" : "text-primary"} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14px] font-bold text-ink dark:text-dark-ink">{title}</span>
            {recommended && (
              <span className="text-[11px] font-bold text-weather bg-weather/10 px-1.5 py-0.5 rounded-md">
                추천
              </span>
            )}
          </div>
          {description && (
            <p className="text-[12.5px] text-muted dark:text-dark-muted leading-snug">{description}</p>
          )}
          {(eta != null || distance != null) && (
            <div className="flex items-center gap-2 mt-2">
              {eta != null && (
                <span className="text-[13px] font-bold text-ink dark:text-dark-ink">약 {eta}분</span>
              )}
              {distance != null && (
                <span className="text-[12px] text-muted dark:text-dark-muted">· {distance}</span>
              )}
            </div>
          )}
        </div>
      </div>
      {onNavigate && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
          className="mt-3 w-full py-2 rounded-[10px] text-[13px] font-semibold
                     bg-chip dark:bg-dark-chip text-ink dark:text-dark-ink
                     hover:bg-line dark:hover:bg-dark-line transition-colors"
        >
          카카오 내비로 안내
        </button>
      )}
    </div>
  );
}