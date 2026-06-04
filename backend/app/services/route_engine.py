import httpx
from app.config import KAKAO_REST_API_KEY

CONTEXT_WAYPOINTS = {
    # 자외선_높음(UV 6~7): 중앙로 지하상가 입구→출구 경유
    "자외선_높음": [
        {"lat": 36.3270, "lng": 127.4218, "label": "중앙로 지하상가 입구", "type": "indoor"},
        {"lat": 36.3262, "lng": 127.4195, "label": "중앙로 지하상가 출구", "type": "indoor"},
    ],
    # 자외선_매우높음(UV >= 8): 갤러리아 + 중앙로 지하상가 경유
    "자외선_매우높음": [
        {"lat": 36.3519, "lng": 127.3782, "label": "갤러리아 타임월드", "type": "indoor"},
        {"lat": 36.3271, "lng": 127.4215, "label": "중앙로 지하상가", "type": "indoor"},
    ],
    # 비/눈: 실내 대피
    "비": [
        {"lat": 36.3519, "lng": 127.3782, "label": "갤러리아 타임월드", "type": "indoor"},
        {"lat": 36.3271, "lng": 127.4215, "label": "중앙로 지하상가", "type": "indoor"},
    ],
    "눈": [
        {"lat": 36.3519, "lng": 127.3782, "label": "갤러리아 타임월드", "type": "indoor"},
        {"lat": 36.3271, "lng": 127.4215, "label": "중앙로 지하상가", "type": "indoor"},
    ],
    # 야간: 대로변 4차선 이상 중심
    "야간": [
        {"lat": 36.3284, "lng": 127.4282, "label": "으능정이 문화의거리", "type": "lit_road"},
        {"lat": 36.3277, "lng": 127.4273, "label": "성심당 본점 일대", "type": "lit_road"},
    ],
}


def get_waypoints_for_tags(context_tags: list) -> list:
    waypoints = []
    for tag in context_tags:
        if tag in CONTEXT_WAYPOINTS:
            waypoints.extend(CONTEXT_WAYPOINTS[tag])
    return waypoints


async def fetch_kakao_route(
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float,
    waypoints: list = None,
    priority: str = "RECOMMEND"
) -> list:
    url = "https://apis-navi.kakaomobility.com/v1/directions"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {
        "origin": f"{start_lng},{start_lat}",
        "destination": f"{end_lng},{end_lat}",
        "priority": priority,
    }
    if waypoints:
        # Kakao Mobility는 경유지 최대 3개, lng,lat 순서
        wps = waypoints[:2]  # 입구+출구 쌍 전달
        params["waypoints"] = "|".join([f"{wp['lng']},{wp['lat']}" for wp in wps])

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=headers, params=params)
            data = resp.json()

        routes = data.get("routes", [])
        if not routes or routes[0].get("result_code") != 0:
            return []

        # vertexes는 [lng, lat, lng, lat, ...] 순서
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
    waypoints = get_waypoints_for_tags(context_tags)

    # 최단경로: 시간 최적화
    normal_polyline = await fetch_kakao_route(
        start_lat, start_lng, end_lat, end_lng, priority="TIME"
    )

    # 상황 인식 경로: 그늘/공원 경유지 포함
    uv_waypoints = [wp for wp in waypoints if wp.get("type") in ("indoor", "lit_road", "shelter")]
    context_polyline = await fetch_kakao_route(
        start_lat, start_lng, end_lat, end_lng,
        waypoints=uv_waypoints[:1] if uv_waypoints else None,
        priority="RECOMMEND",
    )

    route_option = "bigroad" if "야간" in context_tags else "normal"

    return {
        "normal": {
            "type": "normal",
            "description": "기본 최단 경로",
            "waypoints": [],
            "route_option": "normal",
            "polyline": normal_polyline,
        },
        "context": {
            "type": "context",
            "description": "상황 인식 경로",
            "waypoints": waypoints,
            "route_option": route_option,
            "context_tags": context_tags,
            "polyline": context_polyline,
        },
    }
