// common/MapArea.jsx — the map surface that fills the remaining space (desktop) or the
// whole screen behind the bottom sheet (mobile). Mount your Kakao map into `mapRef`.
// `children` are floating overlays (weather pill, legend, layer button, FABs).
import React from "react";

export default function MapArea({ mapRef, children }) {
  return (
    <div className="relative flex-1 min-w-0 h-full">
      {/* Kakao map mounts here */}
      <div ref={mapRef} className="absolute inset-0 bg-bg" />
      {children}
    </div>
  );
}
