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
              onClick={() => { setDrawing(false); clearMap(); setPoints([]); }}
              className="bg-gray-500 text-white px-4 py-2 rounded-full font-bold shadow-lg"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
