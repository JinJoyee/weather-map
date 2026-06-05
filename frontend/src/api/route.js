import { api } from "./client";

const MOCK_MODE = import.meta.env.VITE_MOCK_ROUTES === "true";

const MOCK_DATA = {
  routes: {
    normal: {
      polyline: [
        { lat: 36.3322, lng: 127.4342 },
        { lat: 36.3400, lng: 127.4100 },
        { lat: 36.3500, lng: 127.3800 },
        { lat: 36.3600, lng: 127.3600 },
        { lat: 36.3681, lng: 127.3395 },
      ],
      foot_polyline: [
        { lat: 36.3322, lng: 127.4342 },
        { lat: 36.3380, lng: 127.4080 },
        { lat: 36.3470, lng: 127.3820 },
        { lat: 36.3590, lng: 127.3580 },
        { lat: 36.3681, lng: 127.3395 },
      ],
      distance: 7200,
      foot_distance: 7400,
      duration: 900,
      description: "카카오 내비 최단 경로 (목 데이터)",
    },
    context: {
      polyline: [
        { lat: 36.3322, lng: 127.4342 },
        { lat: 36.3360, lng: 127.4050 },
        { lat: 36.3440, lng: 127.3870 },
        { lat: 36.3540, lng: 127.3680 },
        { lat: 36.3640, lng: 127.3500 },
        { lat: 36.3681, lng: 127.3395 },
      ],
      foot_polyline: [
        { lat: 36.3322, lng: 127.4342 },
        { lat: 36.3360, lng: 127.4050 },
        { lat: 36.3440, lng: 127.3870 },
        { lat: 36.3540, lng: 127.3680 },
        { lat: 36.3640, lng: 127.3500 },
        { lat: 36.3681, lng: 127.3395 },
      ],
      distance: 7800,
      foot_distance: 7800,
      duration: 980,
      description: "그늘길 우선 날씨 최적 경로 (목 데이터)",
    },
  },
  recommendation: "맑은 날씨입니다. 최단 경로를 추천합니다.",
  context_tags: ["맑음", "UV보통"],
  weather: {
    temperature: 22,
    uv_index: 3,
    rain_probability: 5,
    weather: "맑음",
  },
  warnings: [],
};

export const fetchRouteRecommend = async (startLat, startLng, endLat, endLng) => {
  if (MOCK_MODE) return MOCK_DATA;

  const { data } = await api.get("/api/route/recommend", {
    params: {
      start_lat: startLat,
      start_lng: startLng,
      end_lat: endLat,
      end_lng: endLng,
    },
  });
  return data;
};