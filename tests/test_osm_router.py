import json
import pytest
from unittest.mock import patch, MagicMock, mock_open
import app.services.osm_router as osm_mod
from app.services.osm_router import (
    _haversine_m, _polyline_distance_m, compute_weather_route,
)

_TEST_NODES = {
    "1": {"lat": 36.35, "lng": 127.38},
    "2": {"lat": 36.36, "lng": 127.39},
}
_TEST_ADJ = {
    "1": [{"to": "2", "length": 1000.0, "uv_cost": 0.5, "night_cost": 0.5, "rain_cost": 0.5}],
    "2": [{"to": "1", "length": 1000.0, "uv_cost": 0.5, "night_cost": 0.5, "rain_cost": 0.5}],
}
_FAR_NODES = {
    "1": {"lat": 0.0, "lng": 0.0},
    "2": {"lat": 0.1, "lng": 0.1},
}
_FAR_ADJ = {
    "1": [{"to": "2", "length": 100.0, "uv_cost": 0.5, "night_cost": 0.5, "rain_cost": 0.5}],
}


def _inject(nodes, adj):
    orig = (osm_mod._nodes, osm_mod._adj)
    osm_mod._nodes, osm_mod._adj = nodes, adj
    return orig


def _restore(orig):
    osm_mod._nodes, osm_mod._adj = orig


# --- _haversine_m ---

def test_haversine_same_point():
    assert _haversine_m(36.35, 127.38, 36.35, 127.38) == 0.0


def test_haversine_different_points():
    d = _haversine_m(36.35, 127.38, 36.36, 127.39)
    assert d > 0


# --- _polyline_distance_m ---

def test_polyline_distance_two_points():
    poly = [{"lat": 36.35, "lng": 127.38}, {"lat": 36.36, "lng": 127.39}]
    assert _polyline_distance_m(poly) > 0


def test_polyline_distance_single_point():
    assert _polyline_distance_m([{"lat": 36.35, "lng": 127.38}]) == 0.0


def test_polyline_distance_empty():
    assert _polyline_distance_m([]) == 0.0


# --- compute_weather_route ---

def test_compute_weather_route_success():
    orig = _inject(_TEST_NODES, _TEST_ADJ)
    try:
        poly, dist = compute_weather_route(36.35, 127.38, 36.36, 127.39, ["주간"], {"shade": 0})
        assert isinstance(poly, list)
        assert dist is not None
    finally:
        _restore(orig)


def test_compute_weather_route_uv_tags():
    orig = _inject(_TEST_NODES, _TEST_ADJ)
    try:
        poly, dist = compute_weather_route(
            36.35, 127.38, 36.36, 127.39,
            ["자외선_높음", "자외선_매우높음", "야간", "비"],
            {"shade": 50, "safety": 40},
        )
        assert isinstance(poly, list)
    finally:
        _restore(orig)


def test_compute_weather_route_snap_out_of_bounds():
    orig = _inject(_FAR_NODES, _FAR_ADJ)
    try:
        poly, dist = compute_weather_route(36.35, 127.38, 36.36, 127.39, ["주간"], {})
        assert poly == []
        assert dist is None
    finally:
        _restore(orig)


def test_compute_weather_route_no_path():
    """Disconnected graph (no edges) → dijkstra returns [] → ([], None)."""
    orig = _inject(
        {"1": {"lat": 36.35, "lng": 127.38}, "2": {"lat": 36.351, "lng": 127.381}},
        {"1": [], "2": []},
    )
    try:
        poly, dist = compute_weather_route(36.35, 127.38, 36.351, 127.381, [], {})
        assert poly == []
        assert dist is None
    finally:
        _restore(orig)


def test_compute_weather_route_exception():
    with patch("app.services.osm_router._load_graph", side_effect=RuntimeError("crash")):
        poly, dist = compute_weather_route(36.35, 127.38, 36.36, 127.39, [], {})
    assert poly == []
    assert dist is None


# --- _load_graph ---

def test_load_graph_from_json():
    fake_data = {
        "nodes": {"1": {"lat": 36.35, "lng": 127.38}},
        "adj": {"1": [{"to": "2", "length": 50.0, "uv_cost": 0.3, "night_cost": 0.1, "rain_cost": 0.7}]},
    }
    orig = (osm_mod._nodes, osm_mod._adj)
    osm_mod._nodes = None
    osm_mod._adj = None
    try:
        mock_path = MagicMock()
        mock_path.exists.return_value = True
        with patch("app.services.osm_router.GRAPH_JSON", mock_path), \
             patch("builtins.open", mock_open(read_data=json.dumps(fake_data))):
            osm_mod._load_graph()
        assert osm_mod._nodes == fake_data["nodes"]
        assert osm_mod._adj == fake_data["adj"]
    finally:
        osm_mod._nodes, osm_mod._adj = orig


def test_load_graph_raises_when_missing():
    orig = (osm_mod._nodes, osm_mod._adj)
    osm_mod._nodes = None
    osm_mod._adj = None
    try:
        mock_path = MagicMock()
        mock_path.exists.return_value = False
        with patch("app.services.osm_router.GRAPH_JSON", mock_path):
            with pytest.raises(FileNotFoundError):
                osm_mod._load_graph()
    finally:
        osm_mod._nodes, osm_mod._adj = orig
