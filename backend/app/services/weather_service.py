import httpx
from app.config import WEATHER_API_KEY
import math

# Step 1 — 위도/경도 → 기상청 격자(nx, ny) 변환
def latlon_to_grid(lat, lon):
    RE = 6371.00877
    GRID = 5.0
    SLAT1 = 30.0
    SLAT2 = 60.0
    OLON = 126.0
    OLAT = 38.0
    XO = 43
    YO = 136

    DEGRAD = math.pi / 180.0
    re = RE / GRID
    slat1 = SLAT1 * DEGRAD
    slat2 = SLAT2 * DEGRAD
    olon = OLON * DEGRAD
    olat = OLAT * DEGRAD

    sn = math.log(math.cos(slat1) / math.cos(slat2))
    sn /= math.log(math.tan(math.pi * 0.25 + slat2 * 0.5) / math.tan(math.pi * 0.25 + slat1 * 0.5))
    sf = math.tan(math.pi * 0.25 + slat1 * 0.5)
    sf = (sf ** sn) * math.cos(slat1) / sn
    ro = math.tan(math.pi * 0.25 + olat * 0.5)
    ro = re * sf / (ro ** sn)

    ra = math.tan(math.pi * 0.25 + lat * DEGRAD * 0.5)
    ra = re * sf / (ra ** sn)
    theta = lon * DEGRAD - olon
    if theta > math.pi: theta -= 2.0 * math.pi
    if theta < -math.pi: theta += 2.0 * math.pi
    theta *= sn

    nx = int(ra * math.sin(theta) + XO + 0.5)
    ny = int(ro - ra * math.cos(theta) + YO + 0.5)
    return nx, ny


# Step 2 — 기상청 API 호출 및 파싱
async def get_weather(lat: float, lng: float):
    from datetime import datetime

    nx, ny = latlon_to_grid(lat, lng)

    now = datetime.now()
    base_date = now.strftime("%Y%m%d")
    
    # 기상청은 정시 기준 발표 (매 3시간: 0200, 0500, 0800, 1100...)
    hour = now.hour
    base_times = [2, 5, 8, 11, 14, 17, 20, 23]
    base_hour = max([t for t in base_times if t <= hour], default=23)
    base_time = f"{base_hour:02d}00"

    url = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst"
    params = {
        "serviceKey": WEATHER_API_KEY,
        "numOfRows": 100,
        "pageNo": 1,
        "dataType": "JSON",
        "base_date": base_date,
        "base_time": base_time,
        "nx": nx,
        "ny": ny,
    }

    uv_value = await get_uv_index(lat, lng)

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10)
        
        try:
            data = response.json()
            items = data["response"]["body"]["items"]["item"]
        except Exception:
            return {
                "lat": lat,
                "lng": lng,
                "nx": nx,
                "ny": ny,
                "rain_probability": 0,
                "snow_probability": 0,
                "uv_index": uv_value,
                "weather": "맑음 (목업)"
            }

    result = {
        "lat": lat,
        "lng": lng,
        "nx": nx,
        "ny": ny,
        "rain_probability": 0,
        "snow_probability": 0,
        "uv_index": uv_value,
        "weather": "맑음"
    }

    for item in items:
        category = item["category"]
        value = item["fcstValue"]

        if category == "POP":   # 강수확률
            result["rain_probability"] = int(value)
        elif category == "PTY":  # 강수형태 (1=비, 3=눈)
            if value == "3":
                result["snow_probability"] = 80
        elif category == "SKY":  # 하늘상태
            sky_map = {"1": "맑음", "3": "구름많음", "4": "흐림"}
            result["weather"] = sky_map.get(value, "맑음")

    return result

async def get_uv_index(lat: float, lng: float):
    from datetime import datetime
    from app.config import UV_API_KEY

    now = datetime.now()
    time = now.strftime("%y%m%d") + f"{(now.hour // 3) * 3:02d}"
    area_no = "3000000000"  # 청주시

    url = "http://apis.data.go.kr/1360000/LivingWthrIdxServiceV4/getUVIdxV4"
    params = {
        "ServiceKey": UV_API_KEY,
        "pageNo": 1,
        "numOfRows": 10,
        "dataType": "JSON",
        "areaNo": area_no,
        "time": time,
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10)
            data = response.json()
            items = data["response"]["body"]["items"]["item"]
            uv_value = int(items[0]["h0"])
            return uv_value
    except Exception:
        return 3  # fallback 기본값

def calculate_sunrise_sunset(lat: float, lng: float):
    from datetime import datetime, timedelta
    import math

    today = datetime.now()
    day_of_year = today.timetuple().tm_yday

    # 일출/일몰 계산 (간이 공식)
    lng_hour = lng / 15
    
    # 일출
    t_rise = day_of_year + ((6 - lng_hour) / 24)
    m_rise = (0.9856 * t_rise) - 3.289
    l_rise = m_rise + (1.916 * math.sin(math.radians(m_rise))) + (0.020 * math.sin(math.radians(2 * m_rise))) + 282.634
    l_rise = l_rise % 360
    ra_rise = math.degrees(math.atan(0.91764 * math.tan(math.radians(l_rise))))
    ra_rise = ra_rise % 360
    l_quad = (l_rise // 90) * 90
    ra_quad = (ra_rise // 90) * 90
    ra_rise = ra_rise + (l_quad - ra_quad)
    ra_rise = ra_rise / 15
    sin_dec = 0.39782 * math.sin(math.radians(l_rise))
    cos_dec = math.cos(math.asin(sin_dec))
    cos_h = (math.cos(math.radians(90.833)) - (sin_dec * math.sin(math.radians(lat)))) / (cos_dec * math.cos(math.radians(lat)))
    h_rise = 360 - math.degrees(math.acos(cos_h))
    h_rise = h_rise / 15
    t_rise = h_rise + ra_rise - (0.06571 * t_rise) - 6.622
    ut_rise = (t_rise - lng_hour) % 24
    sunrise_hour = int((ut_rise + 9) % 24)  # KST (UTC+9)

    # 일몰
    t_set = day_of_year + ((18 - lng_hour) / 24)
    m_set = (0.9856 * t_set) - 3.289
    l_set = m_set + (1.916 * math.sin(math.radians(m_set))) + (0.020 * math.sin(math.radians(2 * m_set))) + 282.634
    l_set = l_set % 360
    ra_set = math.degrees(math.atan(0.91764 * math.tan(math.radians(l_set))))
    ra_set = ra_set % 360
    l_quad = (l_set // 90) * 90
    ra_quad = (ra_set // 90) * 90
    ra_set = ra_set + (l_quad - ra_quad)
    ra_set = ra_set / 15
    sin_dec = 0.39782 * math.sin(math.radians(l_set))
    cos_dec = math.cos(math.asin(sin_dec))
    cos_h = (math.cos(math.radians(90.833)) - (sin_dec * math.sin(math.radians(lat)))) / (cos_dec * math.cos(math.radians(lat)))
    h_set = math.degrees(math.acos(cos_h))
    h_set = h_set / 15
    t_set = h_set + ra_set - (0.06571 * t_set) - 6.622
    ut_set = (t_set - lng_hour) % 24
    sunset_hour = int((ut_set + 9) % 24)  # KST (UTC+9)

    return sunrise_hour, sunset_hour