// common/useViewport.js — responsive breakpoint hook. Desktop = viewport ≥ 1024px.
import { useState, useEffect } from "react";

export const DESKTOP_MIN = 1024;

export default function useViewport() {
  const get = () => (typeof window !== "undefined" ? window.innerWidth >= DESKTOP_MIN : true);
  const [isDesktop, setIsDesktop] = useState(get);
  useEffect(() => {
    const on = () => setIsDesktop(get());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return isDesktop;
}
