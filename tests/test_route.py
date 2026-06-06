import asyncio
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.context_engine import get_context_tags, get_context_scores, get_context_warnings
from app.services.route_engine import (
    build_routes, get_waypoints_for_tags, fetch_kakao_route,
    _fetch_tmap_foot_route, _fetch_kakao_route_full, _search_place_near,
    _get_context_waypoint,
)

client = TestClient(app)


def _mock_resp(data):
    m = MagicMock()
    m.json.return_value = data
    return m


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
    with patch("app.services.route_engine._fetch_kakao_route_full", new=AsyncMock(return_value=([], None, None))):
        result = asyncio.run(build_routes(["주간"], 36.35, 127.38, 36.36, 127.39))
    assert "normal" in result
    assert "context" in result
    assert result["context"]["route_option"] == "normal"


def test_build_routes_night():
    with patch("app.services.route_engine._fetch_kakao_route_full", new=AsyncMock(return_value=([], None, None))):
        result = asyncio.run(build_routes(["야간"], 36.35, 127.38, 36.36, 127.39))
    assert result["context"]["route_option"] == "bigroad"


# --- route.py recommendation 분기 커버 ---

def test_route_recommend_rain_recommendation():
    with patch("app.routers.route.get_weather", new=AsyncMock(return_value=MOCK_WEATHER_CLEAR)), \
         patch("app.routers.route.get_context_tags", return_value=["비"]):
        response = client.get(
            "/api/route/recommend?start_lat=36.35&start_lng=127.38&end_lat=36.36&end_lng=127.39"
        )
    assert "안전 경로" in response.json()["recommendation"]


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


# --- route.py indoor 분기 커버 (line 37) ---

def test_route_recommend_indoor_recommendation():
    mock_heavy_rain = {**MOCK_WEATHER_CLEAR, "rain_probability": 80}
    with patch("app.routers.route.get_weather", new=AsyncMock(return_value=mock_heavy_rain)), \
         patch("app.routers.route.get_context_tags", return_value=["비"]):
        response = client.get(
            "/api/route/recommend?start_lat=36.35&start_lng=127.38&end_lat=36.36&end_lng=127.39"
        )
    assert "실내 이동" in response.json()["recommendation"]


# --- context_engine get_context_scores 커버 ---

def test_context_scores_very_high_uv():
    scores = get_context_scores(["주간", "자외선_매우높음"], uv_index=9,
                                weather_data={"rain_probability": 0, "temperature": None})
    assert scores["shade"] == 50
    assert scores["indoor"] == 30


def test_context_scores_snow():
    scores = get_context_scores(["눈"], uv_index=2,
                                weather_data={"rain_probability": 0, "temperature": None})
    assert scores["safety"] == 60


def test_context_scores_hot_temp():
    scores = get_context_scores(["주간"], uv_index=3,
                                weather_data={"rain_probability": 0, "temperature": 36})
    assert scores["shade"] == 20


def test_context_scores_cold_temp():
    scores = get_context_scores(["주간"], uv_index=3,
                                weather_data={"rain_probability": 0, "temperature": -1})
    assert scores["safety"] == 10


def test_context_scores_heavy_rain_indoor():
    scores = get_context_scores(["비"], uv_index=3,
                                weather_data={"rain_probability": 80, "temperature": None})
    assert scores["indoor"] == 30


# --- context_engine get_context_warnings 커버 ---

def test_context_warnings_very_high_uv():
    w = get_context_warnings(["자외선_매우높음"], uv_index=9,
                             weather_data={"rain_probability": 0, "temperature": None})
    assert any("매우 강함" in msg for msg in w)


def test_context_warnings_heavy_rain():
    w = get_context_warnings(["비"], uv_index=3,
                             weather_data={"rain_probability": 80, "temperature": None})
    assert any("많이" in msg for msg in w)


def test_context_warnings_hot_temp():
    w = get_context_warnings(["주간"], uv_index=3,
                             weather_data={"rain_probability": 0, "temperature": 36})
    assert any("매우 더움" in msg for msg in w)


