from fastapi import APIRouter, HTTPException
from app.services.weather_service import get_weather

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("/current")
async def current_weather(lat: float, lng: float):
    if not (-90 <= lat <= 90):
        raise HTTPException(status_code=400, detail="유효하지 않은 위도입니다.")
    if not (-180 <= lng <= 180):
        raise HTTPException(status_code=400, detail="유효하지 않은 경도입니다.")

    data = await get_weather(lat, lng)
    return data

