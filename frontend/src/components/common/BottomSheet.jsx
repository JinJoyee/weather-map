// common/BottomSheet.jsx
// draggable bottom sheet with peek/mid/full snap points.

import React, { useState, useEffect } from "react";

export default function BottomSheet({
  snap,
  onSnap,
  header,
  children,
  peekHeight = 150,
  midRatio = 0.54,
  topGap = 64,
  containerHeight =
    typeof window !== "undefined" ? window.innerHeight : 800,
}) {
  const [drag, setDrag] = useState(null);

  const heights = {
    peek: peekHeight,
    mid: Math.round(containerHeight * midRatio),
    full: containerHeight - topGap,
  };

  const h = drag ? drag.curH : heights[snap];

  const start = (e) => {
    const y = e.touches ? e.touches[0].clientY : e.clientY;

    setDrag({
      startY: y,
      startH: heights[snap],
      curH: heights[snap],
    });
  };

  useEffect(() => {
    if (!drag) return;

    const move = (e) => {
      const y = e.touches ? e.touches[0].clientY : e.clientY;

      const next = Math.min(
        heights.full,
        Math.max(
          heights.peek - 30,
          drag.startH + (drag.startY - y)
        )
      );

      setDrag((d) => ({
        ...d,
        curH: next,
      }));
    };

    const up = () => {
      setDrag((d) => {
        const order = [
          ["peek", heights.peek],
          ["mid", heights.mid],
          ["full", heights.full],
        ];

        let best = "peek";
        let bd = Infinity;

        order.forEach(([k, v]) => {
          const dd = Math.abs(v - d.curH);

          if (dd < bd) {
            bd = dd;
            best = k;
          }
        });

        onSnap(best);
        return null;
      });
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, {
      passive: false,
    });
    window.addEventListener("touchend", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [drag, heights, onSnap]);

  return (
    <div
      className="
        absolute
        left-0
        right-0
        bottom-0
        z-30
        bg-card dark:bg-dark-card
        rounded-t-[22px]
        flex
        flex-col
        overflow-hidden
        shadow-[0_-8px_40px_-12px_rgba(16,24,40,.22)]
      "
      style={{
        height: h,
        transition: drag
          ? "none"
          : "height .32s cubic-bezier(.32,.72,0,1)",
      }}
    >
      <div
        onMouseDown={start}
        onTouchStart={start}
        className="
          pt-2.5
          pb-1
          cursor-grab
          shrink-0
          touch-none
        "
      >
        <div
          className="
            w-[38px]
            h-[5px]
            rounded-full
            bg-line2 dark:bg-dark-line
            mx-auto
          "
        />

        {header && (
          <div className="px-5 pt-2">
            {header}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}