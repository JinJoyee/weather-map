import httpx
from datetime import datetime, time

async def get_sun_times(lat: float, lng: float):
    try:
        url = "https://api.sunrise-sunset.org/json"
        params = {
            "lat": lat,
            "lng": lng,
            "formatted": 0
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()

        results = data.get("results", {})
        sunrise_str = results.get("sunrise", "")
        sunset_str = results.get("sunset", "")

        sunrise = datetime.fromisoformat(sunrise_str).time()
        sunset = datetime.fromisoformat(sunset_str).time()

        return {
            "sunrise": str(sunrise),
            "sunset": str(sunset)
        }

    except Exception as e:
        raise RuntimeError(f"일출/일몰 데이터를 가져오는 중 오류가 발생했습니다: {str(e)}")

def is_night(current_time: time, sunrise: time, sunset: time) -> bool:
    return current_time < sunrise or current_time > sunset
