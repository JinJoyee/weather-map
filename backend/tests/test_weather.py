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


def test_weather_current_success():
    with patch("app.routers.weather.get_weather", new=AsyncMock(return_value=MOCK_WEATHER)):
        response = client.get("/api/weather/current?lat=36.35&lng=127.38")
    assert response.status_code == 200
    data = response.json()
    assert data["weather"] == "맑음"
    assert data["temperature"] == 22.0


def test_weather_current_missing_params():
    response = client.get("/api/weather/current?lat=36.35")
    assert response.status_code == 422


def test_weather_current_invalid_params():
    response = client.get("/api/weather/current?lat=abc&lng=def")
    assert response.status_code == 422
