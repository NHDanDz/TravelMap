// app/dashboard/Map/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Place, PlaceType } from '@/app/dashboard/Map/types';
import { 
  Search, Menu, X, MapPin, Star, Clock, Phone, 
  Globe, Navigation, Heart, Filter, ChevronDown, 
  Compass, Coffee, Hotel, Utensils, Landmark, Camera 
} from 'lucide-react';

// Client-only component wrapper
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  return <>{children}</>;
};

// Dynamically import Leaflet components with ssr: false
const DynamicMap = dynamic(
  () => import('./components/DynamicMap'),
  { ssr: false }
);

// Component with placeholder for SSR
const MapPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [initialSearch, setInitialSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeType, setPlaceType] = useState<PlaceType>('restaurant');
  const [searchRadius, setSearchRadius] = useState('1000');
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Check for client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get current location
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          
          if (!initialSearch) {
            handleLocationSelect(latitude, longitude);
            setInitialSearch(true);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Browser does not support geolocation');
    }
  }, [initialSearch]);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        type: placeType,
        radius: searchRadius
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

  const handleNearbySearch = useCallback(async () => {
    if (!currentLocation) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: currentLocation[0].toString(),
        lng: currentLocation[1].toString(),
        type: placeType,
        radius: searchRadius
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
  }, [currentLocation, placeType, searchRadius]);

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setShowPlaceDetails(true);
  };

  const handlePlaceDetailsClose = () => {
    setShowPlaceDetails(false);
    setSelectedPlace(null);
  };

  // Safe image URL getter
  const getPlaceImageUrl = (place: Place) => {
    if (place.photo?.images?.large?.url) {
      return place.photo.images.large.url;
    }
    return '/images/placeholder-image.jpg'; // Fallback image
  };

  // Render server-side placeholder if not client
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Compass className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">TravelSense Map</h1>
          <p className="text-gray-600">Loading map application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-xl font-bold text-blue-600 flex items-center">
                <Compass className="w-6 h-6 mr-2" />
                TravelSense
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/dashboard/Map" className="text-sm font-medium text-blue-600">
                Khám phá
              </a>
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Lịch trình
              </a>
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Đã lưu
              </a>
              <a href="#" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Đăng nhập
              </a>
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-gray-600 focus:outline-none"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              {showMobileFilters ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'w-full md:w-1/4' : 'hidden'} bg-white shadow-sm overflow-auto z-10 md:min-h-[calc(100vh-64px)] md:max-h-[calc(100vh-64px)]`}>
          {/* Sidebar content */}
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm..."
                className="w-full px-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
            
            {/* Filters */}
            {showMobileFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Loại địa điểm</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button 
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${placeType === 'restaurant' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setPlaceType('restaurant')}
                  >
                    <Utensils className="w-5 h-5 mb-1" />
                    <span className="text-xs">Ăn uống</span>
                  </button>
                  <button 
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${placeType === 'hotel' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setPlaceType('hotel')}
                  >
                    <Hotel className="w-5 h-5 mb-1" />
                    <span className="text-xs">Lưu trú</span>
                  </button>
                  <button 
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${placeType === 'tourist_attraction' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setPlaceType('tourist_attraction')}
                  >
                    <Landmark className="w-5 h-5 mb-1" />
                    <span className="text-xs">Du lịch</span>
                  </button>
                </div>
                
                <h3 className="font-medium text-gray-700 mb-2">Bán kính tìm kiếm</h3>
                <div className="flex space-x-2 mb-4">
                  {['500', '1000', '2000', '5000'].map((radius) => (
                    <button
                      key={radius}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${searchRadius === radius ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                      onClick={() => setSearchRadius(radius)}
                    >
                      {radius === '500' ? '500m' : 
                       radius === '1000' ? '1km' : 
                       radius === '2000' ? '2km' : '5km'}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  onClick={handleNearbySearch}
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            )}
            
            {/* Places List */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Địa điểm gần đây</h2>
                {places.length > 0 && (
                  <span className="text-sm text-gray-500">{places.length} kết quả</span>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : places.length > 0 ? (
                <div className="space-y-4">
                  {places.map((place) => (
                    <div 
                      key={place.id} 
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handlePlaceSelect(place)}
                    >
                      <div className="flex md:flex-col">
                        <div className="relative h-24 w-24 md:h-40 md:w-full">
                          {place.photo ? (
                            <Image
                              src={getPlaceImageUrl(place)}
                              alt={place.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100px, 300px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Camera className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-3">
                          <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">{place.name}</h3>
                          {place.details?.address && (
                            <div className="flex items-start text-sm text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1 text-gray-500 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{place.details.address}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="ml-1 text-sm font-medium">{place.rating}</span>
                            </div>
                            <span className="text-xs py-1 px-2 bg-blue-100 text-blue-700 rounded-full">
                              {place.type === 'restaurant' ? 'Nhà hàng' : 
                              place.type === 'hotel' ? 'Khách sạn' : 
                              place.type === 'cafe' ? 'Quán café' : 
                              place.type === 'tourist_attraction' ? 'Du lịch' : place.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có địa điểm nào. Vui lòng chọn một vị trí trên bản đồ để tìm kiếm.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Map View - Wrapped in ClientOnly */}
        <div className={`${showSidebar ? 'w-full md:w-3/4' : 'w-full'} relative min-h-[500px] md:min-h-[calc(100vh-64px)]`}>
          <ClientOnly>
            <DynamicMap 
              currentLocation={currentLocation}
              places={places}
              onLocationSelect={handleLocationSelect}
              loading={loading}
              selectedPlace={selectedPlace}
              showPlaceDetails={showPlaceDetails}
              onPlaceSelect={handlePlaceSelect}
              onPlaceDetailsClose={handlePlaceDetailsClose}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  );
};

export default MapPage;