// app/dashboard/Map/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Compass, 
  MapPin, 
  Search,  
  Navigation, 
  Bookmark,
  Settings, 
  X, 
  Globe, 
  Star
} from 'lucide-react';
import { AuthService } from '@/lib/auth';

// Lazy-load map component to avoid SSR issues
const DynamicMapComponent = dynamic(
  () => import('./components/ModernMapboxMap'),
  { 
    ssr: false,
    loading: () => <MapLoadingState />
  }
);

// Modern loading component
const MapLoadingState = () => (
  <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="text-center space-y-6 p-8">
      <div className="relative">
        <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Compass className="w-10 h-10 text-blue-600 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TravelSense Map
        </h1>
        <p className="text-gray-600 text-lg">Đang khởi tạo bản đồ thông minh...</p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Globe className="w-4 h-4 animate-pulse" />
          <span>Kết nối với dịch vụ bản đồ</span>
        </div>
      </div>
    </div>
  </div>
);

// Quick action card component
const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  color = "blue" 
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  onClick: () => void;
  color?: string;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
  };

  return (
    <button
      onClick={onClick}
      className={`
        p-4 rounded-xl bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]}
        text-white shadow-lg hover:shadow-xl transform hover:scale-105 
        transition-all duration-200 text-left group w-full
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-white/80 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

// Main map page component
export default function ModernMapPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
  
  // Get user location
  useEffect(() => {
    let isMounted = true;
    
    const getUserLocation = async () => {
      try {
        setIsLocationLoading(true);
        setLocationError(null);
        
        if (!navigator.geolocation) {
          throw new Error('Trình duyệt không hỗ trợ định vị');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { 
              enableHighAccuracy: true, 
              timeout: 10000, 
              maximumAge: 300000 // 5 minutes
            }
          );
        });

        if (isMounted) {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        }
      } catch (error) {
        console.error('Lỗi xác định vị trí:', error);
        
        if (isMounted) {
          setLocationError('Không thể xác định vị trí của bạn');
          // Use default location (Hanoi)
          setUserLocation([21.0285, 105.8542]);
        }
      } finally {
        if (isMounted) {
          setIsLocationLoading(false);
        }
      }
    };
    
    getUserLocation();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Load saved places
  useEffect(() => {
    const loadSavedPlaces = () => {
      try {
        const userId = currentUser?.id;
        if (userId) {
          const saved = localStorage.getItem(`saved_places_${userId}`);
          if (saved) {
            setSavedPlaces(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error('Error loading saved places:', error);
      }
    };

    loadSavedPlaces();
  }, [currentUser]);

  // Quick action handlers
  const handleQuickSearch = () => {
    // Focus on search input
    const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]');
    if (searchInput) {
      (searchInput as HTMLInputElement).focus();
    }
  };

  const handleNearbyPlaces = () => {
    // Trigger nearby places search
    const event = new CustomEvent('triggerNearbySearch');
    window.dispatchEvent(event);
  };

  const handleDirections = () => {
    // Show directions panel
    const event = new CustomEvent('showDirections');
    window.dispatchEvent(event);
  };

  const handleSavedPlaces = () => {
    // Show saved places
    const event = new CustomEvent('showSavedPlaces');
    window.dispatchEvent(event);
  };

  if (isLocationLoading) {
    return <MapLoadingState />;
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-white/95 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Khám phá bản đồ
                  </h1>
                  <p className="text-sm text-gray-600">
                    {userLocation ? 'Vị trí đã xác định' : 'Sử dụng vị trí mặc định'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Quick actions toggle */}
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className={`
                  p-3 rounded-xl border transition-all duration-200
                  ${showQuickActions 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* User info */}
              {currentUser && (
                <div className="flex items-center space-x-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{currentUser.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="absolute top-20 right-4 z-40 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h2>
            <button
              onClick={() => setShowQuickActions(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={Search}
              title="Tìm kiếm"
              description="Tìm địa điểm"
              onClick={handleQuickSearch}
              color="blue"
            />
            <QuickActionCard
              icon={MapPin}
              title="Gần đây"
              description="Địa điểm gần"
              onClick={handleNearbyPlaces}
              color="green"
            />
            <QuickActionCard
              icon={Navigation}
              title="Chỉ đường"
              description="Tìm đường đi"
              onClick={handleDirections}
              color="purple"
            />
            <QuickActionCard
              icon={Bookmark}
              title="Đã lưu"
              description={`${savedPlaces.length} địa điểm`}
              onClick={handleSavedPlaces}
              color="orange"
            />
          </div>

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{savedPlaces.length}</div>
                <div className="text-xs text-gray-500">Đã lưu</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {userLocation ? '1' : '0'}
                </div>
                <div className="text-xs text-gray-500">Vị trí</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-xs text-gray-500">Khám phá</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Error Toast */}
      {locationError && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{locationError}</span>
          </div>
        </div>
      )}

      {/* Map Component */}
      {userLocation && (
        <DynamicMapComponent 
          initialLocation={userLocation}
          onLocationUpdate={setUserLocation}
          savedPlaces={savedPlaces}
          onSavedPlacesUpdate={setSavedPlaces}
        />
      )}

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Trực tuyến</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">
                {userLocation ? 'Vị trí chính xác' : 'Vị trí mặc định'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-700">Sẵn sàng khám phá</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}