import { useEffect, useState } from 'react';
  import { fetchCurrentWeather } from './api/weather';

  function App() {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchCurrentWeather(36.6284, 127.4565)
        .then((data) => {
          setWeather(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || '알 수 없는 에러');
          setLoading(false);
        });
    }, []);

    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-6">
        <header className="text-center">
          <h1 className="text-4xl text-secondary font-extrabold mb-2">Weather Map System</h1>
          <p className="text-gray-500 font-medium">백엔드 연결 테스트</p>
        </header>

        <div className="glass-panel p-6 max-w-sm w-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">wb_sunny</span>
            <h3 className="text-lg font-bold">백엔드 응답</h3>
          </div>

          {loading && (
            <p className="text-sm text-gray-500">로딩 중...</p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-600 font-bold mb-1">❌ 통신 실패</p>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}

          {weather && (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-bold">위치:</span> ({weather.lat}, {weather.lng})
              </p>
              <p className="text-sm">
                <span className="font-bold">날씨:</span> {weather.weather}
              </p>
              <p className="text-sm">
                <span className="font-bold">강수확률:</span> {weather.rain_probability}%
              </p>
              <p className="text-sm">
                <span className="font-bold">자외선 지수:</span> {weather.uv_index}
              </p>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-3 overflow-auto">
                {JSON.stringify(weather, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {weather && !error && (
          <p className="text-xs text-green-600 font-bold">
            ✅ 프론트엔드 ↔ 백엔드 통신 성공
          </p>
        )}
      </div>
    );
  }

  export default App;