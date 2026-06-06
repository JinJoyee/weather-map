import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.weather_service import latlon_to_grid, get_weather, get_uv_index

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
    assert response.json()["weather"] == "맑음"


def test_weather_current_missing_params():
    response = client.get("/api/weather/current?lat=36.35")
    assert response.status_code == 422


def test_weather_current_invalid_params():
    response = client.get("/api/weather/current?lat=abc&lng=def")
    assert response.status_code == 422


def test_latlon_to_grid_returns_int_tuple():
    nx, ny = latlon_to_grid(36.35, 127.38)
    assert isinstance(nx, int)
    assert isinstance(ny, int)


def _make_http_mock(json_data):
    mock_resp = MagicMock()
    mock_resp.json.return_value = json_data
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=mock_resp)
    return mock_http


def test_get_weather_success():
    mock_http = _make_http_mock({
        "response": {
            "body": {
                "items": {
                    "item": [
                        {"category": "POP", "fcstValue": "40"},
                        {"category": "PTY", "fcstValue": "3"},
                        {"category": "SKY", "fcstValue": "4"},
                    ]
                }
            }
        }
    })

    async def _run():
        with patch("app.services.weather_service.get_uv_index", new=AsyncMock(return_value=3)), \
             patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await get_weather(36.35, 127.38)

    result = asyncio.run(_run())
    assert result["rain_probability"] == 40
    assert result["snow_probability"] == 80
    assert result["weather"] == "흐림"


def test_get_weather_exception_fallback():
    mock_resp = MagicMock()
    mock_resp.json.side_effect = Exception("parse error")
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=mock_resp)

    async def _run():
        with patch("app.services.weather_service.get_uv_index", new=AsyncMock(return_value=3)), \
             patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await get_weather(36.35, 127.38)

    result = asyncio.run(_run())
    assert "목업" in result["weather"]


def test_get_uv_index_success():
    mock_http = _make_http_mock({
        "response": {
            "body": {
                "items": {
                    "item": [{"h0": "7"}]
                }
            }
        }
    })

    async def _run():
        with patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await get_uv_index(36.35, 127.38)

    result = asyncio.run(_run())
    assert result == 7


def test_get_uv_index_fallback():
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(side_effect=Exception("network error"))

    async def _run():
        with patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await get_uv_index(36.35, 127.38)

    result = asyncio.run(_run())
    assert result == 3


def test_get_weather_with_temperature():
    mock_http = _make_http_mock({
        "response": {"body": {"items": {"item": [
            {"category": "TMP", "fcstValue": "25.5"},
        ]}}}
    })
    async def _run():
        with patch("app.services.weather_service.get_uv_index", new=AsyncMock(return_value=3)), \
             patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await get_weather(36.35, 127.38)
    result = asyncio.run(_run())
    assert result["temperature"] == 25.5


def test_get_weather_with_invalid_temperature():
    mock_http = _make_http_mock({
        "response": {"body": {"items": {"item": [
            {"category": "TMP", "fcstValue": "N/A"},
        ]}}}
    })
    async def _run():
        with patch("app.services.weather_service.get_uv_index", new=AsyncMock(return_value=3)), \
             patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await get_weather(36.35, 127.38)
    result = asyncio.run(_run())
    assert result["temperature"] is None
