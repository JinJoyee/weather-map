from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

MOCK_WEATHER = {
    "weather": "맑음",
    "temperature": 22.0,
    "humidity": 55,
    "rain_probability": 10,
    "snow_probability": 0,
    "uv_index": 3,
}

MOCK_ROUTES = [
    {"type": "normal", "description": "최단 경로", "waypoints": []},
    {"type": "context", "description": "상황 인식 경로", "waypoints": []},
    {"type": "custom", "description": "커스텀 경로", "waypoints": []},
]


def test_route_recommend_success():
    with patch("app.routers.route.get_weather", new=AsyncMock(return_value=MOCK_WEATHER)), \
         patch("app.routers.route.get_uv_index", new=AsyncMock(return_value=3)), \
         patch("app.routers.route.build_routes", return_value=MOCK_ROUTES):
        response = client.get(
            "/api/route/recommend?start_lat=36.35&start_lng=127.38&end_lat=36.36&end_lng=127.39"
        )
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data
    assert "recommendation" in data
    assert "context_tags" in data


def test_route_recommend_missing_params():
    response = client.get("/api/route/recommend?start_lat=36.35&start_lng=127.38")
    assert response.status_code == 422
