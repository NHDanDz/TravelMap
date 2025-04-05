'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Place, PlaceType } from './types';
 
// Import MapComponent động để tránh lỗi SSR với Leaflet
const MapComponent = dynamic(
  () => import('./components/MapComponent'),
  {
    loading: () => <div className="w-full h-[calc(100vh-64px)] bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

export default function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [initialSearch, setInitialSearch] = useState(false);

  // Lấy vị trí hiện tại khi component được mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          
          // Tự động tìm kiếm nhà hàng gần đó khi vừa vào trang
          if (!initialSearch) {
            handleLocationSelect(latitude, longitude);
            setInitialSearch(true);
          }
        },
        (error) => {
          console.error('Lỗi khi lấy vị trí:', error);
        }
      );
    } else {
      console.error('Trình duyệt không hỗ trợ geolocation');
    }
  }, [initialSearch]);
  
  const handleLocationSelect = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        type: 'restaurant', // Mặc định tìm nhà hàng
        radius: '1000'      // Bán kính 1km
      });
  
      const response = await fetch(`/api/places?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
  
      const data = await response.json() as Place[];
      setPlaces(data);
    } catch (error) {
      console.error('Error searching nearby places:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] relative">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="p-4 rounded-md bg-white shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-t-blue-500 rounded-full animate-spin"></div>
              <p>Đang tải địa điểm...</p>
            </div>
          </div>
        </div>
      )}
      
      <MapComponent 
        places={places} 
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
}