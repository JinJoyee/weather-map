def get_context_tags(weather_data, uv_index, current_time, sunset, sunrise):
    tags = []

    if current_time < sunrise or current_time > sunset:
        tags.append("야간")
    else:
        tags.append("주간")

    if weather_data.get("rain_probability", 0) >= 60:
        tags.append("비")
    if weather_data.get("snow_probability", 0) >= 60:
        tags.append("눈")

    if "주간" in tags and uv_index >= 8:
        tags.append("자외선_매우높음")
    elif "주간" in tags and uv_index >= 6:
        tags.append("자외선_높음")

    return tags


def get_context_scores(tags: list, uv_index: int, weather_data: dict) -> dict:
    """
    태그 + 날씨 수치로 경로 전략 가중치 계산.
    shade  : 그늘/공원 경유 경로 필요도
    indoor : 실내 이동 권장도 (경로 변경 없이 경고 메시지만)
    safety : 안전 주의 경로 필요도 (야간·눈)
    """
    scores = {"shade": 0, "indoor": 0, "safety": 0}

    rain_prob = weather_data.get("rain_probability", 0)
    temp = weather_data.get("temperature")

    if "자외선_매우높음" in tags:
        scores["shade"] += 50
        scores["indoor"] += 30
    elif "자외선_높음" in tags:
        scores["shade"] += 40

    if "눈" in tags:
        scores["safety"] += 60
    if "비" in tags:
        scores["safety"] += 20
        if rain_prob >= 80:
            scores["indoor"] += 30

    if "야간" in tags:
        scores["safety"] += 40

    if temp is not None:
        if temp >= 35:
            scores["shade"] += 20
        elif temp <= 0:
            scores["safety"] += 10

    return scores


def get_context_warnings(tags: list, uv_index: int, weather_data: dict) -> list:
    """사용자에게 표시할 상황별 경고/안내 메시지 목록."""
    warnings = []
    rain_prob = weather_data.get("rain_probability", 0)
    temp = weather_data.get("temperature")

    if "자외선_매우높음" in tags:
        warnings.append(f"자외선 지수 {uv_index} (매우 강함) — 가급적 실내 이동을 권장합니다. 외출 시 자외선 차단제 필수.")
    elif "자외선_높음" in tags:
        warnings.append(f"자외선 지수 {uv_index} (높음) — 그늘진 경로를 경유합니다. 모자·선크림을 준비하세요.")

    if "눈" in tags:
        warnings.append("눈이 내립니다. 미끄러운 구간 주의 — 밝은 거리 위주의 안전 경로를 안내합니다.")
    elif "비" in tags:
        if rain_prob >= 80:
            warnings.append(f"강수 확률 {rain_prob}% — 비가 많이 옵니다. 우산을 꼭 챙기세요.")
        else:
            warnings.append(f"강수 확률 {rain_prob}% — 비 올 가능성이 있습니다. 우산을 준비하세요.")

    if "야간" in tags:
        warnings.append("야간 이동 — 밝은 거리 위주의 경로를 안내합니다.")

    if temp is not None:
        if temp >= 35:
            warnings.append(f"현재 기온 {temp}°C (매우 더움) — 그늘 경로를 우선 안내합니다.")
        elif temp <= 0:
            warnings.append(f"현재 기온 {temp}°C — 결빙 구간 주의.")

    return warnings
