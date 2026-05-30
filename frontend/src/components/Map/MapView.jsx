import { useRef, useEffect } from 'react';

const DAEJEON_LAT = 36.3504;
const DAEJEON_LNG = 127.3845;

export default function MapView() {
  const mapRef = useRef(null);

  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !mapRef.current) return;

    const center = new kakao.maps.LatLng(DAEJEON_LAT, DAEJEON_LNG);
    const map = new kakao.maps.Map(mapRef.current, { center, level: 5 });

    const marker = new kakao.maps.Marker({ position: center });
    marker.setMap(map);
  }, []);

  return (
    <div className="w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
