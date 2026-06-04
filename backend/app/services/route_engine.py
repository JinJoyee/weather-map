import httpx
import math
from app.config import KAKAO_REST_API_KEY

# 정적 경유지 (야간 + 테스트/폴백용)
CONTEXT_WAYPOINTS = {
    "야간": [
        {"lat": 36.3284, "lng": 127.4282, "label": "으능정이 문화의거리", "type": "lit_road"},
        {"lat": 36.3277, "lng": 127.4273, "label": "성심당 본점 일대", "type": "lit_road"},
    ],
    "비": [
        {"lat": 36.3519, "lng": 127.3782, "label": "갤러리아 타임월드", "type": "shelter"},
        {"lat": 36.3271, "lng": 127.4215, "label": "중앙로 지하상가", "type": "shelter"},
    ],
    "눈": [
        {"lat": 36.3519, "lng": 127.3782, "label": "갤러리아 타임월드", "type": "shelter"},
        {"lat": 36.3271, "lng": 127.4215, "label": "중앙로 지하상가", "type": "shelter"},
    ],
    "자외선_높음": [
        {"lat": 36.3689, "lng": 127.3894, "label": "한밭수목원", "type": "shade"},
    ],
    "자외선_매우높음": [
        {"lat": 36.3271, "lng": 127.4215, "label": "중앙로 지하상가", "type": "shelter"},
    ],
    "주간": [
        {"lat": 36.3041, "lng": 127.4168, "label": "보문산공원", "type": "park"},
        {"lat": 36.3689, "lng": 127.3894, "label": "한밭수목원", "type": "park"},
    ],
}


def get_waypoints_for_tags(context_tags: list) -> list:
    waypoints = []
    for tag in context_tags:
        if tag in CONTEXT_WAYPOINTS:
            waypoints.extend(CONTEXT_WAYPOINTS[tag])
    return waypoints


def _haversine_m(lat1, lng1, lat2, lng2) -> float:
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


async def _search_place_near(lat: float, lng: float, keyword: str, radius: int) -> dict | None:
    """카카오 로컬 API로 주변 장소를 검색해 경유지 반환."""
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {
        "query": keyword,
        "x": str(lng),
        "y": str(lat),
        "radius": radius,
        "size": 1,
        "sort": "distance",
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers=headers, params=params)
            docs = resp.json().get("documents", [])
        if docs:
            return {
                "lat": float(docs[0]["y"]),
                "lng": float(docs[0]["x"]),
                "label": docs[0]["place_name"],
                "type": "dynamic",
            }
    except Exception:
        pass
    return None


async def _get_context_waypoint(
    tags: list,
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float,
) -> list:
    """
    출발지-도착지 중간점 주변에서 상황에 맞는 경유지를 동적으로 검색.
    - 자외선_매우높음 / 비 / 눈 : 가까운 지하상가·실내 시설
    - 자외선_높음 : 가까운 공원
    - 야간 : 고정 밝은 거리 (정적 폴백)
    """
    mid_lat = (start_lat + end_lat) / 2
    mid_lng = (start_lng + end_lng) / 2
    dist_m = _haversine_m(start_lat, start_lng, end_lat, end_lng)
    radius = int(min(max(dist_m / 2, 1000), 3000))

    if "자외선_매우높음" in tags or "비" in tags or "눈" in tags:
        wp = await _search_place_near(mid_lat, mid_lng, "지하상가", radius)
        if not wp:
            wp = await _search_place_near(mid_lat, mid_lng, "쇼핑몰", radius)
        return [wp] if wp else CONTEXT_WAYPOINTS.get("비", [])[:1]

    if "자외선_높음" in tags:
        wp = await _search_place_near(mid_lat, mid_lng, "공원", radius)
        if not wp:
            wp = await _search_place_near(mid_lat, mid_lng, "수목원", radius)
        return [wp] if wp else CONTEXT_WAYPOINTS.get("자외선_높음", [])[:1]

    if "야간" in tags:
        return CONTEXT_WAYPOINTS["야간"][:1]

    return []


async def fetch_kakao_route(
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float,
    waypoints: list = None,
    priority: str = "RECOMMEND",
) -> list:
    url = "https://apis-navi.kakaomobility.com/v1/directions"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {
        "origin": f"{start_lng},{start_lat}",
        "destination": f"{end_lng},{end_lat}",
        "priority": priority,
    }
    if waypoints:
        params["waypoints"] = "|".join(
            [f"{wp['lng']},{wp['lat']}" for wp in waypoints[:1]]
        )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=headers, params=params)
            data = resp.json()

        routes = data.get("routes", [])
        if not routes or routes[0].get("result_code") != 0:
            return []

        # vertexes: [lng, lat, lng, lat, ...]
        polyline = []
        for section in routes[0]["sections"]:
            for road in section["roads"]:
                vx = road["vertexes"]
                for i in range(0, len(vx) - 1, 2):
                    polyline.append({"lat": vx[i + 1], "lng": vx[i]})
        return polyline
    except Exception:
        return []


async def build_routes(
    context_tags: list,
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float,
) -> dict:
    # 상황별 경유지 (동적 검색 우선, 폴백 정적)
    context_wps = await _get_context_waypoint(
        context_tags, start_lat, start_lng, end_lat, end_lng
    )

    # 최단 경로 (시간 기준)
    normal_polyline = await fetch_kakao_route(
        start_lat, start_lng, end_lat, end_lng, priority="TIME"
    )

    # 날씨 최적 경로 (경유지 포함)
    context_polyline = await fetch_kakao_route(
        start_lat, start_lng, end_lat, end_lng,
        waypoints=context_wps if context_wps else None,
        priority="RECOMMEND",
    )

    route_option = "bigroad" if "야간" in context_tags else "normal"

    # 경로 설명 동적 생성
    wp_label = context_wps[0]["label"] if context_wps else ""
    if "자외선_매우높음" in context_tags:
        context_desc = f"실내 경유 경로{f' ({wp_label})' if wp_label else ''}"
    elif "비" in context_tags or "눈" in context_tags:
        context_desc = f"비/눈 회피 실내 경로{f' ({wp_label})' if wp_label else ''}"
    elif "자외선_높음" in context_tags:
        context_desc = f"자외선 회피 그늘 경로{f' ({wp_label})' if wp_label else ''}"
    elif "야간" in context_tags:
        context_desc = f"야간 밝은 거리 경로{f' ({wp_label})' if wp_label else ''}"
    else:
        context_desc = "날씨 최적 경로"

    return {
        "normal": {
            "type": "normal",
            "description": "시간 최단 경로 (카카오 내비)",
            "waypoints": [],
            "route_option": "normal",
            "polyline": normal_polyline,
        },
        "context": {
            "type": "context",
            "description": context_desc,
            "waypoints": context_wps,
            "route_option": route_option,
            "context_tags": context_tags,
            "polyline": context_polyline,
        },
    }
