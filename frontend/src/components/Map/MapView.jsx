import { useRef } from 'react';

export default function MapView() {
  const mapRef = useRef(null);

  return (
    <div className="w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}