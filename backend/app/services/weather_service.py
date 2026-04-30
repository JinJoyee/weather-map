import httpx
from app.config import WEATHER_API_KEY

async def get_weather(lat: float, lng: float):
    return {
        "lat": lat,
        "lng": lng,
        "rain_probability": 0,
        "snow_probability": 0,
        "uv_index": 3,
        "weather": "맑음"
    }