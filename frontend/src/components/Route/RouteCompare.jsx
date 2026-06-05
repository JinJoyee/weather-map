import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiSun, FiStar } from "react-icons/fi";
import { fetchRouteRecommend } from "../../api/route";

function calcTravelTime(route, mode) {
  if (!route) return null;
  const footDist = route.foot_distance ?? route.distance;
  if (mode === "walk") return footDist != null ? Math.ceil(footDist / 67)  : null;
  if (mode === "bike") return footDist != null ? Math.ceil(footDist / 250) : null;
  if (mode === "car")  return route.duration != null ? Math.ceil(route.duration / 60) : null;
  return null;
}

function formatDistance(route, mode) {
  const m = (mode === "car" ? route?.distance : route?.foot_distance) ?? route?.distance;
  if (m == null) return null;
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}

const ROUTE_STYLES = {
  normal:  { color: "#2563EB", label: "최단 경로",     strokeStyle: "solid" },
  context: { color: "#F59E0B", label: "날씨 최적 경로", strokeStyle: "solid" },
};

const ACCENTS = {
  normal:  { bar: "bg-[#2563EB]", icon: "text-[#2563EB]", desc: "시간 최단 · 카카오 내비" },
  context: { bar: "bg-[#F59E0B]", icon: "text-[#F59E0B]", desc: "날씨 맞춤 · 쾌적한 경로" },
  custom:  { bar: "bg-[#16A34A]", icon: "text-[#16A34A]", desc: "직접 그린 나만의 경로" },
};

const MODES = [
  { key: "walk", label: "도보" },
  { key: "bike", label: "자전거" },
  { key: "car",  label: "자동차" },
];

const CARDS = [
  { key: "normal",  title: "최단 경로",     Icon: FiClock },
  { key: "context", title: "날씨 최적 경로", Icon: FiSun  },
  { key: "custom",  title: "커스텀 경로",    Icon: FiStar },
];

const DEFAULT_CENTER = { lat: 36.3504, lng: 127.3845 };

function getActivePolyline(routes, key, mode) {
  const route = routes?.[key];
  if (!route) return null;
  if (key === "context") return route.polyline;
  if (mode === "car") return route.polyline;
  return route.foot_polyline?.length ? route.foot_polyline : route.polyline;
}

