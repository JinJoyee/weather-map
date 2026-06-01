import { api } from "./client";

/**
 * 추천 경로 데이터를 백엔드에서 가져옵니다.
 * 백엔드: GET /api/route/recommend
 *
 * @param {number} startLat - 출발지 위도
 * @param {number} startLng - 출발지 경도
 * @param {number} endLat - 도착지 위도
 * @param {number} endLng - 도착지 경도
 *
 * @returns {Promise<{
 *   routes: object,
 *   context_tags: string[],
 *   recommendation: string
 * }>}
 */

export const fetchRouteRecommend = async (
  startLat,
  startLng,
  endLat,
  endLng
) => {
  const { data } = await api.get("/api/route/recommend", {
    params: {
      startLat,
      startLng,
      endLat,
      endLng,
    },
  });

  return data;
};