import { useRef, useEffect, useState } from 'react';
import { api } from '../../api/client';
import { resolveApiError } from '../../utils/apiErrorHandler';

const DAEJEON_LAT = 36.3504;
const DAEJEON_LNG = 127.3845;

export default function CustomRouteDraw({ onSaved }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', context_tag: '', is_public: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;
    const center = new kakao.maps.LatLng(DAEJEON_LAT, DAEJEON_LNG);
    mapInstance.current = new kakao.maps.Map(mapRef.current, { center, level: 5 });
  }, []);

  const clearMap = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
  };

  const startDrawing = () => {
    setDrawing(true);
    setPoints([]);
    clearMap();
  };

  const undoLastPoint = () => {
    if (markersRef.current.length === 0) return;
    const lastMarker = markersRef.current.pop();
    lastMarker.setMap(null);
    setPoints((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    const { kakao } = window;
    const map = mapInstance.current;
    if (!kakao || !map || !drawing) return;

    const listener = kakao.maps.event.addListener(map, 'click', (e) => {
      const latlng = e.latLng;
      setPoints((prev) => {
        const next = [...prev, { lat: latlng.getLat(), lng: latlng.getLng() }];
        const marker = new kakao.maps.Marker({
          position: latlng,
          title: next.length === 1 ? '출발' : `${next.length}`,
        });
        marker.setMap(map);
        markersRef.current.push(marker);
        return next;
      });
    });

    return () => kakao.maps.event.removeListener(map, 'click', listener);
  }, [drawing]);

  useEffect(() => {
    const { kakao } = window;
    const map = mapInstance.current;
    if (!kakao || !map || points.length < 2) return;
    if (polylineRef.current) polylineRef.current.setMap(null);
    const path = points.map((p) => new kakao.maps.LatLng(p.lat, p.lng));
    polylineRef.current = new kakao.maps.Polyline({
      path,
      strokeWeight: 5,
      strokeColor: '#FF6B35',
      strokeOpacity: 0.9,
      strokeStyle: 'solid',
      endArrow: true,
    });
    polylineRef.current.setMap(map);
  }, [points]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('경로 이름을 입력해주세요.'); return; }
    setSaving(true);
    setError('');
    try {
      const waypoints = points.slice(1, -1);
      const { data } = await api.post('/api/routes/custom', {
        name: form.name,
        start_lat: points[0].lat,
        start_lng: points[0].lng,
        end_lat: points[points.length - 1].lat,
        end_lng: points[points.length - 1].lng,
        waypoints,
        context_tag: form.context_tag || null,
        is_public: form.is_public,
      });
      setShowModal(false);
      setDrawing(false);
      clearMap();
      setPoints([]);
      setForm({ name: '', context_tag: '', is_public: false });
      alert(`"${form.name}" 경로가 저장되었습니다.`);
      if (onSaved) onSaved();
    } catch (err) {
      setError(resolveApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        {!drawing ? (
          <button
            onClick={startDrawing}
            className="bg-primary text-white px-5 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
          >
            경로 그리기 시작
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              disabled={points.length < 2}
              className="bg-primary text-white px-5 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-40"
            >
              저장 ({points.length}개 지점)
            </button>
            <button
              onClick={undoLastPoint}
              disabled={points.length === 0}
              className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold shadow-lg disabled:opacity-40"
            >
              되돌리기
            </button>
            <button
              onClick={() => { setDrawing(false); clearMap(); setPoints([]); }}
              className="bg-gray-500 text-white px-4 py-2 rounded-full font-bold shadow-lg"
            >
              취소
            </button>
          </div>
        )}
      </div>

      {drawing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow text-sm text-gray-600 z-10">
          지도를 클릭해 경유지를 추가하세요. 첫 클릭=출발지, 마지막=도착지
        </div>
      )}

      {showModal && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-bold text-secondary mb-1">경로 저장</h2>
            <p className="text-xs text-gray-400 mb-4">
              출발지 1개 · 경유지 {points.length - 2}개 · 도착지 1개
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="경로 이름 *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="태그 (예: 산책, 출근)"
                value={form.context_tag}
                onChange={(e) => setForm((f) => ({ ...f, context_tag: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.is_public}
                  onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))}
                />
                공개 경로로 저장
              </label>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-bold disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
