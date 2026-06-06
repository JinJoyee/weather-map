// common/Panel.jsx — DESKTOP left content panel (the column between the rail and the map).
// On mobile the SAME panel content goes inside <BottomSheet> instead (see MapScreenScaffold).
import React from "react";

export function Panel({ width = 404, children }) {
  return (
    <aside style={{ width }}
      className="shrink-0 bg-card border-r border-line flex flex-col overflow-hidden z-20">
      {children}
    </aside>
  );
}

export function PanelHead({ title, sub, action }) {
  return (
    <div className="px-6 pt-[22px] pb-4 border-b border-line shrink-0">
      <div className="flex items-center gap-2.5">
        <h1 className="m-0 text-[22px] font-extrabold text-ink tracking-[-0.025em] whitespace-nowrap">{title}</h1>
        {sub && <span className="text-[13px] text-faint whitespace-nowrap flex items-center gap-1.5">{sub}</span>}
        {action && <div className="ml-auto">{action}</div>}
      </div>
    </div>
  );
}
