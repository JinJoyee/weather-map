import httpx
from datetime import time
from app.config import WEATHER_API_KEY

async def get_weather(lat: float, lng: float):
    weather_data = {
        "lat": lat,
        "lng": lng,
        "rain_probability": 0,
        "snow_probability": 0,
        "uv_index": 3,
        "weather": "맑음"
    }

    context_tags = get_context_tags(
        weather_data=weather_data,
        uv_index=weather_data["uv_index"],
        current_time=time(14, 0),
        sunrise=time(6, 0),
        sunset=time(18, 0)
    )

    weather_data["context_tags"] = context_tags
    return weather_data

def get_context_tags(weather_data, uv_index, current_time, sunset, sunrise):
    tags = []

    if current_time < sunrise or current_time > sunset:
        tags.append("야간")
    else:
        tags.append("주간")

    if weather_data.get("rain_probability", 0) >= 60:
        tags.append("비")
    if weather_data.get("snow_probability", 0) >= 60:
        tags.append("눈")

    if "주간" in tags and uv_index >= 8:
        tags.append("자외선_매우높음")
    elif "주간" in tags and uv_index >= 6:
        tags.append("자외선_높음")

    return tags

