import { useRef, useEffect, useState } from 'react';
import { fetchCurrentWeather } from '../../api/weather';
import WeatherIcon from '../common/WeatherIcon';

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
    const map = new kakao.maps.Map(mapRef.current, { center, level: 5 });

    const marker = new kakao.maps.Marker({ position: center });
    marker.setMap(map);

    const infoWindow = new kakao.maps.InfoWindow({
      content: '<div style="padding:6px 10px;font-size:13px;">대전 중심부</div>',
    });

    kakao.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(map, marker);
    });
  }, []);

  return (
    <div className="relative w-full h-screen dark:bg-surface-dark">
      <div ref={mapRef} className="w-full h-full" />

      {weather && (
        <div className="absolute top-4 left-4 glass-panel px-4 py-3 flex items-center gap-3 z-10">
          <WeatherIcon
            weather={weather.weather}
            rainProbability={weather.rain_probability}
            snowProbability={weather.snow_probability}
            size="text-2xl"
          />
          <div className="text-sm">
            <p className="font-bold text-secondary dark:text-blue-300">{weather.weather}</p>
            <p className="text-gray-500 dark:text-slate-400">UV {weather.uv_index} · 강수 {weather.rain_probability}%</p>
          </div>
        </div>
      )}
    </div>
  );
}