import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaSun, FaStar } from "react-icons/fa";
import { fetchRouteRecommend } from "../../api/route";

const ROUTE_STYLES = {
  normal:  { color: "#3B82F6" },
  context: { color: "#F59E0B" },
};

const DEFAULT_CENTER = { lat: 36.3504, lng: 127.3845 };

export default function RouteCompare() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const polylinesRef = useRef({});
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const pickStepRef = useRef(0); // 0=출발지 선택 대기, 1=도착지 선택 대기, 2=완료

  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [contextTags, setContextTags] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [scores, setScores] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const navigate = useNavigate();

  // 지도 초기화 + 클릭 이벤트 등록 (최초 1회)
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

  // 출발지/도착지 모두 설정되면 경로 조회
  useEffect(() => {
    if (!startPos || !endPos) return;

    const loadRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setRoutes(null);
        const data = await fetchRouteRecommend(
          startPos.lat, startPos.lng,
          endPos.lat, endPos.lng
        );
        setRoutes(data.routes);
        setRecommendation(data.recommendation);
        setContextTags(data.context_tags || []);
        setWarnings(data.warnings || []);
        setScores(data.scores || null);
      } catch {
        setError("경로를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    loadRoutes();
  }, [startPos, endPos]);

  // 폴리라인 그리기
  useEffect(() => {
    const { kakao } = window;
    if (!routes || !mapInstance.current || !kakao) return;

    Object.values(polylinesRef.current).forEach((pl) => pl.setMap(null));
    polylinesRef.current = {};

    const bounds = new kakao.maps.LatLngBounds();
    let hasPolyline = false;

    Object.entries(ROUTE_STYLES).forEach(([key, style]) => {
      const polylineData = routes[key]?.polyline;
      if (!polylineData?.length) return;

      const path = polylineData.map((p) => new kakao.maps.LatLng(p.lat, p.lng));
      path.forEach((p) => bounds.extend(p));
      hasPolyline = true;

      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 5,
        strokeColor: style.color,
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
      polyline.setMap(mapInstance.current);
      polylinesRef.current[key] = polyline;
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
    if (endMarkerRef.current) endMarkerRef.current.setMap(null);
    startMarkerRef.current = null;
    endMarkerRef.current = null;
    pickStepRef.current = 0;

    Object.values(polylinesRef.current).forEach((pl) => pl.setMap(null));
    polylinesRef.current = {};

    setStartPos(null);
    setEndPos(null);
    setRoutes(null);
    setRecommendation("");
    setContextTags([]);
    setWarnings([]);
    setScores(null);
    setError(null);
    setSelectedRoute(null);
    setIsLoading(false);
  };

  const handleSelectRoute = (key) => {
    setSelectedRoute(key);
    Object.entries(polylinesRef.current).forEach(([k, pl]) => {
      pl.setOptions({
        strokeWeight: k === key ? 9 : 3,
        strokeOpacity: k === key ? 1.0 : 0.3,
      });
    });
  };

  const openKakaoNavi = () => {
    if (!startPos || !endPos) return;
    const url = `https://map.kakao.com/link/from/출발지,${startPos.lat},${startPos.lng}/to/목적지,${endPos.lat},${endPos.lng}`;
    window.open(url, "_blank");
  };

  const cards = [
    {
      key: "normal",
      title: "최단 경로",
      icon: FaClock,
      cardClass: "border-blue-400 bg-blue-50",
      btnClass: "bg-blue-500 hover:bg-blue-600",
    },
    {
      key: "context",
      title: "날씨 최적 경로",
      icon: FaSun,
      cardClass: "border-yellow-400 bg-yellow-50",
      btnClass: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      key: "custom",
      title: "커스텀 경로",
      icon: FaStar,
      cardClass: "border-green-400 bg-green-50",
      btnClass: "bg-green-500 hover:bg-green-600",
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* 지도 영역 */}
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
      </div>

      {/* 하단 패널 */}
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="mb-2 text-xl font-bold">추천 경로 비교</h1>

        {!startPos || !endPos ? (
          <p className="text-gray-400 text-sm mt-6 text-center">
            지도에서 출발지와 도착지를 선택하면 경로를 추천해 드립니다.
          </p>
        ) : isLoading ? (
          <p className="text-gray-500 mt-4">경로를 불러오는 중...</p>
        ) : error ? (
          <div className="mt-4">
            <p className="text-red-500 mb-2">{error}</p>
            <button onClick={handleReset} className="text-sm text-primary underline">
              다시 설정
            </button>
          </div>
        ) : routes ? (
          <>
            {recommendation && (
              <div className="mb-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700 font-medium">
                {recommendation}
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

            {scores && (scores.shade > 0 || scores.indoor > 0 || scores.safety > 0) && (
              <div className="mb-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                <p className="font-semibold mb-1.5 text-gray-700">경로 전략 가중치</p>
                <div className="flex flex-col gap-1">
                  {[
                    { label: "그늘 경로", key: "shade", color: "bg-yellow-400" },
                    { label: "실내 권장", key: "indoor", color: "bg-blue-400" },
                    { label: "안전 경로", key: "safety", color: "bg-red-400" },
                  ].map(({ label, key, color }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-16 shrink-0">{label}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`${color} h-1.5 rounded-full transition-all`}
                          style={{ width: `${Math.min((scores[key] / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="w-6 text-right">{scores[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contextTags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {contextTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-200 px-3 py-1 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row">
              {cards.map((card) => {
                const Icon = card.icon;
                const isSelected = selectedRoute === card.key;
                const route = routes?.[card.key];

                return (
                  <div
                    key={card.key}
                    className={`flex-1 rounded-lg border-2 p-4 shadow transition ${card.cardClass} ${
                      isSelected ? "ring-2 ring-offset-1 ring-gray-500" : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Icon size={18} />
                      <h2 className="text-base font-semibold">{card.title}</h2>
                    </div>

                    <p className="mb-1 text-sm text-gray-700">
                      {card.key === "custom"
                        ? "직접 그린 나만의 경로"
                        : (route?.description ?? "설명 없음")}
                    </p>

                    {card.key !== "custom" && (
                      <p className="mb-3 text-xs text-gray-500">
                        경유지 수: {route?.waypoints?.length ?? 0}
                        {route?.polyline?.length
                          ? ` · 경로 좌표 ${route.polyline.length}점`
                          : " · 경로 없음"}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {card.key === "custom" ? (
                        <button
                          onClick={() => navigate("/draw")}
                          className={`rounded px-3 py-1.5 text-sm text-white transition ${card.btnClass}`}
                        >
                          경로 그리기
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSelectRoute(card.key)}
                            className={`rounded px-3 py-1.5 text-sm text-white transition ${card.btnClass}`}
                          >
                            {isSelected ? "✓ 선택됨" : "이 경로 선택"}
                          </button>
                          <button
                            onClick={openKakaoNavi}
                            className="rounded bg-yellow-300 px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-yellow-400 transition"
                          >
                            카카오 내비
                          </button>
                        </>
                      )}
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
