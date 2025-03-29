// app/dashboard/Map/components/MapContainer.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Import động các component bản đồ để tránh lỗi SSR
const MapComponent = dynamic(
  () => import('./MapComponent'),
  {
    loading: () => <div className="w-full h-[calc(100vh-125px)] bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

const SatelliteMapComponent = dynamic(
  () => import('./SatelliteMapComponent'),
  {
    loading: () => <div className="w-full h-[calc(100vh-125px)] bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

export default function MapContainer() {
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('normal');
  const [searchCoords, setSearchCoords] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });
  const [goToCoords, setGoToCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Xử lý tìm kiếm tọa độ
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra và chuyển đổi tọa độ
    const lat = parseFloat(searchCoords.lat);
    const lng = parseFloat(searchCoords.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Vui lòng nhập tọa độ hợp lệ');
      return;
    }
    
    // Kiểm tra phạm vi tọa độ
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Tọa độ không hợp lệ. Vĩ độ phải từ -90 đến 90, kinh độ phải từ -180 đến 180.');
      return;
    }
    
    // Lưu tọa độ vào state để các component bản đồ đọc
    setGoToCoords({ lat, lng });
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)]">
      {/* Thanh công cụ bản đồ */}
      <div className="bg-white p-4 shadow-md flex flex-wrap items-center gap-4">
        {/* Chuyển đổi kiểu bản đồ */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Kiểu bản đồ:</span>
          <div className="flex border rounded overflow-hidden">
            <button
              className={`px-3 py-1 text-sm ${mapType === 'normal' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setMapType('normal')}
            >
              Thường
            </button>
            <button
              className={`px-3 py-1 text-sm ${mapType === 'satellite' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setMapType('satellite')}
            >
              Vệ tinh
            </button>
          </div>
        </div>

        {/* Form tìm kiếm tọa độ */}
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1">
            <label htmlFor="lat" className="text-sm font-medium">Vĩ độ:</label>
            <input
              id="lat"
              type="text"
              placeholder="21.0285"
              className="border px-2 py-1 rounded w-24 text-sm"
              value={searchCoords.lat}
              onChange={(e) => setSearchCoords(prev => ({ ...prev, lat: e.target.value }))}
            />
          </div>
          <div className="flex items-center space-x-1">
            <label htmlFor="lng" className="text-sm font-medium">Kinh độ:</label>
            <input
              id="lng"
              type="text"
              placeholder="105.8542"
              className="border px-2 py-1 rounded w-24 text-sm"
              value={searchCoords.lng}
              onChange={(e) => setSearchCoords(prev => ({ ...prev, lng: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Container cho bản đồ */}
      <div className="flex-1 relative">
        {mapType === 'normal' ? (
          <MapComponent goToCoords={goToCoords} />
        ) : (
          <SatelliteMapComponent goToCoords={goToCoords} />
        )}
      </div>
    </div>
  );
}