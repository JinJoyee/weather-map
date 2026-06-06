import { useRef, useEffect, useState } from "react";
import { fetchCurrentWeather } from "../../api/weather";
import WeatherIcon from "../common/WeatherIcon";
import MapScreenScaffold from "../../layout/MapScreenScaffold";

const DAEJEON_LAT = 36.3504;
const DAEJEON_LNG = 127.3845;

export default function MapView() {
  const mapRef = useRef(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetchCurrentWeather(DAEJEON_LAT, DAEJEON_LNG)
      .then(setWeather)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    const center = new kakao.maps.LatLng(DAEJEON_LAT, DAEJEON_LNG);
    const map = new kakao.maps.Map(mapRef.current, {
      center,
      level: 5,
    });

    const marker = new kakao.maps.Marker({
      position: center,
    });

    marker.setMap(map);

    const infoWindow = new kakao.maps.InfoWindow({
      content:
        '<div style="padding:6px 10px;font-size:13px;">대전 중심부</div>',
    });

    kakao.maps.event.addListener(marker, "click", () => {
      infoWindow.open(map, marker);
    });
  }, []);

  const panel = weather ? (
    <div className="p-5">
      <h2 className="text-[17px] font-extrabold text-ink dark:text-dark-ink mb-4">
        현재 날씨
      </h2>

      <div
        className="flex items-center gap-3 p-4
                   bg-bg dark:bg-dark-bg
                   rounded-card
                   border border-line dark:border-dark-line"
      >
        <WeatherIcon
          weather={weather.weather}
          rainProbability={weather.rain_probability}
          snowProbability={weather.snow_probability}
          size="text-2xl"
        />

        <div className="text-sm">
          <p className="font-bold text-ink dark:text-dark-ink">
            {weather.weather}
          </p>

          <p className="text-muted dark:text-dark-muted">
            UV {weather.uv_index} · 강수 {weather.rain_probability}%
          </p>

          {weather.temperature != null && (
            <p className="text-muted dark:text-dark-muted">
              {weather.temperature}°C
            </p>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="p-5">
      <h2 className="text-[17px] font-extrabold text-ink dark:text-dark-ink mb-4">
        현재 날씨
      </h2>

      <p className="text-faint dark:text-dark-faint text-sm">
        날씨 정보를 불러오는 중...
      </p>
    </div>
  );

  const map = weather ? (
    <div
      className="
        absolute top-4 left-4 z-10
        bg-card/95 dark:bg-dark-card/95
        backdrop-blur-sm
        border border-line dark:border-dark-line
        px-4 py-3
        rounded-card
        shadow-sm
        flex items-center gap-3
      "
    >
      <WeatherIcon
        weather={weather.weather}
        rainProbability={weather.rain_probability}
        snowProbability={weather.snow_probability}
        size="text-2xl"
      />

      <div className="text-sm">
        <p className="font-bold text-ink dark:text-dark-ink">
          {weather.weather}
        </p>

        <p className="text-muted dark:text-dark-muted">
          UV {weather.uv_index} · 강수 {weather.rain_probability}%
        </p>
      </div>
    </div>
  ) : null;

  const sheetHeader = (
    <h1 className="m-0 text-[20px] font-extrabold text-ink dark:text-dark-ink tracking-[-0.02em]">
      지도
    </h1>
  );

  return (
    <MapScreenScaffold
      mapRef={mapRef}
      panel={panel}
      map={map}
      sheetHeader={sheetHeader}
    />
  );
}