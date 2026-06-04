# 상황 태그별 waypoint 매핑 (대전 지역 기준)
CONTEXT_WAYPOINTS = {
    "비": [
        {"lat": 36.3504, "lng": 127.3845, "label": "대전 지하상가 입구", "type": "shelter"},
        {"lat": 36.3549, "lng": 127.3788, "label": "갤러리아 타임월드 연결통로", "type": "shelter"},
    ],
    "눈": [
        {"lat": 36.3504, "lng": 127.3845, "label": "대전 지하상가 입구", "type": "shelter"},
    ],
    "자외선_높음": [
        {"lat": 36.3517, "lng": 127.3845, "label": "은행동 가로수길 그늘 구간", "type": "shade"},
    ],
    "자외선_매우높음": [
        {"lat": 36.3504, "lng": 127.3845, "label": "대전 지하상가 입구", "type": "shelter"},
        {"lat": 36.3549, "lng": 127.3788, "label": "실내 연결통로", "type": "shelter"},
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