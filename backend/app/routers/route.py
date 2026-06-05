from fastapi import APIRouter
from datetime import datetime
from app.services.weather_service import get_weather, calculate_sunrise_sunset
from app.services.context_engine import get_context_tags, get_context_scores, get_context_warnings
from app.services.route_engine import build_routes

router = APIRouter(prefix="/api/route", tags=["route"])


@router.get("/recommend")
async def recommend_route(start_lat: float, start_lng: float, end_lat: float, end_lng: float):
    # 1. 날씨 + UV 데이터
    weather_data = await get_weather(start_lat, start_lng)
    uv_index = weather_data["uv_index"]

    # 2. 현재 시각 + 일출/일몰
    current_time = datetime.now().hour
    sunrise, sunset = calculate_sunrise_sunset(start_lat, start_lng)

    # 3. 상황 태그
    context_tags = get_context_tags(weather_data, uv_index, current_time, sunset, sunrise)

    # 4. 가중치 점수 + 경고 메시지
    scores = get_context_scores(context_tags, uv_index, weather_data)
    warnings = get_context_warnings(context_tags, uv_index, weather_data)

    # 5. 경로 생성 (가중치 전달)
    routes = await build_routes(context_tags, start_lat, start_lng, end_lat, end_lng, scores)

    # 6. 대표 추천 문자열 (가중치 dominant 기준)
    dominant = max(scores, key=scores.get)
    if scores[dominant] == 0:
        recommendation = "일반 경로 추천 — 날씨가 좋습니다!"
    elif dominant == "shade":
        recommendation = "그늘 경로 추천 — 자외선이 높아 공원·그늘 경유 경로를 안내합니다."
    elif dominant == "indoor":
        recommendation = "실내 이동 권장 — 자외선 또는 강수가 심합니다."
    else:  # safety
        if "눈" in context_tags:
            recommendation = "안전 경로 추천 — 눈길 미끄럼 주의 경로를 안내합니다."
        elif "야간" in context_tags:
            recommendation = "야간 경로 추천 — 밝은 거리 위주의 경로를 안내합니다."
        else:
            recommendation = "안전 경로 추천 — 비 또는 결빙 구간 주의."

    return {
        "start": {"lat": start_lat, "lng": start_lng},
        "end": {"lat": end_lat, "lng": end_lng},
        "context_tags": context_tags,
        "scores": scores,
        "warnings": warnings,
        "weather": weather_data,
        "recommendation": recommendation,
        "routes": routes,
    }
