// app/dashboard/Map/components/EnhancedMapboxMap.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationControl, GeolocateControl, Source, Layer, ViewStateChangeEvent, Marker, Popup } from 'react-map-gl';
import MapGLWrapper from './MapGLWrapper';
import type { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Navigation, MapPin, X, Layers, Menu } from 'lucide-react';
import AdvancedSearchControl from './AdvancedSearchControl';
import IsochronePanel from './IsochronePanel';
import TrafficToggle from './TrafficToggle';

// Định nghĩa kiểu cho điểm đã chọn
interface SelectedPlace {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

interface EnhancedMapboxMapProps {
  initialLocation?: [number, number]; // [latitude, longitude]
}

const EnhancedMapboxMap: React.FC<EnhancedMapboxMapProps> = ({ initialLocation }) => {
  const mapRef = useRef<MapboxMap | null>(null);
  const [viewState, setViewState] = useState({
    longitude: initialLocation?.[1] || 105.8542,
    latitude: initialLocation?.[0] || 21.0285,
    zoom: 13
  });
  
  // State management
  const [isTrafficVisible, setIsTrafficVisible] = useState(false);
  const [selectedTravelTime, setSelectedTravelTime] = useState(15);
  const [travelMode, setTravelMode] = useState<'walking' | 'cycling' | 'driving'>('walking');
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [routeData, setRouteData] = useState<GeoJSON.Feature | null>(null);
  const [isMobileControlsVisible, setIsMobileControlsVisible] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Lấy Mapbox token từ biến môi trường
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  
  // Handle map load
  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  // Lấy vị trí hiện tại khi component mount
  useEffect(() => {
    let isMounted = true;
    
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!isMounted) return;
            
            const { latitude, longitude } = position.coords;
            console.log('Current location obtained:', longitude, latitude);
            setCurrentLocation([longitude, latitude]);
            
            // Fly to current location
            if (mapRef.current && mapLoaded) {
              mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: 14,
                duration: 2000
              });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            // Fall back to initial location or default
            if (initialLocation && isMounted) {
              setCurrentLocation([initialLocation[1], initialLocation[0]]);
            } else if (isMounted) {
              setCurrentLocation([105.8542, 21.0285]); // Default to Hanoi
            }
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
      }
    };
    
    getUserLocation();
    
    return () => {
      isMounted = false;
    };
  }, [initialLocation, mapLoaded]);

  // Xử lý khi người dùng chọn địa điểm từ kết quả tìm kiếm
  const handlePlaceSelect = useCallback((place: SelectedPlace) => {
    console.log('Place selected:', place);
    
    // Reset previous state
    setShowDirections(false);
    setRouteData(null);
    
    // Set new place
    setSelectedPlace(place);
    setShowPopup(true);
    
    // Zoom đến địa điểm đã chọn
    if (mapRef.current && mapLoaded) {
      mapRef.current.flyTo({
        center: place.coordinates,
        zoom: 15,
        duration: 1500
      });
    }
  }, [mapLoaded]);

  // Xử lý sự kiện thay đổi viewport
  const handleViewStateChange = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  // Xử lý yêu cầu chỉ đường
  const handleGetDirections = useCallback(() => {
    if (!currentLocation || !selectedPlace) {
      console.error('Missing current location or selected place');
      return;
    }
    
    setShowDirections(true);
    fetchDirections();
  }, [currentLocation, selectedPlace, travelMode]);

  // Fetch directions data
  const fetchDirections = useCallback(async () => {
    if (!currentLocation || !selectedPlace) return;
    
    try {
      console.log('Fetching directions from', currentLocation, 'to', selectedPlace.coordinates);
      
      // Get Mapbox token
      if (!mapboxToken) {
        throw new Error('Mapbox access token is missing');
      }

      // Create the API URL
      const url = `https://api.mapbox.com/directions/v5/mapbox/${travelMode}/` +
                 `${currentLocation[0]},${currentLocation[1]};` +
                 `${selectedPlace.coordinates[0]},${selectedPlace.coordinates[1]}` +
                 `?steps=true&geometries=geojson&access_token=${mapboxToken}`;
      
      // Fetch directions
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch directions: ${response.statusText}`);
      }
      
      // Parse response
      const data = await response.json();
      
      // Check if routes exist
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }
      
      // Get the first route
      const route = data.routes[0];
      
      // Create GeoJSON for the route
      const routeGeoJson = {
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      };
      
      // Set route data
      setRouteData(routeGeoJson as any);
      
      // Adjust the map to show the entire route
      if (mapRef.current && mapLoaded) {
        const bounds = route.bbox;
        if (bounds && bounds.length === 4) {
          mapRef.current.fitBounds(
            [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
            { padding: 100, duration: 1000 }
          );
        }
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  }, [currentLocation, selectedPlace, travelMode, mapboxToken, mapLoaded]);

  // Clear route and reset selection
  const handleClearRoute = useCallback(() => {
    setShowDirections(false);
    setRouteData(null);
    setShowPopup(false);
    setSelectedPlace(null);
  }, []);

  // Toggle mobile controls visibility
  const toggleMobileControls = useCallback(() => {
    setIsMobileControlsVisible(!isMobileControlsVisible);
  }, [isMobileControlsVisible]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Mapbox Map */}
      <MapGLWrapper
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        mapStyle={isTrafficVisible ? 
          "mapbox://styles/mapbox/traffic-day-v2" : 
          "mapbox://styles/mapbox/streets-v12"
        }
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
              <div className="w-6 h-6 bg-blue-600 border-2 border-white rounded-full" />
              <div className="absolute -top-1 -left-1 w-8 h-8 bg-blue-500 bg-opacity-20 rounded-full animate-ping" />
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
            <MapPin size={32} className="text-red-500" strokeWidth={2} />
          </Marker>
        )}
        
        {/* Place Information Popup */}
        {selectedPlace && showPopup && (
          <Popup
            longitude={selectedPlace.coordinates[0]}
            latitude={selectedPlace.coordinates[1]}
            anchor="bottom"
            onClose={() => setShowPopup(false)}
            closeButton={true}
            closeOnClick={false}
            offset={[0, -30]}
            className="z-10"
          >
            <div className="p-3 min-w-[220px]">
              <h3 className="font-medium text-sm mb-1">{selectedPlace.name}</h3>
              {selectedPlace.address && (
                <p className="text-xs text-gray-600 mb-2">{selectedPlace.address}</p>
              )}
              <button 
                className="w-full py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition flex items-center justify-center"
                onClick={handleGetDirections}
              >
                <Navigation className="w-4 h-4 mr-1" />
                Chỉ đường
              </button>
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
                'line-width': 4,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}
      </MapGLWrapper>
      
      {/* Mobile Toggle Button */}
      <button 
        className="absolute top-4 left-4 md:hidden z-50 bg-white p-2 rounded-full shadow-lg"
        onClick={toggleMobileControls}
      >
        <Menu size={24} className="text-gray-700" />
      </button>
      
      {/* Controls Container - Responsive */}
      <div className={`
        ${isMobileControlsVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        transition-transform duration-300 ease-in-out
        absolute top-4 left-4 z-40 md:z-10 space-y-4 w-80
        md:block
      `}>
        {/* Search Control */}
        <AdvancedSearchControl onPlaceSelect={handlePlaceSelect} />
        
        {/* Travel Mode Selector */}
        <div className="bg-white p-3 rounded-lg shadow-lg">
          <h3 className="text-sm font-medium mb-2">Phương thức di chuyển</h3>
          <div className="flex justify-between space-x-2">
            <button
              className={`flex-1 px-3 py-2 text-sm rounded-md flex items-center justify-center ${travelMode === 'walking' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTravelMode('walking')}
            >
              <span className="mr-1">🚶</span> Đi bộ
            </button>
            <button
              className={`flex-1 px-3 py-2 text-sm rounded-md flex items-center justify-center ${travelMode === 'cycling' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTravelMode('cycling')}
            >
              <span className="mr-1">🚲</span> Xe đạp
            </button>
            <button
              className={`flex-1 px-3 py-2 text-sm rounded-md flex items-center justify-center ${travelMode === 'driving' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTravelMode('driving')}
            >
              <span className="mr-1">🚗</span> Xe hơi
            </button>
          </div>
        </div>
      </div>
      
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <TrafficToggle 
          isActive={isTrafficVisible} 
          onChange={() => setIsTrafficVisible(!isTrafficVisible)} 
        />
        
        <button
          className="flex items-center space-x-2 py-2 px-3 rounded-lg shadow bg-white text-gray-700 hover:bg-gray-50"
          onClick={() => {
            if (mapRef.current && currentLocation) {
              mapRef.current.flyTo({
                center: currentLocation,
                zoom: 14,
                duration: 1500
              });
            }
          }}
        >
          <Layers size={18} />
          <span>Vị trí của tôi</span>
        </button>
      </div>
      
      {/* Bottom Controls */}
      <div className="absolute bottom-24 right-4 z-10">
        <IsochronePanel 
          travelTime={selectedTravelTime}
          onTravelTimeChange={setSelectedTravelTime}
          onGenerateIsochrone={() => {
            if (mapRef.current && mapLoaded) {
              const center = mapRef.current.getCenter();
              // Logic to generate isochrone here...
            }
          }}
        />
      </div>
      
      {/* Routes Control Panel - Only shown when route is active */}
      {showDirections && (
        <div className="absolute bottom-4 left-0 right-0 mx-auto w-11/12 md:w-96 bg-white rounded-lg shadow-lg z-20 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-800">Chỉ đường</h3>
            <button 
              onClick={handleClearRoute}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <p className="text-sm">Vị trí của bạn</p>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <p className="text-sm">{selectedPlace?.name}</p>
          </div>
          
          <div className="flex justify-center">
            <button
              className={`px-4 py-2 rounded-md text-white ${
                travelMode === 'walking' ? 'bg-amber-500' :
                travelMode === 'cycling' ? 'bg-green-600' : 'bg-blue-600'
              }`}
            >
              {travelMode === 'walking' ? '🚶 Đi bộ' : 
               travelMode === 'cycling' ? '🚲 Xe đạp' : '🚗 Lái xe'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMapboxMap;