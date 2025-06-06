// app/dashboard/Map/components/ModernMapboxMap.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationControl, GeolocateControl, Source, Layer, ViewStateChangeEvent, Marker, Popup } from 'react-map-gl';
import MapGLWrapper from './MapGLWrapper';
import type { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Search, 
  Navigation, 
  MapPin, 
  X,  
  Menu,  
  Loader2, 
  Star,
  Heart, 
  Bookmark
} from 'lucide-react';
import ModernSearchControl from './ModernSearchControl';
import ModernNearbyPanel from './ModernNearbyPanel';
import ModernPlaceDetails from './ModernPlaceDetails';
import ModernDirectionsPanel from './ModernDirectionsPanel';
import { Place } from '../types';

// Toast notification system
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-xl text-white z-[9999] transform transition-all duration-300 flex items-center space-x-2 shadow-lg ${
    type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
    type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
    'bg-gradient-to-r from-blue-500 to-blue-600'
  }`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  toast.innerHTML = `<span class="text-lg">${icon}</span><span class="font-medium">${message}</span>`;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

// Selected place interface
interface SelectedPlace {
  name: string;
  coordinates: [number, number];
  address?: string;
  rating?: number;
  type?: string;
  image?: string;
}

interface ModernMapboxMapProps {
  initialLocation?: [number, number];
  onLocationUpdate?: (location: [number, number]) => void;
  savedPlaces?: Place[];
  onSavedPlacesUpdate?: (places: Place[]) => void;
}

const ModernMapboxMap: React.FC<ModernMapboxMapProps> = ({ 
  initialLocation,
  onLocationUpdate,
  savedPlaces = [],
  onSavedPlacesUpdate
}) => {
  const mapRef = useRef<MapboxMap | null>(null);
  const [viewState, setViewState] = useState({
    longitude: initialLocation?.[1] || 105.8542,
    latitude: initialLocation?.[0] || 21.0285,
    zoom: 13
  });
  
  // State management
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(
    initialLocation ? [initialLocation[1], initialLocation[0]] : null
  );
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [routeData, setRouteData] = useState<GeoJSON.Feature | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<Place | null>(null);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI State
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activePanel, setActivePanel] = useState<'search' | 'nearby' | 'directions' | 'saved' | null>('search');
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [travelMode, setTravelMode] = useState<'walking' | 'cycling' | 'driving'>('walking');
  
  // Mapbox token
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  // Handle map load
  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    showToast('Bản đồ đã sẵn sàng!', 'success');
  }, []);

  // Update location when prop changes
  useEffect(() => {
    if (initialLocation) {
      const [lat, lng] = initialLocation;
      setCurrentLocation([lng, lat]);
      setViewState(prev => ({ ...prev, latitude: lat, longitude: lng }));
    }
  }, [initialLocation]);

  // Listen for custom events from parent
  useEffect(() => {
    const handleTriggerNearbySearch = () => {
      setActivePanel('nearby');
      setShowMobileMenu(true);
    };

    const handleShowDirections = () => {
      setActivePanel('directions');
      setShowMobileMenu(true);
    };

    const handleShowSavedPlaces = () => {
      setActivePanel('saved');
      setShowMobileMenu(true);
    };

    window.addEventListener('triggerNearbySearch', handleTriggerNearbySearch);
    window.addEventListener('showDirections', handleShowDirections);
    window.addEventListener('showSavedPlaces', handleShowSavedPlaces);

    return () => {
      window.removeEventListener('triggerNearbySearch', handleTriggerNearbySearch);
      window.removeEventListener('showDirections', handleShowDirections);
      window.removeEventListener('showSavedPlaces', handleShowSavedPlaces);
    };
  }, []);

  // Handle place selection
  const handlePlaceSelect = useCallback((place: SelectedPlace) => {
    setSelectedPlace(place);
    setShowPopup(true);
    setShowDirections(false);
    setRouteData(null);
    
    if (mapRef.current && mapLoaded) {
      mapRef.current.flyTo({
        center: place.coordinates,
        zoom: 15,
        duration: 1500
      });
    }
  }, [mapLoaded]);

  // Handle viewport change
  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  // Get directions
  const handleGetDirections = useCallback(async () => {
    if (!currentLocation || !selectedPlace) {
      showToast('Thiếu thông tin vị trí!', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/${travelMode}/` +
                 `${currentLocation[0]},${currentLocation[1]};` +
                 `${selectedPlace.coordinates[0]},${selectedPlace.coordinates[1]}` +
                 `?steps=true&geometries=geojson&overview=full&language=vi` +
                 `&access_token=${mapboxToken}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Không thể tìm đường');
      
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        throw new Error('Không tìm thấy đường đi');
      }
      
      const route = data.routes[0];
      const routeGeoJson = {
        type: 'Feature',
        properties: {
          distance: route.distance,
          duration: route.duration,
          mode: travelMode
        },
        geometry: route.geometry
      };
      
      setRouteData(routeGeoJson as any);
      setShowDirections(true);
      setActivePanel('directions');
      
      // Fit map to route
      if (mapRef.current && route.bbox) {
        mapRef.current.fitBounds(
          [[route.bbox[0], route.bbox[1]], [route.bbox[2], route.bbox[3]]],
          { padding: 100, duration: 1000 }
        );
      }
      
      showToast('Đã tìm thấy đường đi!', 'success');
    } catch (error) {
      console.error('Error getting directions:', error);
      showToast('Lỗi khi tìm đường!', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation, selectedPlace, travelMode, mapboxToken, mapLoaded]);

  // Clear route
  const handleClearRoute = useCallback(() => {
    setShowDirections(false);
    setRouteData(null);
    setShowPopup(false);
    setSelectedPlace(null);
    setActivePanel('search');
  }, []);

  // Handle place save
  const handleSavePlace = useCallback((place: Place) => {
    const newSavedPlaces = [...savedPlaces, place];
    onSavedPlacesUpdate?.(newSavedPlaces);
    
    // Save to localStorage
    try {
      localStorage.setItem('saved_places', JSON.stringify(newSavedPlaces));
      showToast('Đã lưu địa điểm!', 'success');
    } catch (error) {
      console.error('Error saving place:', error);
      showToast('Lỗi khi lưu địa điểm!', 'error');
    }
  }, [savedPlaces, onSavedPlacesUpdate]);

  // Travel mode selector
  const TravelModeSelector = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Phương thức di chuyển</h3>
      <div className="flex space-x-2">
        {[
          { mode: 'walking', icon: '🚶', label: 'Đi bộ' },
          { mode: 'cycling', icon: '🚲', label: 'Xe đạp' },
          { mode: 'driving', icon: '🚗', label: 'Xe hơi' }
        ].map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => setTravelMode(mode as any)}
            className={`
              flex-1 flex flex-col items-center p-3 rounded-lg transition-all duration-200
              ${travelMode === mode 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-lg mb-1">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Map style selector
  const MapStyleSelector = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Kiểu bản đồ</h3>
      <div className="grid grid-cols-2 gap-2">
        {[
          { style: 'streets-v12', label: 'Đường phố', icon: '🗺️' },
          { style: 'satellite-v9', label: 'Vệ tinh', icon: '🛰️' },
          { style: 'outdoors-v12', label: 'Ngoài trời', icon: '🏞️' },
          { style: 'dark-v11', label: 'Tối', icon: '🌙' }
        ].map(({ style, label, icon }) => (
          <button
            key={style}
            onClick={() => setMapStyle(`mapbox://styles/mapbox/${style}`)}
            className={`
              p-2 rounded-lg text-xs transition-all duration-200 flex items-center space-x-2
              ${mapStyle.includes(style)
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Mapbox Map */}
      <MapGLWrapper
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        mapStyle={mapStyle}
        {...viewState}
        onMove={handleViewStateChange}
        onLoad={handleMapLoad}
        attributionControl={false}
        reuseMaps
        style={{ position: 'absolute', top: 0, bottom: 0, width: '100%', height: '100%' }}
      >
        {/* Map Controls */}
        <NavigationControl position="bottom-right" />
        <GeolocateControl 
          position="bottom-right" 
          trackUserLocation
          showAccuracyCircle
          onGeolocate={(position) => {
            const { longitude, latitude } = position.coords;
            setCurrentLocation([longitude, latitude]);
            onLocationUpdate?.([latitude, longitude]);
          }}
        />
        
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker 
            longitude={currentLocation[0]} 
            latitude={currentLocation[1]}
            anchor="center"
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg" />
              <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 bg-opacity-20 rounded-full animate-ping" />
            </div>
          </Marker>
        )}
        
        {/* Selected Place Marker */}
        {selectedPlace && (
          <Marker 
            longitude={selectedPlace.coordinates[0]} 
            latitude={selectedPlace.coordinates[1]}
            anchor="bottom"
            offset={[0, -5]}
          >
            <div className="relative">
              <MapPin size={32} className="text-red-500 drop-shadow-lg" strokeWidth={2} />
              <div className="absolute -top-1 -left-1 w-8 h-8 bg-red-500 bg-opacity-20 rounded-full animate-ping" />
            </div>
          </Marker>
        )}
        
        {/* Nearby Places Markers */}
        {nearbyPlaces.map((place) => (
          <Marker 
            key={place.id || `${place.latitude}-${place.longitude}`}
            longitude={parseFloat(place.longitude)}
            latitude={parseFloat(place.latitude)}
            anchor="bottom"
          >
            <div className="relative group">
              <div className="p-2 bg-white rounded-full shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 hover:scale-110 cursor-pointer">
                <MapPin 
                  size={16} 
                  className="text-blue-600"
                  onClick={() => {
                    setSelectedPlaceDetails(place);
                    setShowPlaceDetails(true);
                  }}
                />
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 w-max bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {place.name}
              </div>
            </div>
          </Marker>
        ))}
        
        {/* Place Information Popup */}
        {selectedPlace && showPopup && (
          <Popup
            longitude={selectedPlace.coordinates[0]}
            latitude={selectedPlace.coordinates[1]}
            anchor="bottom"
            onClose={() => setShowPopup(false)}
            closeButton={false}
            closeOnClick={false}
            offset={[0, -35]}
            className="z-50"
          >
            <div className="p-4 min-w-[250px] bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{selectedPlace.name}</h3>
                  {selectedPlace.address && (
                    <p className="text-sm text-gray-600 mb-2">{selectedPlace.address}</p>
                  )}
                  {selectedPlace.rating && (
                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{selectedPlace.rating}</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={handleGetDirections}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span>Chỉ đường</span>
                </button>
                <button 
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Lưu địa điểm"
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </Popup>
        )}
        
        {/* Route Path */}
        {routeData && (
          <Source id="route-data" type="geojson" data={routeData}>
            <Layer
              id="route-line"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': travelMode === 'driving' ? '#3b82f6' : 
                            travelMode === 'cycling' ? '#10b981' : '#f59e0b',
                'line-width': 5,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}
      </MapGLWrapper>
      
      {/* Mobile Menu Toggle */}
      <button 
        className="absolute top-24 left-4 md:hidden z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <Menu size={20} className="text-gray-700" />
      </button>
      
      {/* Left Panel */}
      <div className={`
        ${showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        transition-transform duration-300 ease-in-out
        absolute top-24 left-4 z-40 w-80 space-y-4
        md:block
      `}>
        {/* Panel Selector */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
          <div className="flex space-x-1">
            {[
              { id: 'search', icon: Search, label: 'Tìm kiếm' },
              { id: 'nearby', icon: MapPin, label: 'Gần đây' },
              { id: 'directions', icon: Navigation, label: 'Chỉ đường' },
              { id: 'saved', icon: Bookmark, label: 'Đã lưu' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id as any)}
                className={`
                  flex-1 flex flex-col items-center p-2 rounded-lg transition-all duration-200
                  ${activePanel === id 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={16} />
                <span className="text-xs mt-1">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel Content */}
        {activePanel === 'search' && (
          <ModernSearchControl onPlaceSelect={handlePlaceSelect} />
        )}
        
        {activePanel === 'nearby' && (
          <ModernNearbyPanel 
            currentLocation={currentLocation}
            onPlacesFound={setNearbyPlaces}
            onPlaceSelect={(place) => {
              setSelectedPlaceDetails(place);
              setShowPlaceDetails(true);
            }}
          />
        )}
        
        {activePanel === 'directions' && (
          <ModernDirectionsPanel
            currentLocation={currentLocation}
            selectedPlace={selectedPlace}
            routeData={routeData}
            travelMode={travelMode}
            onTravelModeChange={setTravelMode}
            onClearRoute={handleClearRoute}
          />
        )}

        {activePanel === 'saved' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Địa điểm đã lưu</h3>
            {savedPlaces.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Chưa có địa điểm nào được lưu</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedPlaces.map((place, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <h4 className="font-medium text-gray-900">{place.name}</h4>
                    <p className="text-sm text-gray-600">{place.details?.address}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Travel Mode & Map Style */}
        <TravelModeSelector />
        <MapStyleSelector />
      </div>
      
      {/* Place Details Sidebar */}
      {showPlaceDetails && selectedPlaceDetails && (
        <div className="absolute top-0 right-0 bottom-0 w-96 z-50 bg-white shadow-2xl">
          <ModernPlaceDetails 
            place={selectedPlaceDetails}
            onClose={() => setShowPlaceDetails(false)}
            onGetDirections={(place) => {
              if (place.latitude && place.longitude) {
                const coordinates: [number, number] = [parseFloat(place.longitude), parseFloat(place.latitude)];
                setSelectedPlace({
                  name: place.name,
                  coordinates,
                  address: place.details?.address,
                  rating: parseFloat(place.rating) || undefined,
                  type: place.type
                });
                setShowPlaceDetails(false);
                setShowPopup(true);
                handleGetDirections();
              }
            }}
            onSave={() => handleSavePlace(selectedPlaceDetails)}
          />
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-900 font-medium">Đang xử lý...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernMapboxMap;