// app/dashboard/Map/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Compass } from 'lucide-react';

// Lazy-load map component to avoid SSR issues
const DynamicMapComponent = dynamic(
  () => import('./components/EnhancedMapboxMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-gray-50">
        <div className="text-center p-4">
          <Compass className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">TravelSense</h1>
          <p className="text-gray-600">Đang tải bản đồ tương tác...</p>
        </div>
      </div>
    )
  }
);

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Lỗi xác định vị trí:', error);
          // Sử dụng vị trí mặc định (Hà Nội)
          setUserLocation([21.0285, 105.8542]);
        }
      );
    } else {
      console.error('Trình duyệt không hỗ trợ định vị');
      setUserLocation([21.0285, 105.8542]);
    }
  }, []);
  
  return (
    // Important: This div needs to have a fixed height and position
    <div className="relative w-full h-[calc(100vh-64px)]">
      {userLocation ? (
        <DynamicMapComponent initialLocation={userLocation} />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-gray-50">
          <div className="text-center p-4">
            <Compass className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">TravelSense</h1>
            <p className="text-gray-600">Đang xác định vị trí của bạn...</p>
          </div>
        </div>
      )}
    </div>
  );
}