def test_context_warnings_cold_temp():
    w = get_context_warnings(["주간"], uv_index=3,
                             weather_data={"rain_probability": 0, "temperature": -1})
    assert any("결빙" in msg for msg in w)


# --- route_engine _search_place_near 커버 ---

def test_search_place_near_success():
    mock_doc = [{"y": "36.35", "x": "127.38", "place_name": "테스트공원"}]
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=_mock_resp({"documents": mock_doc}))
    async def _run():
        with patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await _search_place_near(36.35, 127.38, "공원", 1000)
    result = asyncio.run(_run())
    assert result is not None
    assert result["label"] == "테스트공원"


def test_search_place_near_empty():
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=_mock_resp({"documents": []}))
    async def _run():
        with patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await _search_place_near(36.35, 127.38, "공원", 1000)
    result = asyncio.run(_run())
    assert result is None


def test_search_place_near_exception():
    async def _run():
        with patch("httpx.AsyncClient", side_effect=Exception("network error")):
            return await _search_place_near(36.35, 127.38, "공원", 1000)
    result = asyncio.run(_run())
    assert result is None


# --- route_engine _get_context_waypoint 분기 커버 ---

def test_get_context_waypoint_shade():
    async def _run():
        with patch("app.services.route_engine._search_place_near", new=AsyncMock(return_value=None)):
            return await _get_context_waypoint(
                ["자외선_높음"], 36.35, 127.38, 36.36, 127.39,
                scores={"shade": 40, "indoor": 0, "safety": 0}
            )
    result = asyncio.run(_run())
    assert isinstance(result, list)


def test_get_context_waypoint_rain():
    async def _run():
        with patch("app.services.route_engine._search_place_near", new=AsyncMock(return_value=None)):
            return await _get_context_waypoint(
                ["비"], 36.35, 127.38, 36.36, 127.39,
                scores={"shade": 0, "indoor": 0, "safety": 20}
            )
    result = asyncio.run(_run())
    assert isinstance(result, list)


def test_get_context_waypoint_snow():
    async def _run():
        with patch("app.services.route_engine._search_place_near", new=AsyncMock(return_value=None)):
            return await _get_context_waypoint(
                ["눈"], 36.35, 127.38, 36.36, 127.39,
                scores={"shade": 0, "indoor": 0, "safety": 60}
            )
    result = asyncio.run(_run())
    assert isinstance(result, list)


def test_get_context_waypoint_night_with_wp():
    mock_wp = {"lat": 36.33, "lng": 127.43, "label": "으능정이", "type": "lit_road"}
    async def _run():
        with patch("app.services.route_engine._search_place_near", new=AsyncMock(return_value=mock_wp)):
            return await _get_context_waypoint(
                ["비"], 36.35, 127.38, 36.36, 127.39,
                scores={"shade": 0, "indoor": 0, "safety": 20}
            )
    result = asyncio.run(_run())
    assert len(result) == 1


# --- route_engine _fetch_kakao_route_full 분기 커버 ---

def test_fetch_kakao_route_full_no_routes():
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=_mock_resp({"routes": []}))
    async def _run():
        with patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await _fetch_kakao_route_full(36.35, 127.38, 36.36, 127.39)
    result = asyncio.run(_run())
    assert result == ([], None, None)


def test_fetch_kakao_route_full_nonzero_result_code():
    data = {"routes": [{"result_code": 1, "summary": {}, "sections": []}]}
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=_mock_resp(data))
    async def _run():
        with patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await _fetch_kakao_route_full(36.35, 127.38, 36.36, 127.39)
    result = asyncio.run(_run())
    assert result == ([], None, None)


# --- route_engine _fetch_tmap_foot_route exception 커버 ---

def test_fetch_kakao_route_full_exception():
    async def _run():
        with patch("httpx.AsyncClient", side_effect=Exception("network error")):
            return await _fetch_kakao_route_full(36.35, 127.38, 36.36, 127.39)
    result = asyncio.run(_run())
    assert result == ([], None, None)


