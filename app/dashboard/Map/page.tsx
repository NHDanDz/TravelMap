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

// Đảm bảo tải Leaflet CSS 
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Import Leaflet dynamically
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Import custom component với explicit type
const LocationMarkerComponent = dynamic<{
  onLocationSelect?: (lat: number, lng: number) => void;
}>(
  () => import('./components/DynamicMapComponents').then((mod) => mod.LocationMarkerComponent),
  { ssr: false }
);

// Định nghĩa RoutingMachineComponent với đúng kiểu dữ liệu
const RoutingMachineComponent = dynamic<{
  startPoint: [number, number];
  endPoint: [number, number];
}>(
  () => import('./components/DynamicMapComponents').then((mod) => mod.RoutingMachineComponent),
  { ssr: false }
);

// Leaflet icon factory function
const createCategoryIcon = (category: string) => {
  // This function will only run on client side
  if (typeof window === 'undefined') return null;
  
  // Dynamically import L from leaflet only on client side
  const L = require('leaflet');
  
  const colors: {[key: string]: string} = {
    restaurant: '#FF5733',
    fast_food: '#FFC300',
    cafe: '#C70039',
    bar: '#900C3F',
    hotel: '#581845',
    tourist_attraction: '#2E86C1',
    museum: '#17A589',
    entertainment: '#D35400',
    mall: '#8E44AD',
    hospital: '#E74C3C',
    default: '#3498DB',
  };

  const baseCategory = category.split('_')[0];
  const color = colors[baseCategory] || colors.default;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component chính cho trang Map
const MapPage = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [initialSearch, setInitialSearch] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States cho filter
  const [placeType, setPlaceType] = useState<PlaceType>('restaurant');
  const [searchRadius, setSearchRadius] = useState('1000');
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Kiểm tra client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lấy vị trí hiện tại khi component được mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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

  // Helper để hiển thị ảnh an toàn
  const getPlaceImageUrl = (place: Place) => {
    if (place.photo?.images?.large?.url) {
      return place.photo.images.large.url;
    }
    return '/images/placeholder-image.jpg'; // Đường dẫn tới ảnh dự phòng
  };

  // Render Map chỉ ở phía client
  const renderMap = () => {
    if (!isClient || !currentLocation) return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center p-4">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    );

    return (
      <MapContainer
        center={currentLocation}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Current Location Marker */}
        <Marker position={currentLocation}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>
        
        {/* Location Selection Marker */}
        <LocationMarkerComponent onLocationSelect={handleLocationSelect} />
        
        {/* Place Markers */}
        {places.map((place, index) => (
          <Marker
            key={`${place.name}-${index}`}
            position={[Number(place.latitude), Number(place.longitude)]}
            icon={createCategoryIcon(place.type)}
            eventHandlers={{
              click: () => handlePlaceSelect(place)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-medium mb-1">{place.name}</h3>
                {place.photo && (
                  <div className="relative w-full h-32 mb-2 overflow-hidden rounded">
                    <Image
                      src={getPlaceImageUrl(place)}
                      alt={place.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                )}
                <button 
                  onClick={() => handlePlaceSelect(place)}
                  className="mt-2 w-full py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Xem chi tiết
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Routing Machine (conditionally rendered) */}
        {selectedPlace && currentLocation && (
          <RoutingMachineComponent
            startPoint={currentLocation}
            endPoint={[Number(selectedPlace.latitude), Number(selectedPlace.longitude)]}
          />
        )}
      </MapContainer>
    );
  };

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
        
        {/* Map View */}
        <div className={`${showSidebar ? 'w-full md:w-3/4' : 'w-full'} relative min-h-[500px] md:min-h-[calc(100vh-64px)]`}>
          {/* Toggle Sidebar Button (visible on desktop) */}
          <button 
            className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-md p-2 hidden md:block"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? (
              <ChevronDown className="w-5 h-5 text-gray-600 transform -rotate-90" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 transform rotate-90" />
            )}
          </button>
          
          {/* Map */}
          {renderMap()}
          
          {/* Place Details Panel */}
          {showPlaceDetails && selectedPlace && (
            <div className="absolute top-0 right-0 w-full md:w-1/3 h-full bg-white shadow-lg overflow-y-auto z-[1001]">
              <div className="relative">
                {selectedPlace.photo ? (
                  <div className="relative h-48">
                    <Image
                      src={getPlaceImageUrl(selectedPlace)}
                      alt={selectedPlace.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={handlePlaceDetailsClose}
                  className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  aria-label="Đóng"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <div className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full inline-block mb-2">
                    {selectedPlace.type === 'restaurant' ? 'Nhà hàng' : 
                     selectedPlace.type === 'hotel' ? 'Khách sạn' : 
                     selectedPlace.type === 'cafe' ? 'Quán café' : 
                     selectedPlace.type === 'tourist_attraction' ? 'Du lịch' : selectedPlace.type}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{selectedPlace.name}</h2>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-4">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="ml-1 font-medium">{selectedPlace.rating}</span>
                  </div>
                  {selectedPlace.details?.cuisine && (
                    <span className="text-sm text-gray-600">
                      {selectedPlace.details.cuisine}
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 mb-6">
                  {selectedPlace.details?.address && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{selectedPlace.details.address}</span>
                    </div>
                  )}
                  
                  {selectedPlace.details?.openingHours && (
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{selectedPlace.details.openingHours}</span>
                    </div>
                  )}
                  
                  {selectedPlace.details?.phone && (
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{selectedPlace.details.phone}</span>
                    </div>
                  )}
                  
                  {selectedPlace.details?.website && (
                    <div className="flex items-start">
                      <Globe className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <a href={selectedPlace.details.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
                
                {selectedPlace.details?.description && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-800 mb-2">Mô tả</h3>
                    <p className="text-gray-600">{selectedPlace.details.description}</p>
                  </div>
                )}
                
                {/* Button Actions */}
                <div className="flex space-x-3">
                  <button 
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center hover:bg-blue-700"
                    onClick={() => {
                      // Đã có routing hiển thị trên bản đồ, chỉ cần đóng panel để xem rõ hơn
                      handlePlaceDetailsClose();
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Chỉ đường
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center hover:bg-gray-200">
                    <Heart className="w-4 h-4 mr-2" />
                    Lưu lại
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 flex justify-between">
        <button className="flex flex-col items-center text-blue-600">
          <Compass className="w-6 h-6" />
          <span className="text-xs mt-1">Khám phá</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <Navigation className="w-6 h-6" />
          <span className="text-xs mt-1">Lịch trình</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <Heart className="w-6 h-6" />
          <span className="text-xs mt-1">Đã lưu</span>
        </button>
      </div>
    </div>
  );
};

export default MapPage;