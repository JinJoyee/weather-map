// layout/MapScreenScaffold.jsx — author each map screen ONCE, render in both layouts.
//   Desktop (≥1024): <Panel>{panel}</Panel> beside <MapArea>{map}</MapArea>
//   Mobile  (<1024):  full-screen <MapArea>{map}</MapArea> with {panel} inside a <BottomSheet>
//
// `panel`  — the left-column / bottom-sheet content (route cards, weather, form, …)
// `map`    — floating overlays drawn over the map (pills, legend, FABs). The Kakao map itself
//            is rendered by MapArea; pass `mapRef` so both layouts mount the same map node.
// `sheetHeader` — small node shown in the mobile sheet's drag handle area (title + status).
// `panelWidth`  — desktop panel width (default 404; My Routes uses ~420).
//
// For non-map screens that are just a panel (rare), pass map={null}.
import React, { useState } from "react";
import useViewport from "../components/common/useViewport";
import { Panel } from "../components/common/Panel";
import MapArea from "../components/common/MapArea";
import BottomSheet from "../components/common/BottomSheet";

export default function MapScreenScaffold({ panel, map, sheetHeader, mapRef, panelWidth = 404 }) {
  const isDesktop = useViewport();
  const [snap, setSnap] = useState("mid");

  if (isDesktop) {
    return (
      <>
        <Panel width={panelWidth}>{panel}</Panel>
        <MapArea mapRef={mapRef}>{map}</MapArea>
      </>
    );
  }

  return (
    <div className="relative h-[100dvh]">
      <MapArea mapRef={mapRef}>{map}</MapArea>
      <BottomSheet snap={snap} onSnap={setSnap} header={sheetHeader}>
        {panel}
      </BottomSheet>
    </div>
  );
}
