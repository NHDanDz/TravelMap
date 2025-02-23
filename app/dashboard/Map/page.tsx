'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Place } from './types';
 
const MapComponent = dynamic(
  () => import('./components/MapComponent'),
  {
    loading: () => <div className="w-full h-[calc(100vh-64px)] bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  
  const handleLocationSelect = (lat: number, lng: number) => {
    console.log('Vị trí được chọn:', { lat, lng });
    // Xử lý vị trí được chọn ở đây
    // Ví dụ: gọi API để lấy thông tin địa điểm, thêm marker mới, etc.
  };

  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <MapComponent 
        places={places} 
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
} 