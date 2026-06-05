import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { getToken } from '../../api/auth';
import { resolveApiError } from '../../utils/apiErrorHandler';
import RouteMapModal from './RouteMapModal';

export default function RouteList() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalRoute, setModalRoute] = useState(null);

  const fetchRoutes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/routes/custom');
      setRoutes(data.routes ?? []);
    } catch (err) {
      const { code, message } = resolveApiError(err);
      setError(code === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      setError('UNAUTHORIZED');
      return;
    }
    fetchRoutes();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" 경로를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      await api.delete(`/api/routes/custom/${id}`);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const { message } = resolveApiError(err);
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-surface-dark flex items-center justify-center">
        <p className="text-gray-500 dark:text-slate-400 text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (error === 'UNAUTHORIZED') {
    return (
      <div className="min-h-screen bg-neutral dark:bg-surface-dark flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 dark:text-slate-400 font-medium">로그인이 필요합니다.</p>
        <Link
          to="/login"
          className="bg-primary text-white px-6 py-2 rounded-lvl2 font-bold hover:scale-[1.02] transition-all"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-surface-dark flex flex-col items-center justify-center gap-3">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchRoutes}
          className="text-sm text-primary font-medium underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral dark:bg-surface-dark px-6 py-10 max-w-2xl mx-auto">
      {modalRoute && (
        <RouteMapModal route={modalRoute} onClose={() => setModalRoute(null)} />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary dark:text-blue-300">내 커스텀 경로</h1>
        <button
          onClick={fetchRoutes}
          className="text-sm text-primary font-medium hover:opacity-70 transition-all"
        >
          새로고침
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400 mb-4">아직 저장된 경로가 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="glass-panel p-5 flex justify-between items-start cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setModalRoute(route)}
            >
              <div>
                <h3 className="font-bold text-secondary dark:text-blue-300 text-lg">{route.name}</h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {route.context_tag && (
                    <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                      {route.context_tag}
                    </span>
                  )}
                  {route.is_public && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                      공개
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                  경유지 {Array.isArray(route.waypoints) ? route.waypoints.length : 0}개
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  저장일: {route.created_at ? new Date(route.created_at).toLocaleDateString('ko-KR') : '-'}
                </p>
                <p className="text-xs text-primary mt-1">지도에서 보기 →</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(route.id, route.name); }}
                className="text-red-500 text-sm font-medium hover:opacity-70 transition-all"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}