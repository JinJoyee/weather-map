import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiSun, FiStar } from "react-icons/fi";
import { fetchRouteRecommend } from "../../api/route";

function calcTravelTime(route, mode) {
  if (!route) return null;
  if (mode === "walk") return route.distance != null ? Math.ceil(route.distance / 67)  : null;
  if (mode === "bike") return route.distance != null ? Math.ceil(route.distance / 250) : null;
  if (mode === "car")  return route.duration  != null ? Math.ceil(route.duration  / 60) : null;
  return null;
}

function formatDistance(m) {
  if (m == null) return null;
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}

const ROUTE_STYLES = {
  normal:  { color: "#2563EB", label: "최단 경로",     strokeStyle: "solid" },
  context: { color: "#F59E0B", label: "날씨 최적 경로", strokeStyle: "solid" },
};

// 클래스 이름 전체를 문자열로 — Tailwind 빌드 시 동적 조합 클래스는 제거됨
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
  const [warnings, setWarnings] = useState([]);
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
      const polylineData = routes[key]?.polyline;
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
  }, [routes, startPos, endPos]);

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
    <div className="flex flex-col h-screen">
      {/* 지도 */}
      <div className="relative w-full" style={{ height: "45vh" }}>
        <div ref={mapRef} className="w-full h-full" />

        {!startPos && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/95 rounded-lg px-4 py-2 shadow-md text-sm font-semibold text-gray-700 whitespace-nowrap pointer-events-none">
            📍 출발지를 지도에서 클릭하세요
          </div>
        )}
        {startPos && !endPos && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/95 rounded-lg px-4 py-2 shadow-md text-sm font-semibold text-gray-700 whitespace-nowrap pointer-events-none">
            🏁 도착지를 지도에서 클릭하세요
          </div>
        )}
        {startPos && endPos && (
          <button
            onClick={handleReset}
            className="absolute top-3 right-3 z-10 bg-white/95 rounded-lg px-3 py-1.5 shadow-md text-xs font-semibold text-gray-700 hover:bg-white transition"
          >
            다시 설정
          </button>
        )}

        {routes && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/95 rounded-lg px-3 py-2 shadow-md pointer-events-none">
            {Object.entries(ROUTE_STYLES).map(([key, style]) => (
              <div key={key} className="flex items-center gap-2 text-xs text-gray-700 mb-0.5 last:mb-0">
                <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: style.color }} />
                <span>{style.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 패널 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">추천 경로 비교</h1>
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
          <p className="text-gray-400 text-sm mt-6 text-center">
            지도에서 출발지와 도착지를 선택하면 경로를 추천해 드립니다.
          </p>
        ) : isLoading ? (
          <p className="text-gray-500 mt-4">경로를 불러오는 중...</p>
        ) : error ? (
          <div className="mt-4">
            <p className="text-red-500 mb-2">{error}</p>
            <button onClick={handleReset} className="text-sm text-[#2563EB] underline">
              다시 설정
            </button>
          </div>
        ) : routes ? (
          <>
            {/* 추천 배너 + 컨텍스트 태그 통합 */}
            {recommendation && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <span className="flex-1">{recommendation}</span>
                {contextTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {warnings.length > 0 && (
              <div className="mb-3 flex flex-col gap-1.5">
                {warnings.map((w, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
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
                    className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
                      isSelected
                        ? "border-[#2563EB] ring-2 ring-[#2563EB]/20"
                        : "border-gray-200"
                    }`}
                  >
                    {/* 상단 컬러 띠 */}
                    <div className={`h-[3px] w-full ${accent.bar}`} />

                    <div className="p-4">
                      {/* 헤더 */}
                      <div className="mb-1 flex items-center gap-2">
                        <Icon className={`text-base ${accent.icon}`} />
                        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                      </div>
                      <p className="mb-3 text-xs text-gray-400">
                        {key !== "custom" && route?.description
                          ? route.description
                          : accent.desc}
                      </p>

                      {/* 이동수단 토글 */}
                      {key !== "custom" && (
                        <>
                          <div className="mb-3 flex overflow-hidden rounded-lg border border-gray-200">
                            {MODES.map((m, i) => (
                              <button
                                key={m.key}
                                onClick={() => setTransportMode(m.key)}
                                className={`flex-1 py-1.5 text-xs transition-colors ${
                                  i > 0 ? "border-l border-gray-200" : ""
                                } ${
                                  transportMode === m.key
                                    ? "bg-[#2563EB] text-white"
                                    : "text-gray-400 hover:bg-gray-50"
                                }`}
                              >
                                {m.label}
                              </button>
                            ))}
                          </div>

                          <div className="mb-3 text-sm font-semibold text-gray-800">
                            {route
                              ? calcTravelTime(route, transportMode) != null
                                ? `약 ${calcTravelTime(route, transportMode)}분`
                                : "정보 없음"
                              : "—"}
                            {route?.distance != null && (
                              <span className="ml-2 text-xs font-normal text-gray-400">
                                · {formatDistance(route.distance)}
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {/* 커스텀 경로 안내 */}
                      {key === "custom" && (
                        <p className="mb-3 text-sm text-gray-300">아직 경로 없음</p>
                      )}

                      {/* 버튼 */}
                      <div className="flex gap-2">
                        {key === "custom" ? (
                          <button
                            onClick={() => navigate("/draw")}
                            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
                          >
                            경로 그리기
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSelectRoute(key)}
                              className="flex-1 rounded-lg bg-[#2563EB] py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                              {isSelected ? "✓ 선택됨" : "이 경로 선택"}
                            </button>
                            <button
                              onClick={openKakaoNavi}
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
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