export default function RouteCompare() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const polylinesRef = useRef({});
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const pickStepRef = useRef(0);

  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [contextTags, setContextTags] = useState([]);
  const [isPolylineUpdating, setIsPolylineUpdating] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [transportMode, setTransportMode] = useState("car");

  const navigate = useNavigate();

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    const center = new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    mapInstance.current = new kakao.maps.Map(mapRef.current, { center, level: 7 });

    kakao.maps.event.addListener(mapInstance.current, "click", (mouseEvent) => {
      if (pickStepRef.current >= 2) return;

      const lat = mouseEvent.latLng.getLat();
      const lng = mouseEvent.latLng.getLng();
      const k = window.kakao;

      if (pickStepRef.current === 0) {
        if (startMarkerRef.current) startMarkerRef.current.setMap(null);
        startMarkerRef.current = new k.maps.Marker({
          position: mouseEvent.latLng,
          map: mapInstance.current,
        });
        setStartPos({ lat, lng });
        pickStepRef.current = 1;
      } else {
        if (endMarkerRef.current) endMarkerRef.current.setMap(null);
        endMarkerRef.current = new k.maps.Marker({
          position: mouseEvent.latLng,
          map: mapInstance.current,
        });
        setEndPos({ lat, lng });
        pickStepRef.current = 2;
      }
    });
  }, []);

  useEffect(() => {
    if (!startPos || !endPos) return;

    const loadRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setRoutes(null);
        const data = await fetchRouteRecommend(
          startPos.lat, startPos.lng,
          endPos.lat,   endPos.lng
        );
        setRoutes(data.routes);
        setRecommendation(data.recommendation);
        setContextTags(data.context_tags || []);
        setWarnings(data.warnings || []);
        setWeather(data.weather || null);
        const n = data.routes?.normal;
        const isSame = JSON.stringify(n?.polyline?.[0]) === JSON.stringify(n?.foot_polyline?.[0]) &&
                       JSON.stringify(n?.polyline?.slice(-1)) === JSON.stringify(n?.foot_polyline?.slice(-1));
        console.log('[Route] normal.polyline:', n?.polyline?.length, '/ foot_polyline:', n?.foot_polyline?.length, '/ 경로 동일?', isSame);
        if (isSame) console.warn('[Route] ⚠️ TIME과 RECOMMEND가 동일한 경로 반환 — 카카오 API 단거리 동일 경로 현상');
      } catch {
        setError("경로를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    loadRoutes();
  }, [startPos, endPos]);

  useEffect(() => {
    const { kakao } = window;
    if (!routes || !mapInstance.current || !kakao) return;

    Object.values(polylinesRef.current).forEach(({ outer, inner }) => {
      outer?.setMap(null);
      inner?.setMap(null);
    });
    polylinesRef.current = {};

    const bounds = new kakao.maps.LatLngBounds();
    let hasPolyline = false;

    const pathMap = {};
    Object.entries(ROUTE_STYLES).forEach(([key]) => {
      const polylineData = getActivePolyline(routes, key, transportMode);
      if (!polylineData?.length) return;
      const path = polylineData.map((p) => new kakao.maps.LatLng(p.lat, p.lng));
      path.forEach((p) => bounds.extend(p));
      pathMap[key] = path;
      hasPolyline = true;
    });

    Object.entries(ROUTE_STYLES).forEach(([key]) => {
      const path = pathMap[key];
      if (!path) return;
      const outerPl = new kakao.maps.Polyline({
        path,
        strokeWeight: 10,
        strokeColor: "#FFFFFF",
        strokeOpacity: 0.85,
        strokeStyle: "solid",
      });
      outerPl.setMap(mapInstance.current);
      polylinesRef.current[key] = { outer: outerPl, inner: null };
    });

    Object.entries(ROUTE_STYLES).forEach(([key, style]) => {
      const path = pathMap[key];
      if (!path) return;
      const innerPl = new kakao.maps.Polyline({
        path,
        strokeWeight: 6,
        strokeColor: style.color,
        strokeOpacity: 0.95,
        strokeStyle: style.strokeStyle,
        endArrow: true,
      });
      innerPl.setMap(mapInstance.current);
      polylinesRef.current[key].inner = innerPl;
    });

    if (hasPolyline) {
      mapInstance.current.setBounds(bounds);
    } else if (startPos && endPos) {
      bounds.extend(new kakao.maps.LatLng(startPos.lat, startPos.lng));
      bounds.extend(new kakao.maps.LatLng(endPos.lat, endPos.lng));
      mapInstance.current.setBounds(bounds);
    }

    setTimeout(() => setIsPolylineUpdating(false), 200);
  }, [routes, startPos, endPos, transportMode]);

  const handleReset = () => {
    if (startMarkerRef.current) startMarkerRef.current.setMap(null);
    if (endMarkerRef.current)   endMarkerRef.current.setMap(null);
    startMarkerRef.current = null;
    endMarkerRef.current   = null;
    pickStepRef.current    = 0;

    Object.values(polylinesRef.current).forEach(({ outer, inner }) => {
      outer?.setMap(null);
      inner?.setMap(null);
    });
    polylinesRef.current = {};

    setStartPos(null);
    setEndPos(null);
    setRoutes(null);
    setRecommendation("");
    setContextTags([]);
    setWarnings([]);
    setWeather(null);
    setError(null);
    setSelectedRoute(null);
    setIsLoading(false);
  };

  const handleSelectRoute = (key) => {
    setSelectedRoute(key);
    Object.entries(polylinesRef.current).forEach(([k, { outer, inner }]) => {
      const isSelected = k === key;
      outer?.setOptions({ strokeWeight: isSelected ? 16 : 10, strokeOpacity: isSelected ? 1.0 : 0.4 });
      inner?.setOptions({ strokeWeight: isSelected ? 10 : 6,  strokeOpacity: isSelected ? 1.0 : 0.3 });
    });
  };

  const openKakaoNavi = () => {
    if (!startPos || !endPos) return;
    const url = `https://map.kakao.com/link/from/출발지,${startPos.lat},${startPos.lng}/to/목적지,${endPos.lat},${endPos.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col h-screen dark:bg-surface-dark">
      {/* 지도 — 모바일 40vh, 데스크탑 45vh */}
      <div className="relative w-full h-[40vh] md:h-[45vh]">
        <div ref={mapRef} className="w-full h-full" />

        {isPolylineUpdating && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 px-4 py-2.5 shadow-lg text-sm font-semibold text-gray-700 dark:text-slate-200">
              <svg className="h-4 w-4 animate-spin text-[#2563EB]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              경로 업데이트 중
            </div>
          </div>
        )}

        {!startPos && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/95 dark:bg-slate-800/95 rounded-lg px-4 py-2 shadow-md text-sm font-semibold text-gray-700 dark:text-slate-200 whitespace-nowrap pointer-events-none">
            📍 출발지를 지도에서 클릭하세요
          </div>
        )}
        {startPos && !endPos && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/95 dark:bg-slate-800/95 rounded-lg px-4 py-2 shadow-md text-sm font-semibold text-gray-700 dark:text-slate-200 whitespace-nowrap pointer-events-none">
            🏁 도착지를 지도에서 클릭하세요
          </div>
        )}
        {startPos && endPos && (
          <button
            onClick={handleReset}
            className="absolute top-3 right-3 z-10 bg-white/95 dark:bg-slate-800/95 rounded-lg px-3 py-1.5 shadow-md text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition"
          >
            다시 설정
          </button>
        )}

        {routes && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/95 dark:bg-slate-800/95 rounded-lg px-3 py-2 shadow-md pointer-events-none">
            {Object.entries(ROUTE_STYLES).map(([key, style]) => (
              <div key={key} className="flex items-center gap-2 text-xs text-gray-700 dark:text-slate-200 mb-0.5 last:mb-0">
                <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: style.color }} />
                <span>{style.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 패널 */}
      <div className="flex-1 overflow-y-auto p-4 dark:bg-surface-dark">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">추천 경로 비교</h1>
          {startPos && endPos && (
            <button
              onClick={handleReset}
              className="text-sm text-[#2563EB] font-medium hover:opacity-70 transition-all"
            >
              새 경로 탐색
            </button>
          )}
        </div>

        {!startPos || !endPos ? (
          <p className="text-gray-400 dark:text-slate-500 text-sm mt-6 text-center">
            지도에서 출발지와 도착지를 선택하면 경로를 추천해 드립니다.
          </p>
        ) : isLoading ? (
          <p className="text-gray-500 dark:text-slate-400 mt-4">경로를 불러오는 중...</p>
        ) : error ? (
          <div className="mt-4">
            <p className="text-red-500 mb-2">{error}</p>
            <button onClick={handleReset} className="text-sm text-[#2563EB] underline">
              다시 설정
            </button>
          </div>
        ) : routes ? (
          <>
            {recommendation && (
              <div className="mb-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <span className="flex-1 font-medium">{recommendation}</span>
                  {contextTags.map((tag) => (
                    <span key={tag} className="rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                {weather && (
                  <p className="mt-1.5 text-xs text-blue-500 dark:text-blue-400">
                    현재 날씨: {weather.temperature != null ? `${weather.temperature}°C` : "—"}
                    {" · "}UV {weather.uv_index ?? "—"}
                    {" · "}강수 {weather.rain_probability ?? 0}%
                    {weather.weather ? ` · ${weather.weather}` : ""}
                  </p>
                )}
              </div>
            )}

            {warnings.length > 0 && (
              <div className="mb-3 flex flex-col gap-1.5">
                {warnings.map((w, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                    {w}
                  </div>
                ))}
              </div>
            )}

            {/* 카드 3개 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {CARDS.map(({ key, title, Icon }) => {
                const accent    = ACCENTS[key];
                const route     = routes?.[key];
                const isSelected = selectedRoute === key;

                return (
                  <div
                    key={key}
                    className={`overflow-hidden rounded-xl border bg-white dark:bg-slate-800 shadow-sm transition ${
                      isSelected
                        ? "border-[#2563EB] ring-2 ring-[#2563EB]/20"
                        : "border-gray-200 dark:border-slate-700"
                    }`}
                  >
                    <div className={`h-[3px] w-full ${accent.bar}`} />

                    <div className="p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <Icon className={`text-base ${accent.icon}`} />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
                      </div>
                      {/* text-xs → text-sm: 모바일 가독성 */}
                      <p className="mb-3 text-sm text-gray-400 dark:text-slate-500">
                        {key !== "custom" && route?.description
                          ? route.description
                          : accent.desc}
                      </p>

                      {key !== "custom" && (() => {
                        const isContext = key === "context";
                        const effectiveMode = isContext && transportMode === "car" ? "walk" : transportMode;
                        return (
                          <>
                            <div className="mb-3 flex overflow-hidden rounded-lg border border-gray-200 dark:border-slate-600">
                              {MODES.map((m, i) => {
                                const isCarOnContext = isContext && m.key === "car";
                                return (
                                  <button
                                    key={m.key}
                                    disabled={isCarOnContext}
                                    title={isCarOnContext ? "날씨 최적 경로는 도보/자전거 기준입니다" : undefined}
                                    onClick={() => { if (!isCarOnContext) { setIsPolylineUpdating(true); setTransportMode(m.key); } }}
                                    className={`flex-1 py-1.5 text-xs transition-colors ${
                                      i > 0 ? "border-l border-gray-200 dark:border-slate-600" : ""
                                    } ${
                                      isCarOnContext
                                        ? "opacity-30 cursor-not-allowed text-gray-400 dark:text-slate-500"
                                        : effectiveMode === m.key
                                          ? "bg-[#2563EB] text-white"
                                          : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700"
                                    }`}
                                  >
                                    {m.label}
                                  </button>
                                );
                              })}
                            </div>

                            {isContext && (
                              <p className="mb-1 text-xs text-amber-500">도보/자전거 기준 경로</p>
                            )}

                            <div className="mb-3 text-sm font-semibold text-gray-800 dark:text-slate-200">
                              {route
                                ? calcTravelTime(route, effectiveMode) != null
                                  ? `약 ${calcTravelTime(route, effectiveMode)}분`
                                  : "정보 없음"
                                : "—"}
                              {formatDistance(route, effectiveMode) && (
                                <span className="ml-2 text-xs font-normal text-gray-400 dark:text-slate-400">
                                  · {formatDistance(route, effectiveMode)}
                                </span>
                              )}
                            </div>
                          </>
                        );
                      })()}

                      {key === "custom" && (
                        <p className="mb-3 text-sm text-gray-300 dark:text-slate-600">아직 경로 없음</p>
                      )}

                      {/* py-2 → py-2.5: 터치 타깃 확보 */}
                      <div className="flex gap-2">
                        {key === "custom" ? (
                          <button
                            onClick={() => navigate("/draw")}
                            className="flex-1 rounded-lg border border-gray-200 dark:border-slate-600 py-2.5 text-sm font-medium text-gray-500 dark:text-slate-400 transition hover:bg-gray-50 dark:hover:bg-slate-700"
                          >
                            경로 그리기
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSelectRoute(key)}
                              className="flex-1 rounded-lg bg-[#2563EB] py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              {isSelected ? "✓ 선택됨" : "이 경로 선택"}
                            </button>
                            <button
                              onClick={openKakaoNavi}
                              className="rounded-lg border border-gray-200 dark:border-slate-600 px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-slate-400 transition hover:bg-gray-50 dark:hover:bg-slate-700"
                            >
                              카카오 내비
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}