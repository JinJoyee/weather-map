# 상황 태그별 waypoint 매핑 (대전 실제 좌표 기준)
CONTEXT_WAYPOINTS = {
    "비": [
        {"lat": 36.3519, "lng": 127.3782, "label": "갤러리아 타임월드", "type": "shelter"},
        {"lat": 36.3271, "lng": 127.4215, "label": "중앙로 지하상가", "type": "shelter"},
    ],
    "눈": [
        {"lat": 36.3519, "lng": 127.3782, "label": "갤러리아 타임월드", "type": "shelter"},
        {"lat": 36.3271, "lng": 127.4215, "label": "중앙로 지하상가", "type": "shelter"},
    ],
    "야간": [
        {"lat": 36.3284, "lng": 127.4282, "label": "으능정이 문화의거리", "type": "lit_road"},
        {"lat": 36.3277, "lng": 127.4273, "label": "성심당 본점 일대", "type": "lit_road"},
    ],
    "자외선_높음": [
        {"lat": 36.3689, "lng": 127.3894, "label": "한밭수목원", "type": "shade"},
        {"lat": 36.3277, "lng": 127.4273, "label": "성심당 본점 일대", "type": "shade"},
    ],
    "자외선_매우높음": [
        {"lat": 36.3519, "lng": 127.3782, "label": "갤러리아 타임월드", "type": "shelter"},
        {"lat": 36.3271, "lng": 127.4215, "label": "중앙로 지하상가", "type": "shelter"},
    ],
    "주간": [
        {"lat": 36.3041, "lng": 127.4168, "label": "보문산공원", "type": "park"},
        {"lat": 36.3689, "lng": 127.3894, "label": "한밭수목원", "type": "park"},
    ],
}


def get_waypoints_for_tags(context_tags: list) -> list:
    """상황 태그 기반으로 waypoint 목록 반환"""
    waypoints = []
    for tag in context_tags:
        if tag in CONTEXT_WAYPOINTS:
            waypoints.extend(CONTEXT_WAYPOINTS[tag])
    return waypoints


def build_routes(context_tags: list) -> dict:
    waypoints = get_waypoints_for_tags(context_tags)

    route_option = "normal"
    if "야간" in context_tags:
        route_option = "bigroad"

    normal_route = {
        "type": "normal",
        "description": "기본 최단 경로",
        "waypoints": [],
        "route_option": "normal"
    }

    context_route = {
        "type": "context",
        "description": "상황 인식 경로",
        "waypoints": waypoints,
        "route_option": route_option,
        "context_tags": context_tags
    }

    return {
        "normal": normal_route,
        "context": context_route
    }