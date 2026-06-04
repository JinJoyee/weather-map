import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaSun, FaStar } from "react-icons/fa";
import { fetchRouteRecommend } from "../../api/route";

const START_LAT = 36.3504;
const START_LNG = 127.3845;
const END_LAT = 36.3623;
const END_LNG = 127.3568;

const CARDS = [
  {
    key: "normal",
    title: "최단 경로",
    icon: FaClock,
    accentColor: "#2563EB",
    iconClass: "bg-blue-100 text-primary",
  },
  {
    key: "context",
    title: "자외선 회피 경로",
    icon: FaSun,
    accentColor: "#F59E0B",
    iconClass: "bg-amber-100 text-amber-600",
  },
  {
    key: "custom",
    title: "커스텀 경로",
    icon: FaStar,
    accentColor: "#10B981",
    iconClass: "bg-emerald-100 text-emerald-600",
  },
];

export default function RouteCompare() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const polylinesRef = useRef({});

  const [routes, setRoutes] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [contextTags, setContextTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    const center = new kakao.maps.LatLng(
      (START_LAT + END_LAT) / 2,
      (START_LNG + END_LNG) / 2
    );
    mapInstance.current = new kakao.maps.Map(mapRef.current, { center, level: 6 });

    new kakao.maps.Marker({
      position: new kakao.maps.LatLng(START_LAT, START_LNG),
      map: mapInstance.current,
    });
    new kakao.maps.Marker({
      position: new kakao.maps.LatLng(END_LAT, END_LNG),
      map: mapInstance.current,
    });
  }, []);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchRouteRecommend(START_LAT, START_LNG, END_LAT, END_LNG);
        setRoutes(data.routes);
        setRecommendation(data.recommendation);
        setContextTags(data.context_tags || []);
      } catch {
        setRoutes(null);
        setRecommendation("");
        setContextTags([]);
        setError("경로를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    loadRoutes();
  }, []);

  useEffect(() => {
    const { kakao } = window;
    if (!routes || !mapInstance.current || !kakao) return;

    Object.values(polylinesRef.current).forEach((pl) => pl.setMap(null));
    polylinesRef.current = {};

    const colors = { normal: "#2563EB", context: "#F59E0B" };
    Object.entries(colors).forEach(([key, color]) => {
      const polylineData = routes[key]?.polyline;
      if (!polylineData?.length) return;

      const path = polylineData.map((p) => new kakao.maps.LatLng(p.lat, p.lng));
      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 5,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
      polyline.setMap(mapInstance.current);
      polylinesRef.current[key] = polyline;
    });
  }, [routes]);

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
    const url = `https://map.kakao.com/link/from/출발지,${START_LAT},${START_LNG}/to/목적지,${END_LAT},${END_LNG}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col h-screen bg-neutral">
      {/* 지도 영역 */}
      <div className="relative w-full shrink-0" style={{ height: "45vh" }}>
        <div ref={mapRef} className="w-full h-full" />
        <div className="absolute bottom-3 left-3 glass-panel px-3 py-2 text-xs flex gap-4 z-10">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
            출발: 대전 중심부
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
            도착: 목적지
          </span>
        </div>
      </div>

      {/* 카드 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h1 className="mb-3 text-xl font-bold font-[Manrope] text-secondary">
          추천 경로 비교
        </h1>

        {isLoading ? (
          <div className="flex items-center gap-2 text-secondary mt-8 justify-center">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm font-medium">경로를 불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="glass-panel p-4 flex items-center gap-3 text-red-600 mt-4">
            <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : (
          <>
            {recommendation && (
              <div className="mb-3 rounded-lvl2 bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-700 font-medium">
                {recommendation}
              </div>
            )}

            {contextTags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {contextTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-tertiary/20 text-secondary px-3 py-1 text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row">
              {CARDS.map((card) => {
                const Icon = card.icon;
                const isSelected = selectedRoute === card.key;
                const route = routes?.[card.key];

                return (
                  <div
                    key={card.key}
                    className={`flex-1 glass-panel p-4 overflow-hidden transition-all duration-200 ${
                      isSelected ? "ring-2 ring-primary ring-offset-1" : ""
                    }`}
                  >
                    {/* 상단 accent 바 */}
                    <div
                      className="h-1 -mx-4 -mt-4 mb-4 rounded-t-lvl2"
                      style={{ background: card.accentColor }}
                    />

                    <div className="mb-3 flex items-center gap-3">
                      <span className={`rounded-full p-2 ${card.iconClass}`}>
                        <Icon size={16} />
                      </span>
                      <h2 className="text-base font-bold font-[Manrope] text-secondary">
                        {card.title}
                      </h2>
                    </div>

                    <p className="mb-1 text-sm text-gray-600">
                      {card.key === "custom"
                        ? "직접 그린 나만의 경로"
                        : (route?.description ?? "설명 없음")}
                    </p>

                    {card.key !== "custom" && (
                      <p className="mb-4 text-xs text-gray-400">
                        경유지 {route?.waypoints?.length ?? 0}개
                        {route?.polyline?.length
                          ? ` · ${route.polyline.length}개 좌표`
                          : " · 경로 미수신"}
                      </p>
                    )}
                    {card.key === "custom" && <div className="mb-4" />}

                    <div className="flex flex-wrap gap-2">
                      {card.key === "custom" ? (
                        <button
                          onClick={() => navigate("/custom")}
                          className="bg-primary text-white text-sm font-semibold rounded-lvl2 px-4 py-2 hover:scale-[1.02] transition-all"
                        >
                          경로 그리기
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSelectRoute(card.key)}
                            className="bg-primary text-white text-sm font-semibold rounded-lvl2 px-4 py-2 hover:scale-[1.02] transition-all"
                          >
                            {isSelected ? "✓ 선택됨" : "이 경로 선택"}
                          </button>
                          <button
                            onClick={openKakaoNavi}
                            className="bg-tertiary text-secondary text-sm font-semibold rounded-lvl2 px-4 py-2 hover:scale-[1.02] transition-all"
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
        )}
      </div>
    </div>
  );
}
