import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { fetchCurrentWeather } from './api/weather';
import MapView from './components/Map/MapView';
import RouteCompare from './components/Route/RouteCompare';
import RouteList from './components/Route/RouteList';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [backendError, setBackendError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentWeather(36.6284, 127.4565)
      .then(() => setBackendStatus('ok'))
      .catch((err) => {
        setBackendStatus('fail');
        setBackendError(err.message || '알 수 없는 에러');
      });
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-neutral flex flex-col items-center justify-center px-6 py-10">
            <header className="text-center mb-10">
              <h1 className="text-5xl text-secondary font-extrabold mb-3">
                Weather Map System
              </h1>
              <p className="text-gray-500 font-medium text-lg">
                실시간 데이터 기반 경로 추천 시스템
              </p>
            </header>

            <div className="glass-panel p-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-primary text-3xl">wb_sunny</span>
                <h3 className="text-xl font-bold text-[#191C1E]">오늘의 추천 경로</h3>
              </div>

              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                날씨 데이터를 기반으로 최적의 이동 경로를 추천합니다.
              </p>

              <button
                onClick={() => navigate('/map')}
                className="w-full bg-primary text-white py-3 rounded-lvl2 font-bold hover:scale-[1.03] transition-all"
              >
                탐색 시작하기
              </button>
            </div>

            <div className="mt-8 h-5 flex items-center">
              {backendStatus === 'checking' && (
                <p className="text-xs text-gray-500">백엔드 연결 확인 중...</p>
              )}
              {backendStatus === 'ok' && (
                <p className="text-xs text-green-600 font-bold">백엔드 연결됨</p>
              )}
              {backendStatus === 'fail' && (
                <p className="text-xs text-red-600 font-bold" title={backendError ?? ''}>
                  백엔드 연결 실패
                </p>
              )}
            </div>
          </div>
        }
      />

      <Route path="/map" element={<MapView />} />
      <Route path="/routes" element={<RouteCompare />} />
      <Route path="/custom" element={<RouteList />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-neutral flex flex-col items-center justify-center px-6">
            <div className="glass-panel p-8 max-w-md w-full text-center">
              <span className="material-symbols-outlined text-primary text-6xl mb-4 block">
                travel_explore
              </span>
              <h2 className="text-3xl font-bold text-secondary mb-3">404</h2>
              <p className="text-gray-500 mb-8">페이지를 찾을 수 없습니다.</p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-primary text-white py-3 rounded-lvl2 font-bold hover:scale-[1.03] transition-all"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;