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
      {/* ODbL 의무 저작자 표기 — OSM 경로 데이터 사용 */}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-1 right-1 z-10 text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded pointer-events-auto"
      >
        © OpenStreetMap contributors
      </a>
    </div>
  );
}
