import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaSun, FaStar } from "react-icons/fa";
import { fetchRouteRecommend } from "../../api/route";

const START_LAT = 36.3504;
const START_LNG = 127.3845;
const END_LAT = 36.3623;
const END_LNG = 127.3568;

const ROUTE_STYLES = {
  normal:  { color: "#3B82F6" },
  context: { color: "#F59E0B" },
};

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

    Object.entries(ROUTE_STYLES).forEach(([key, style]) => {
      const polylineData = routes[key]?.polyline;
      if (!polylineData?.length) return;

      const path = polylineData.map((p) => new kakao.maps.LatLng(p.lat, p.lng));
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
      title: "자외선 회피 경로",
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
      <div ref={mapRef} className="w-full" style={{ height: "45vh" }} />

      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="mb-2 text-xl font-bold">추천 경로 비교</h1>

        {isLoading ? (
          <p className="text-gray-500">경로를 불러오는 중...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {recommendation && (
              <div className="mb-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">
                {recommendation}
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
                          onClick={() => navigate("/custom")}
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
        )}
      </div>
    </div>
  );
}
