"""
OSM 기반 날씨 가중치 라우팅.
각 도로 엣지에 uv_cost / night_cost / rain_cost 가중치를 적용해
날씨 조건별로 실제로 다른 경로를 계산한다.
"""
import math
import logging
from pathlib import Path
import networkx as nx
import osmnx as ox

logger = logging.getLogger(__name__)

GRAPH_PATH = Path(__file__).parent.parent.parent / "data" / "daejeon_weather_graph.graphml"
_G = None


def _load_graph():
    global _G
    if _G is None:
        if not GRAPH_PATH.exists():
            raise FileNotFoundError(
                f"Graph not found: {GRAPH_PATH}. "
                "Run: python scripts/build_daejeon_graph.py"
            )
        _G = ox.load_graphml(GRAPH_PATH)
        logger.info("OSM 그래프 로드 완료: %d nodes, %d edges", _G.number_of_nodes(), _G.number_of_edges())
    return _G


def _polyline_distance_m(polyline: list) -> float:
    total = 0.0
    for i in range(len(polyline) - 1):
        a, b = polyline[i], polyline[i + 1]
        dlat = math.radians(b["lat"] - a["lat"])
        dlng = math.radians(b["lng"] - a["lng"])
        h = (math.sin(dlat / 2) ** 2
             + math.cos(math.radians(a["lat"]))
             * math.cos(math.radians(b["lat"]))
             * math.sin(dlng / 2) ** 2)
        total += 6_371_000 * 2 * math.asin(math.sqrt(h))
    return total


def compute_weather_route(
    start_lat: float, start_lng: float,
    end_lat: float, end_lng: float,
    context_tags: list,
    scores: dict,
) -> tuple:
    """
    날씨 가중치를 적용한 최적 보행 경로를 계산한다.

    - 자외선_높음/매우높음: uv_cost 높은 도로(대로, 야외) 회피
    - 야간: night_cost 높은 도로(조명 없음, 소로) 회피
    - 비/눈: rain_cost 높은 도로(야외 보행로) 회피

    Returns:
        (polyline, distance_m) — 성공 시
        ([], None)             — 실패 시 (폴백 사용)
    """
    try:
        G = _load_graph()

        start_node = ox.nearest_nodes(G, start_lng, start_lat)
        end_node   = ox.nearest_nodes(G, end_lng, end_lat)

        # scores를 0~1 범위로 정규화
        shade_w  = min(scores.get("shade", 0) / 70.0, 1.0)
        safety_w = min(scores.get("safety", 0) / 100.0, 1.0)

        def weight_fn(u, v, data):
            length  = float(data.get("length", 1.0))
            penalty = 1.0

            if "자외선_높음" in context_tags:
                penalty += float(data.get("uv_cost", 0.5)) * shade_w * 3.0
            if "자외선_매우높음" in context_tags:
                penalty += float(data.get("uv_cost", 0.5)) * shade_w * 5.0
            if "야간" in context_tags:
                penalty += float(data.get("night_cost", 0.5)) * safety_w * 4.0
            if "비" in context_tags or "눈" in context_tags:
                penalty += float(data.get("rain_cost", 0.8)) * safety_w * 3.0

            return length * penalty

        path_nodes = nx.shortest_path(G, start_node, end_node, weight=weight_fn)

        polyline = [
            {"lat": G.nodes[n]["y"], "lng": G.nodes[n]["x"]}
            for n in path_nodes
        ]
        distance = _polyline_distance_m(polyline)
        return polyline, distance

    except Exception as e:
        logger.warning("OSM 라우팅 실패 (%s), 폴백 사용", e)
        return [], None