def test_fetch_tmap_foot_route_exception():
    async def _run():
        with patch("httpx.AsyncClient", side_effect=Exception("network error")):
            return await _fetch_tmap_foot_route(36.35, 127.38, 36.36, 127.39)
    polyline, dist = asyncio.run(_run())
    assert polyline == []
    assert dist is None


# --- route_engine fetch_kakao_route (공개 함수) 커버 ---

def test_fetch_kakao_route_success():
    data = {
        "routes": [{
            "result_code": 0,
            "sections": [{"roads": [{"vertexes": [127.38, 36.35, 127.39, 36.36]}]}]
        }]
    }
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=_mock_resp(data))
    async def _run():
        with patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await fetch_kakao_route(36.35, 127.38, 36.36, 127.39)
    result = asyncio.run(_run())
    assert len(result) > 0


def test_fetch_kakao_route_no_routes():
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=_mock_resp({"routes": []}))
    async def _run():
        with patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await fetch_kakao_route(36.35, 127.38, 36.36, 127.39)
    result = asyncio.run(_run())
    assert result == []


def test_fetch_kakao_route_exception():
    async def _run():
        with patch("httpx.AsyncClient", side_effect=Exception("err")):
            return await fetch_kakao_route(36.35, 127.38, 36.36, 127.39)
    assert asyncio.run(_run()) == []


def test_fetch_kakao_route_with_waypoints():
    data = {
        "routes": [{
            "result_code": 0,
            "sections": [{"roads": [{"vertexes": [127.38, 36.35, 127.39, 36.36]}]}]
        }]
    }
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=_mock_resp(data))
    async def _run():
        with patch("httpx.AsyncClient") as MockClient:
            MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
            return await fetch_kakao_route(
                36.35, 127.38, 36.36, 127.39,
                waypoints=[{"lat": 36.355, "lng": 127.385}]
            )
    result = asyncio.run(_run())
    assert isinstance(result, list)


# --- build_routes fallback 분기 커버 ---

def test_build_routes_with_context_wps():
    mock_wp = [{"lat": 36.355, "lng": 127.385, "label": "테스트", "type": "park"}]
    with patch("app.services.route_engine._fetch_kakao_route_full", new=AsyncMock(return_value=([], None, None))), \
         patch("app.services.route_engine._fetch_tmap_foot_route", new=AsyncMock(return_value=([], None))), \
         patch("app.services.route_engine.compute_weather_route", return_value=([], None)), \
         patch("app.services.route_engine._get_context_waypoint", new=AsyncMock(return_value=mock_wp)):
        result = asyncio.run(build_routes(["비"], 36.35, 127.38, 36.36, 127.39))
    assert "context" in result


def test_build_routes_empty_tags():
    with patch("app.services.route_engine._fetch_kakao_route_full", new=AsyncMock(return_value=([], None, None))), \
         patch("app.services.route_engine._fetch_tmap_foot_route", new=AsyncMock(return_value=([], None))), \
         patch("app.services.route_engine.compute_weather_route", return_value=([], None)):
        result = asyncio.run(build_routes([], 36.35, 127.38, 36.36, 127.39))
    assert result["context"]["description"] == "날씨 최적 경로"


def test_build_routes_tmap_fallback():
    data = {
        "routes": [{
            "result_code": 0,
            "summary": {"duration": 600, "distance": 500},
            "sections": [{"roads": [{"vertexes": [127.38, 36.35, 127.39, 36.36]}]}]
        }]
    }
    mock_http = AsyncMock()
    mock_http.get = AsyncMock(return_value=_mock_resp(data))
    with patch("app.services.route_engine.compute_weather_route", return_value=([], None)), \
         patch("app.services.route_engine._fetch_tmap_foot_route", new=AsyncMock(return_value=([], None))), \
         patch("httpx.AsyncClient") as MockClient:
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_http)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=None)
        result = asyncio.run(build_routes(["주간"], 36.35, 127.38, 36.36, 127.39))
    assert "normal" in result
