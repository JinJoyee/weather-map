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