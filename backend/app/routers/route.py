from fastapi import APIRouter
from datetime import datetime
from app.services.weather_service import get_weather
from app.services.context_engine import get_context_tags

router = APIRouter(prefix="/api/route", tags=["route"])

@router.get("/recommend")
async def recommend_route(lat: float, lng: float):
    # 1. 날씨 데이터 가져오기
    weather_data = await get_weather(lat, lng)
    uv_index = weather_data.get("uv_index", 3)

    # 2. 현재 시각 + 일출/일몰 (고정값)
    current_time = datetime.now().hour
    sunrise = 6
    sunset = 19

    # 3. 상황 태그 판단
    context_tags = get_context_tags(weather_data, uv_index, current_time, sunset, sunrise)

    # 4. 태그 기반 추천 결정
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
        "lat": lat,
        "lng": lng,
        "context_tags": context_tags,
        "weather": weather_data,
        "recommendation": recommendation
    }