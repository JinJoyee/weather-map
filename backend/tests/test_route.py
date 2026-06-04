import asyncio
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.context_engine import get_context_tags
from app.services.route_engine import build_routes, get_waypoints_for_tags

client = TestClient(app)

MOCK_WEATHER_CLEAR = {
    "weather": "맑음",
    "rain_probability": 0,
    "snow_probability": 0,
    "uv_index": 3,
}

MOCK_ROUTES = [
    {"type": "normal", "description": "최단 경로", "waypoints": []},
    {"type": "context", "description": "상황 인식 경로", "waypoints": []},
]


# --- 기존 엔드포인트 테스트 ---

def test_route_recommend_success():
    with patch("app.routers.route.get_weather", new=AsyncMock(return_value=MOCK_WEATHER_CLEAR)), \
         patch("app.routers.route.build_routes", return_value=MOCK_ROUTES):
        response = client.get(
            "/api/route/recommend?start_lat=36.35&start_lng=127.38&end_lat=36.36&end_lng=127.39"
        )
    assert response.status_code == 200
    assert "routes" in response.json()
    assert "recommendation" in response.json()


def test_route_recommend_missing_params():
    response = client.get("/api/route/recommend?start_lat=36.35&start_lng=127.38")
    assert response.status_code == 422


# --- context_engine.py 커버 ---

def test_context_tags_daytime():
    tags = get_context_tags({"rain_probability": 0, "snow_probability": 0},
                            uv_index=3, current_time=12, sunset=19, sunrise=6)
    assert "주간" in tags


def test_context_tags_nighttime():
    tags = get_context_tags({"rain_probability": 0, "snow_probability": 0},
                            uv_index=3, current_time=22, sunset=19, sunrise=6)
    assert "야간" in tags


def test_context_tags_rain():
    tags = get_context_tags({"rain_probability": 70, "snow_probability": 0},
                            uv_index=3, current_time=12, sunset=19, sunrise=6)
    assert "비" in tags


def test_context_tags_snow():
    tags = get_context_tags({"rain_probability": 0, "snow_probability": 70},
                            uv_index=3, current_time=12, sunset=19, sunrise=6)
    assert "눈" in tags


def test_context_tags_very_high_uv():
    tags = get_context_tags({"rain_probability": 0, "snow_probability": 0},
                            uv_index=9, current_time=12, sunset=19, sunrise=6)
    assert "자외선_매우높음" in tags


def test_context_tags_high_uv():
    tags = get_context_tags({"rain_probability": 0, "snow_probability": 0},
                            uv_index=7, current_time=12, sunset=19, sunrise=6)
    assert "자외선_높음" in tags


# --- route_engine.py 커버 ---

def test_get_waypoints_for_known_tag():
    waypoints = get_waypoints_for_tags(["비"])
    assert len(waypoints) > 0


def test_get_waypoints_for_unknown_tag():
    waypoints = get_waypoints_for_tags(["없는태그"])
    assert waypoints == []


def test_build_routes_normal():
    with patch("app.services.route_engine.fetch_kakao_route", new=AsyncMock(return_value=[])):
        result = asyncio.run(build_routes(["주간"], 36.35, 127.38, 36.36, 127.39))
    assert "normal" in result
    assert "context" in result
    assert result["context"]["route_option"] == "normal"


def test_build_routes_night():
    with patch("app.services.route_engine.fetch_kakao_route", new=AsyncMock(return_value=[])):
        result = asyncio.run(build_routes(["야간"], 36.35, 127.38, 36.36, 127.39))
    assert result["context"]["route_option"] == "bigroad"


# --- route.py recommendation 분기 커버 ---

def test_route_recommend_rain_recommendation():
    with patch("app.routers.route.get_weather", new=AsyncMock(return_value=MOCK_WEATHER_CLEAR)), \
         patch("app.routers.route.get_context_tags", return_value=["비"]):
        response = client.get(
            "/api/route/recommend?start_lat=36.35&start_lng=127.38&end_lat=36.36&end_lng=127.39"
        )
    assert "실내 경로" in response.json()["recommendation"]


def test_route_recommend_snow_recommendation():
    with patch("app.routers.route.get_weather", new=AsyncMock(return_value=MOCK_WEATHER_CLEAR)), \
         patch("app.routers.route.get_context_tags", return_value=["눈"]):
        response = client.get(
            "/api/route/recommend?start_lat=36.35&start_lng=127.38&end_lat=36.36&end_lng=127.39"
        )
    assert "안전 경로" in response.json()["recommendation"]


def test_route_recommend_night_recommendation():
    with patch("app.routers.route.get_weather", new=AsyncMock(return_value=MOCK_WEATHER_CLEAR)), \
         patch("app.routers.route.get_context_tags", return_value=["야간"]):
        response = client.get(
            "/api/route/recommend?start_lat=36.35&start_lng=127.38&end_lat=36.36&end_lng=127.39"
        )
    assert "야간 경로" in response.json()["recommendation"]


def test_route_recommend_high_uv_recommendation():
    with patch("app.routers.route.get_weather", new=AsyncMock(return_value=MOCK_WEATHER_CLEAR)), \
         patch("app.routers.route.get_context_tags", return_value=["자외선_높음"]):
        response = client.get(
            "/api/route/recommend?start_lat=36.35&start_lng=127.38&end_lat=36.36&end_lng=127.39"
        )
    assert "그늘 경로" in response.json()["recommendation"]


def test_route_recommend_normal_recommendation():
    with patch("app.routers.route.get_weather", new=AsyncMock(return_value=MOCK_WEATHER_CLEAR)), \
         patch("app.routers.route.get_context_tags", return_value=["주간"]):
        response = client.get(
            "/api/route/recommend?start_lat=36.35&start_lng=127.38&end_lat=36.36&end_lng=127.39"
        )
    assert "일반 경로" in response.json()["recommendation"]
