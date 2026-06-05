import { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/client";
import { getToken } from "../../api/auth";

const DEFAULT_CENTER = { lat: 36.3504, lng: 127.3845 };

export default function CustomRouteDraw() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const pointsRef = useRef([]);

  const [points, setPoints] = useState([]);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    const center = new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    mapInstance.current = new kakao.maps.Map(mapRef.current, { center, level: 6 });

    kakao.maps.event.addListener(mapInstance.current, "click", (e) => {
      const lat = e.latLng.getLat();
      const lng = e.latLng.getLng();
      const k = window.kakao;

      const marker = new k.maps.Marker({ position: e.latLng, map: mapInstance.current });
      markersRef.current.push(marker);

      const newPoints = [...pointsRef.current, { lat, lng }];
      pointsRef.current = newPoints;
      setPoints([...newPoints]);

      if (polylineRef.current) {
        polylineRef.current.outer.setMap(null);
        polylineRef.current.inner.setMap(null);
        polylineRef.current = null;
      }
      if (newPoints.length >= 2) {
        const path = newPoints.map((p) => new k.maps.LatLng(p.lat, p.lng));
        const outerPl = new k.maps.Polyline({
          path, strokeWeight: 10, strokeColor: "#FFFFFF",
          strokeOpacity: 0.9, strokeStyle: "solid", endArrow: true,
        });
        outerPl.setMap(mapInstance.current);
        const innerPl = new k.maps.Polyline({
          path, strokeWeight: 6, strokeColor: "#10B981",
          strokeOpacity: 0.9, strokeStyle: "solid", endArrow: true,
        });
        innerPl.setMap(mapInstance.current);
        polylineRef.current = { outer: outerPl, inner: innerPl };
      }
    });
  }, []);

  const handleUndo = () => {
    if (pointsRef.current.length === 0) return;

    const lastMarker = markersRef.current.pop();
    if (lastMarker) lastMarker.setMap(null);

    if (polylineRef.current) {
      polylineRef.current.outer.setMap(null);
      polylineRef.current.inner.setMap(null);
      polylineRef.current = null;
    }

    const newPoints = pointsRef.current.slice(0, -1);
    pointsRef.current = newPoints;
    setPoints([...newPoints]);

    const { kakao } = window;
    if (newPoints.length >= 2 && kakao) {
      const path = newPoints.map((p) => new kakao.maps.LatLng(p.lat, p.lng));
      const outerPl = new kakao.maps.Polyline({
        path, strokeWeight: 10, strokeColor: "#FFFFFF",
        strokeOpacity: 0.9, strokeStyle: "solid", endArrow: true,
      });
      outerPl.setMap(mapInstance.current);
      const innerPl = new kakao.maps.Polyline({
        path, strokeWeight: 6, strokeColor: "#10B981",
        strokeOpacity: 0.9, strokeStyle: "solid", endArrow: true,
      });
      innerPl.setMap(mapInstance.current);
      polylineRef.current = { outer: outerPl, inner: innerPl };
    }
  };

  const handleClear = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.outer.setMap(null);
      polylineRef.current.inner.setMap(null);
      polylineRef.current = null;
    }
    pointsRef.current = [];
    setPoints([]);
  };

  const handleSave = async () => {
    if (points.length < 2) return setError("최소 2개 이상의 지점을 클릭하세요.");
    if (!name.trim()) return setError("경로 이름을 입력하세요.");
    if (!getToken()) return setError("로그인이 필요합니다.");

    setSaving(true);
    setError("");
    try {
      await api.post("/api/routes/custom", {
        name: name.trim(),
        start_lat: points[0].lat,
        start_lng: points[0].lng,
        end_lat: points[points.length - 1].lat,
        end_lng: points[points.length - 1].lng,
        waypoints: points.slice(1, -1),
        is_public: isPublic,
      });
      navigate("/custom");
    } catch {
      setError("저장에 실패했습니다. 다시 시도하세요.");
    } finally {
      setSaving(false);
    }
  };

  const instruction =
    points.length === 0
      ? "지도를 클릭해 출발지를 설정하세요"
      : points.length === 1
      ? "다음 지점을 클릭하세요 (계속 클릭해 경유지 추가)"
      : `${points.length}개 지점 설정됨 · 마지막 클릭이 도착지`;

  return (
    <div className="flex flex-col h-screen">
      <div className="relative w-full h-[55vh] md:h-[60vh]">
        <div ref={mapRef} className="w-full h-full" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/95 dark:bg-slate-800/95 rounded-lg px-4 py-2 shadow-md text-sm font-semibold text-gray-700 dark:text-slate-200 whitespace-nowrap pointer-events-none">
          {instruction}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-surface-dark-2">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleUndo}
            disabled={points.length === 0}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40"
          >
            되돌리기
          </button>
          <button
            onClick={handleClear}
            disabled={points.length === 0}
            className="px-3 py-1.5 text-sm rounded border border-red-300 dark:border-red-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40"
          >
            초기화
          </button>
          <Link to="/custom" className="ml-auto text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
            저장된 경로 보기 →
          </Link>
        </div>

        <input
          type="text"
          placeholder="경로 이름을 입력하세요"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[#191C1E] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-primary"
        />

        <label className="flex items-center gap-2 text-sm dark:text-slate-300 mb-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          공개 경로로 저장
        </label>

        {error && <p className="text-red-500 dark:text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || points.length < 2}
          className="w-full bg-primary dark:bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:opacity-90 disabled:opacity-40 transition-all"
        >
          {saving ? "저장 중..." : "경로 저장"}
        </button>
      </div>
    </div>
  );
}