// common/Panel.jsx
// DESKTOP left content panel.
// Mobile에서는 동일한 panel content를 BottomSheet에서 사용.

import React from "react";

export function Panel({ width = 404, children }) {
  return (
    <aside
      style={{ width }}
      className="
        shrink-0
        bg-card dark:bg-dark-card
        border-r border-line dark:border-dark-line
        flex flex-col
        overflow-hidden
        z-20
      "
    >
      {children}
    </aside>
  );
}

export function PanelHead({ title, sub, action }) {
  return (
    <div
      className="
        px-6
        pt-[22px]
        pb-4
        border-b border-line dark:border-dark-line
        shrink-0
      "
    >
      <div className="flex items-center gap-2.5">
        <h1
          className="
            m-0
            text-[22px]
            font-extrabold
            text-ink dark:text-dark-ink
            tracking-[-0.025em]
            whitespace-nowrap
          "
        >
          {title}
        </h1>

        {sub && (
          <span
            className="
              text-[13px]
              text-faint dark:text-dark-faint
              whitespace-nowrap
              flex
              items-center
              gap-1.5
            "
          >
            {sub}
          </span>
        )}

        {action && <div className="ml-auto">{action}</div>}
      </div>
    </div>
  );
}