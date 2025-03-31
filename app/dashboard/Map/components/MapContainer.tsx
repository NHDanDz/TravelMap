'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Import động các component bản đồ để tránh lỗi SSR
const MapComponent = dynamic(
  () => import('./MapComponent'),
  {
    loading: () => <div className="w-full h-full min-h-[600px] bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

const SatelliteMapComponent = dynamic(
  () => import('./SatelliteMapComponent'),
  {
    loading: () => <div className="w-full h-full min-h-[600px] bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

export default function MapContainer() {
  const router = useRouter();
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('satellite');
  const [detectionMode, setDetectionMode] = useState<boolean>(false);
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
    
    // Lưu tọa độ vào state
    setGoToCoords({ lat, lng });
  };

  // Chuyển sang bản đồ toàn màn hình
  const handleFullscreen = () => {
    const params = new URLSearchParams();
    params.set('type', mapType);
    
    if (goToCoords) {
      params.set('lat', goToCoords.lat.toString());
      params.set('lng', goToCoords.lng.toString());
    }
    
    if (detectionMode) {
      params.set('detection', 'true');
    }
    
    router.push(`/dashboard/Map/fullscreen?${params.toString()}`);
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Controls overlay - đảm bảo nổi trên cùng so với bản đồ */}
      <div className="bg-white p-4 shadow-md border-b border-gray-200 z-10 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
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

            <button
              className={`px-3 py-1 rounded text-sm font-medium flex items-center ${
                detectionMode 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setDetectionMode(!detectionMode)}
            >
              {detectionMode ? (
                <> 
                </>
              ) : (
                <> 
                </>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Form tìm kiếm tọa độ */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="flex items-center">
                <label htmlFor="lat" className="text-sm font-medium mr-1">Vĩ độ:</label>
                <input
                  id="lat"
                  type="text"
                  placeholder="21.0285"
                  className="border px-2 py-1 rounded w-24 text-sm"
                  value={searchCoords.lat}
                  onChange={(e) => setSearchCoords(prev => ({ ...prev, lat: e.target.value }))}
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="lng" className="text-sm font-medium mr-1">Kinh độ:</label>
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
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Tìm kiếm
              </button>
            </form>

            {/* Fullscreen button */}
            <button
              onClick={handleFullscreen}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
              Toàn màn hình
            </button>
          </div>
        </div>
      </div>

      {/* Map container - đảm bảo chiếm toàn bộ phần còn lại của container */}
      <div className="flex-1 relative min-h-[500px]">
        {mapType === 'normal' ? (
          <MapComponent 
            goToCoords={goToCoords} 
            detectionMode={detectionMode} 
          />
        ) : (
          <SatelliteMapComponent 
            goToCoords={goToCoords} 
            detectionMode={detectionMode}
          />
        )}
      </div>
    </div>
  );
}