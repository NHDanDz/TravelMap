// app/trip-planner/[id]/map/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { 
  MapPin, ChevronLeft, Square, Eye, EyeOff, Maximize2, Minimize2, Activity,  Share,   Map
} from 'lucide-react';
import TripMapComponent from './components/TripMapComponent';
import TripTimelinePanel from './components/TripTimelinePanel';
import TripMapControls from './components/TripMapControls';
import { useMapUrlParams } from './hooks/useMapUrlParams';

// Types
interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: string;
  longitude: string;
  image: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  openingHours?: string;
  rating?: number;
  category?: {
    id: number;
    name: string;
    icon?: string;
  };
  photos?: any[];
  reviews?: any[];
  website?: string;
  contactInfo?: string;
  priceLevel?: number;
  avgDurationMinutes?: number;
  description?: string;
}

interface Day {
  dayNumber: number;
  date: string;
  places: Place[];
  weather?: any;
  notes?: string;
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  numDays: number;
  days: Day[];
  status: 'draft' | 'planned' | 'completed';
  description?: string;
  city?: {
    id: number;
    name: string;
    country: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
  };
  user?: {
    id: number;
    username: string;
    fullName?: string;
  };
  tags?: string[];
  estimatedBudget?: number;
  travelCompanions?: number;
}

interface MapViewState {
  activeDay: number;
  showRoute: boolean;
  showAllDays: boolean;
  followRoute: boolean;
  mapStyle: string;
  showTimeline: boolean;
  fullScreen: boolean;
}

