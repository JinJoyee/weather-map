from fastapi import APIRouter
from app.services.weather_service import get_weather

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("/current")
async def current_weather(lat: float, lng: float):
    data = await get_weather(lat, lng)
    return data