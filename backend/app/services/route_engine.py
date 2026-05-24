# 상황 태그별 waypoint 매핑 (실제 데이터는 추후 DB에서 가져올 것)
CONTEXT_WAYPOINTS = {
    "비": [
        {"lat": 36.6424, "lng": 127.4890, "label": "청주 지하상가 입구", "type": "shelter"},
        {"lat": 36.6389, "lng": 127.4866, "label": "롯데백화점 연결통로", "type": "shelter"},
    ],
    "눈": [
        {"lat": 36.6424, "lng": 127.4890, "label": "청주 지하상가 입구", "type": "shelter"},
    ],
    "자외선_높음": [
        {"lat": 36.6412, "lng": 127.4897, "label": "가로수길 그늘 구간", "type": "shade"},
    ],
    "자외선_매우높음": [
        {"lat": 36.6424, "lng": 127.4890, "label": "청주 지하상가 입구", "type": "shelter"},
        {"lat": 36.6412, "lng": 127.4897, "label": "실내 연결통로", "type": "shelter"},
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
    """
    상황 태그 기반으로 일반 경로 vs 상황 인식 경로 반환
    실제 Kakao API 연동 전까지는 구조만 반환
    """
    waypoints = get_waypoints_for_tags(context_tags)

    # 야간이면 큰 도로 우선 옵션 설정
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