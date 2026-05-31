const ICON_MAP = {
  맑음: { icon: 'wb_sunny', color: 'text-yellow-400', label: '맑음' },
  구름많음: { icon: 'partly_cloudy_day', color: 'text-gray-400', label: '구름많음' },
  흐림: { icon: 'cloud', color: 'text-gray-500', label: '흐림' },
  비: { icon: 'rainy', color: 'text-blue-400', label: '비' },
  눈: { icon: 'ac_unit', color: 'text-blue-200', label: '눈' },
};

const DEFAULT_ICON = { icon: 'wb_sunny', color: 'text-yellow-400', label: '맑음' };

/**
 * @param {{ weather: string, rainProbability?: number, snowProbability?: number, size?: string }} props
 */
export default function WeatherIcon({ weather, rainProbability = 0, snowProbability = 0, size = 'text-3xl' }) {
  let key = weather;
  if (snowProbability >= 50) key = '눈';
  else if (rainProbability >= 50) key = '비';

  const { icon, color, label } = ICON_MAP[key] ?? DEFAULT_ICON;

  return (
    <span
      className={`material-symbols-outlined ${size} ${color}`}
      title={label}
      aria-label={label}
    >
      {icon}
    </span>
  );
}
