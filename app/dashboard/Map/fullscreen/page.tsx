// app/dashboard/Map/fullscreen/page.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';

// Dynamic imports for map components
const MapComponent = dynamic(
  () => import('../components/MapComponent'),
  {
    loading: () => <div className="w-full h-screen bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

const SatelliteMapComponent = dynamic(
  () => import('../components/SatelliteMapComponent'),
  {
    loading: () => <div className="w-full h-screen bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

export default function FullscreenMapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('satellite');
  const [detectionMode, setDetectionMode] = useState<boolean>(false);
  const [goToCoords, setGoToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchCoords, setSearchCoords] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });
  
  // Read parameters from URL on initial load
  useEffect(() => {
    // Get map type
    const typeParam = searchParams.get('type');
    if (typeParam === 'normal' || typeParam === 'satellite') {
      setMapType(typeParam);
    }
    
    // Get detection mode
    const detectionParam = searchParams.get('detection');
    if (detectionParam === 'true') {
      setDetectionMode(true);
    }
    
    // Get coordinates
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setGoToCoords({ lat, lng });
        setSearchCoords({ lat: latParam, lng: lngParam });
      }
    }
  }, [searchParams]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and convert coordinates
    const lat = parseFloat(searchCoords.lat);
    const lng = parseFloat(searchCoords.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Vui lòng nhập tọa độ hợp lệ');
      return;
    }
    
    // Check coordinate range
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Tọa độ không hợp lệ. Vĩ độ phải từ -90 đến 90, kinh độ phải từ -180 đến 180.');
      return;
    }
    
    // Update state with coordinates
    setGoToCoords({ lat, lng });
  };

  // Exit fullscreen and return to dashboard
  const exitFullscreen = () => {
    router.push('/dashboard/Map');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* Map container (full screen) */}
      <div className="absolute inset-0 w-full h-full">
      {mapType === 'normal' ? (
        <MapComponent 
          goToCoords={goToCoords} 
          detectionMode={detectionMode} 
          fullscreen={true} 
        />
      ) : (
        <SatelliteMapComponent 
          goToCoords={goToCoords} 
          detectionMode={detectionMode} 
          fullscreen={true}
        />
      )}
    </div>
      
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-white bg-opacity-95 backdrop-blur-md rounded-xl shadow-lg p-3 w-auto min-w-[950px] mx-auto border border-gray-100">
  <div className="flex items-center justify-between">
    {/* Map Type Section */}
    <div className="flex items-center">
      <span className="text-gray-700 font-medium mr-2 whitespace-nowrap">Bản đồ:</span>
      <div className="flex border border-gray-300 rounded-md overflow-hidden">
        <button
          className={`px-3 py-1 text-sm font-medium transition-colors duration-200 w-24 ${
            mapType === 'normal' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } border-r border-gray-300`}
          onClick={() => setMapType('normal')}
        >
          Thường
        </button>
        <button
          className={`px-3 py-1 text-sm font-medium transition-colors duration-200 w-24 ${
            mapType === 'satellite' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setMapType('satellite')}
        >
          Vệ tinh
        </button>
      </div>
    </div>

    {/* Search Form */}
    <form onSubmit={handleSearch} className="flex items-center space-x-3 mx-4">
      <div className="flex items-center">
        <span className="text-gray-700 font-medium mr-2 whitespace-nowrap">Vĩ độ:</span>
        <input
          id="fullscreen-lat"
          type="text"
          placeholder="21.0285"
          className="border border-gray-300 px-2 py-1 rounded-md text-sm w-24"
          value={searchCoords.lat}
          onChange={(e) => setSearchCoords(prev => ({ ...prev, lat: e.target.value }))}
        />
      </div>
      <div className="flex items-center">
        <span className="text-gray-700 font-medium mr-2 whitespace-nowrap">Kinh độ:</span>
        <input
          id="fullscreen-lng"
          type="text"
          placeholder="105.8542"
          className="border border-gray-300 px-2 py-1 rounded-md text-sm w-24"
          value={searchCoords.lng}
          onChange={(e) => setSearchCoords(prev => ({ ...prev, lng: e.target.value }))}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        Tìm
      </button>
    </form>
    
    {/* Exit Fullscreen Button */}
    <button
      onClick={exitFullscreen}
      className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors flex items-center whitespace-nowrap"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      Thoát toàn màn hình
    </button>
  </div>
</div>
    </div>
  );
}