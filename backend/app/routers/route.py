from fastapi import APIRouter
from datetime import datetime
from app.services.weather_service import get_weather, get_uv_index, calculate_sunrise_sunset
from app.services.context_engine import get_context_tags
from app.services.route_engine import build_routes

router = APIRouter(prefix="/api/route", tags=["route"])

@router.get("/recommend")
async def recommend_route(start_lat: float, start_lng: float, end_lat: float, end_lng: float):
    # 1. 날씨 데이터 가져오기
    weather_data = await get_weather(start_lat, start_lng)
    
    # 2. 자외선 지수 실제 API로 가져오기
    uv_index = await get_uv_index(start_lat, start_lng)
    weather_data["uv_index"] = uv_index  # 날씨 데이터에 반영

    # 3. 현재 시각 + 일출/일몰 (고정값)
    current_time = datetime.now().hour
    
    # 일출/일몰 계산
    sunrise, sunset = calculate_sunrise_sunset(start_lat, start_lng)

    # 4. 상황 태그 판단
    context_tags = get_context_tags(weather_data, uv_index, current_time, sunset, sunrise)

    # 5. 상황별 경로 생성
    routes = build_routes(context_tags)

    # 6. 추천 문자열 결정
    if "비" in context_tags or "자외선_매우높음" in context_tags:
        recommendation = "실내 경로 추천 — 비 또는 자외선이 강해 실내 이동을 권장합니다."
    elif "눈" in context_tags:
        recommendation = "안전 경로 추천 — 눈이 내려 미끄럼 주의 경로를 안내합니다."
    elif "야간" in context_tags:
        recommendation = "야간 경로 추천 — 밝은 거리 위주의 경로를 안내합니다."
    elif "자외선_높음" in context_tags:
        recommendation = "그늘 경로 추천 — 자외선이 높아 그늘진 경로를 안내합니다."
    else:
        recommendation = "일반 경로 추천 — 날씨가 좋습니다!"

    return {
        "start": {"lat": start_lat, "lng": start_lng},
        "end": {"lat": end_lat, "lng": end_lng},
        "context_tags": context_tags,
        "weather": weather_data,
        "recommendation": recommendation,
        "routes": routes
    }