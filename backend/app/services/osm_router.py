"""
OSM 기반 날씨 가중치 라우팅 (순수 Python, JSON 그래프).
osmnx 런타임 의존성 없음 — json/math/heapq만 사용.
"""
import json
import math
import heapq
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

GRAPH_JSON = Path(__file__).parent.parent.parent / "data" / "daejeon_graph.json"

_nodes: dict | None = None
_adj: dict | None = None


def _haversine_m(lat1, lng1, lat2, lng2) -> float:
    R = 6_371_000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def _load_graph():
    global _nodes, _adj
    if _nodes is not None and _adj is not None:
        return
    if not GRAPH_JSON.exists():
        raise FileNotFoundError(
            f"Graph not found: {GRAPH_JSON}. "
            "Run: python scripts/build_daejeon_graph.py"
        )
    with open(GRAPH_JSON) as f:
        data = json.load(f)
    _nodes = data["nodes"]
    _adj = data["adj"]
    logger.info("OSM 그래프 로드 완료: %d nodes", len(_nodes))


def _polyline_distance_m(polyline: list) -> float:
    total = 0.0
    for i in range(len(polyline) - 1):
        a, b = polyline[i], polyline[i + 1]
        total += _haversine_m(a["lat"], a["lng"], b["lat"], b["lng"])
    return total


def _nearest_node(lat: float, lng: float) -> tuple:
    best_id, best_d = None, float("inf")
    for nid, n in _nodes.items():
        d = _haversine_m(lat, lng, n["lat"], n["lng"])
        if d < best_d:
            best_d, best_id = d, nid
    return best_id, best_d


def _dijkstra(start: str, end: str, weight_fn) -> list:
    dist = {start: 0.0}
    prev = {}
    pq = [(0.0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float("inf")):
            continue
        if u == end:
            path = []
            while u in prev:
                path.append(u)
                u = prev[u]
            path.append(start)
            return path[::-1]
        for edge in _adj.get(u, []):
            v = edge["to"]
            w = weight_fn(edge)
            nd = d + w
            if nd < dist.get(v, float("inf")):
                dist[v] = nd
                prev[v] = u
                heapq.heappush(pq, (nd, v))
    return []


def compute_weather_route(
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float,
    context_tags: list,
    scores: dict,
) -> tuple:
    """
    날씨 가중치를 적용한 최적 보행 경로를 계산한다.
    Returns: (polyline, distance_m) 또는 ([], None)
    """
    try:
        _load_graph()

        start_node, start_d = _nearest_node(start_lat, start_lng)
        end_node, end_d = _nearest_node(end_lat, end_lng)

        MAX_SNAP_M = 500
        if start_d > MAX_SNAP_M or end_d > MAX_SNAP_M:
            logger.info("입력 좌표가 OSM 그래프 범위 밖 → 폴백 사용")
            return [], None

        shade_w = min(scores.get("shade", 0) / 70.0, 1.0)
        safety_w = min(scores.get("safety", 0) / 100.0, 1.0)

        def weight_fn(edge):
            length = float(edge.get("length", 1.0))
            penalty = 1.0
            if "자외선_높음" in context_tags:
                penalty += float(edge.get("uv_cost", 0.5)) * shade_w * 3.0
            if "자외선_매우높음" in context_tags:
                penalty += float(edge.get("uv_cost", 0.5)) * shade_w * 5.0
            if "야간" in context_tags:
                penalty += float(edge.get("night_cost", 0.5)) * safety_w * 4.0
            if "비" in context_tags or "눈" in context_tags:
                penalty += float(edge.get("rain_cost", 0.8)) * safety_w * 3.0
            return length * penalty

        path_nodes = _dijkstra(start_node, end_node, weight_fn)
        if not path_nodes:
            return [], None

        polyline = [{"lat": start_lat, "lng": start_lng}]
        polyline += [{"lat": _nodes[n]["lat"], "lng": _nodes[n]["lng"]} for n in path_nodes]
        polyline.append({"lat": end_lat, "lng": end_lng})

        distance = _polyline_distance_m(polyline)
        return polyline, distance

    except Exception as e:
        logger.warning("OSM 라우팅 실패 (%s), 폴백 사용", e)
        return [], None
