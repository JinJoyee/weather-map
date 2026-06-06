// layout/AppLayout.jsx — top-level responsive shell. Wrap your <Routes> with it
// (as a layout route) so every screen gets the right chrome:
//   ≥1024px  → [ SideRail | <Outlet/> ]              (Outlet renders Panel + MapArea)
//   <1024px  → [ <Outlet/> ] + fixed BottomTabBar     (Outlet renders MapArea + BottomSheet)
//
// Example (react-router v6):
//   <Route element={<AppLayout loggedIn={loggedIn} onAccount={() => nav('/login')} />}>
//     <Route path="/map"    element={<MapScreen />} />
//     <Route path="/routes" element={<RouteCompare />} />
//     <Route path="/draw"   element={<CustomRouteDraw />} />
//     <Route path="/custom" element={<RouteList />} />
//   </Route>
import React from "react";
import { Outlet } from "react-router-dom";
import useViewport from "../components/common/useViewport";
import SideRail from "../components/common/SideRail";
import BottomTabBar from "../components/common/BottomTabBar";

export default function AppLayout({ loggedIn, onAccount }) {
  const isDesktop = useViewport();

  if (isDesktop) {
    return (
      <div className="flex h-screen overflow-hidden bg-bg">
        <SideRail loggedIn={loggedIn} onAccount={onAccount} />
        <main className="flex-1 flex min-w-0">
          <Outlet />
        </main>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen bg-bg">
      <Outlet />
      <BottomTabBar />
    </div>
  );
}