// Toast notification helper
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-[9999] transform transition-all duration-300 flex items-center space-x-2 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  }`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="w-full h-full border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Map className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Đang tải bản đồ lịch trình</h3>
      <p className="text-gray-600">Đang chuẩn bị hiển thị chuyến đi của bạn...</p>
    </div>
  </div>
);
export default function TripMapPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  const { params: urlParams, updateParams } = useMapUrlParams();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedPlace, setHighlightedPlace] = useState<string | null>(null);
  
  // Map view state with URL parameter integration
  const [mapViewState, setMapViewState] = useState<MapViewState>({
    activeDay: urlParams.day || 1,
    showRoute: urlParams.route || true,
    showAllDays: false,
    followRoute: false,
    mapStyle: urlParams.style || 'streets-v12',
    showTimeline: true,
    fullScreen: false
  });

  // Load trip data
  useEffect(() => {
    const loadTripData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/trips/${tripId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trip data');
        }
        
        const tripData = await response.json();
        console.log('Trip data loaded:', tripData);
        
        // Validate that places have coordinates
        const validatedTrip = {
          ...tripData,
          days: tripData.days.map((day: Day) => ({
            ...day,
            places: day.places.filter((place: Place) => {
              const lat = parseFloat(place.latitude);
              const lng = parseFloat(place.longitude);
              return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
            })
          }))
        };
        
        setTrip(validatedTrip);
        
        // Handle URL parameters after trip is loaded
        if (urlParams.day && validatedTrip.days.find((day: Day) => day.dayNumber === urlParams.day)) {
          setMapViewState(prev => ({ ...prev, activeDay: urlParams.day! }));
        } else {
          // Set active day to first day with places
          const firstDayWithPlaces = validatedTrip.days.find((day: Day) => day.places.length > 0);
          if (firstDayWithPlaces) {
            setMapViewState(prev => ({ ...prev, activeDay: firstDayWithPlaces.dayNumber }));
          }
        }
        
        // Handle place highlighting from URL
        if (urlParams.place) {
          setHighlightedPlace(urlParams.place);
          // Auto-switch to the day containing this place
          const dayWithPlace = validatedTrip.days.find((day: Day) => 
            day.places.some((place: Place) => place.id === urlParams.place)
          );
          if (dayWithPlace) {
            setMapViewState(prev => ({ ...prev, activeDay: dayWithPlace.dayNumber }));
          }
        }
        
        // Handle route parameter
        if (urlParams.route !== undefined) {
          setMapViewState(prev => ({ ...prev, showRoute: urlParams.route! }));
        }
        
      } catch (err) {
        console.error('Error loading trip:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    };
    
    if (tripId) {
      loadTripData();
    }
  }, [tripId, urlParams.day, urlParams.place, urlParams.route]);

  // Handle map view state changes
  const updateMapViewState = useCallback((updates: Partial<MapViewState>) => {
    setMapViewState(prev => ({ ...prev, ...updates }));
    
    // Update URL parameters
    const urlUpdates: any = {};
    if (updates.activeDay !== undefined) urlUpdates.day = updates.activeDay;
    if (updates.showRoute !== undefined) urlUpdates.route = updates.showRoute;
    if (updates.mapStyle !== undefined) urlUpdates.style = updates.mapStyle;
    
    if (Object.keys(urlUpdates).length > 0) {
      updateParams(urlUpdates, true);
    }
  }, [updateParams]);

  // Handle day change
  const handleDayChange = useCallback((dayNumber: number) => {
    updateMapViewState({ activeDay: dayNumber });
  }, [updateMapViewState]);

  // Handle route simulation
  const handleRouteSimulation = useCallback(() => {
    if (!trip) return;
    
    const currentDay = trip.days.find(day => day.dayNumber === mapViewState.activeDay);
    if (!currentDay || currentDay.places.length < 2) {
      showToast('Cần ít nhất 2 địa điểm để mô phỏng tuyến đường', 'info');
      return;
    }
    
    updateMapViewState({ followRoute: !mapViewState.followRoute });
    showToast(
      mapViewState.followRoute ? 'Đã dừng mô phỏng tuyến đường' : 'Bắt đầu mô phỏng tuyến đường',
      'info'
    );
  }, [trip, mapViewState.activeDay, mapViewState.followRoute, updateMapViewState]);

  // Handle sharing
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `Bản đồ chuyến đi: ${trip?.name}`,
        text: `Xem bản đồ lịch trình cho chuyến đi ${trip?.destination}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết!', 'success');
    }
  }, [trip]);

  // Calculate trip statistics
  const tripStats = React.useMemo(() => {
    if (!trip) return null;
    
    const totalPlaces = trip.days.reduce((sum, day) => sum + day.places.length, 0);
    const daysWithPlaces = trip.days.filter(day => day.places.length > 0).length;
    const avgPlacesPerDay = daysWithPlaces > 0 ? (totalPlaces / daysWithPlaces).toFixed(1) : '0';
    
    return {
      totalPlaces,
      daysWithPlaces,
      avgPlacesPerDay,
      totalDays: trip.numDays
    };
  }, [trip]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm">
          <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error || 'Không tìm thấy lịch trình'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error ? 'Có lỗi xảy ra khi tải dữ liệu.' : 'Lịch trình bạn đang tìm kiếm không tồn tại.'}
          </p>
          <Link
            href={`/trip-planner/${tripId}`}
            className="inline-flex items-center py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            <span>Quay lại lịch trình</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${mapViewState.fullScreen ? 'fixed inset-0 z-50' : 'h-screen'} bg-gray-900 flex flex-col map-page-container`}>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 relative z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href={`/trip-planner/${tripId}`} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                  <Map className="w-5 h-5 mr-2 text-blue-600" />
                  {trip.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{trip.destination}</span>
                  </div>
                  {tripStats && (
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-1" />
                      <span>{tripStats.totalPlaces} địa điểm</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Header Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Chia sẻ"
              >
                <Share className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => updateMapViewState({ fullScreen: !mapViewState.fullScreen })}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={mapViewState.fullScreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
                {mapViewState.fullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative min-h-0">
        {/* Timeline Panel */}
        {mapViewState.showTimeline && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col relative z-10 timeline-panel">
            <TripTimelinePanel
              trip={trip}
              activeDay={mapViewState.activeDay}
              onDayChange={handleDayChange}
              mapViewState={mapViewState}
              onMapViewStateChange={updateMapViewState}
            />
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 relative min-w-0">
          <TripMapComponent
            trip={trip}
            mapViewState={mapViewState}
            onMapViewStateChange={updateMapViewState}
            highlightedPlace={highlightedPlace}
            onPlaceHighlight={setHighlightedPlace}
            initialCenter={urlParams.lat && urlParams.lng ? [urlParams.lng, urlParams.lat] : undefined}
            initialZoom={urlParams.zoom}
          />

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-20">
            <TripMapControls
              mapViewState={mapViewState}
              onMapViewStateChange={updateMapViewState}
              onRouteSimulation={handleRouteSimulation}
              trip={trip}
            />
          </div>

          {/* Toggle Timeline Button */}
          <button
            onClick={() => updateMapViewState({ showTimeline: !mapViewState.showTimeline })}
            className="absolute top-4 left-4 z-20 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
            title={mapViewState.showTimeline ? "Ẩn dòng thời gian" : "Hiện dòng thời gian"}
          >
            {mapViewState.showTimeline ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {/* Route Simulation Status */}
          {mapViewState.followRoute && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                <span className="font-medium">Đang mô phỏng tuyến đường</span>
                <button
                  onClick={() => updateMapViewState({ followRoute: false })}
                  className="p-1 hover:bg-blue-700 rounded transition-colors"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Day Stats Overlay */}
          {trip.days.find(day => day.dayNumber === mapViewState.activeDay) && (
            <div className="absolute bottom-4 right-4 z-20">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 min-w-48">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Ngày {mapViewState.activeDay}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Địa điểm:</span>
                    <span className="font-medium">
                      {trip.days.find(day => day.dayNumber === mapViewState.activeDay)?.places.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày:</span>
                    <span className="font-medium">
                      {new Date(trip.days.find(day => day.dayNumber === mapViewState.activeDay)?.date || '').toLocaleDateString('vi-VN', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}