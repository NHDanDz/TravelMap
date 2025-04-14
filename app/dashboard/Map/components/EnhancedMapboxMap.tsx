// app/dashboard/Map/components/EnhancedMapboxMap.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationControl, GeolocateControl, Source, Layer, ViewStateChangeEvent, Marker, Popup } from 'react-map-gl';
import MapGLWrapper from './MapGLWrapper';
import type { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Navigation, MapPin, X, Layers, Menu, Camera, List, Globe, Loader2 } from 'lucide-react';
import AdvancedSearchControl from './AdvancedSearchControl';
import IsochronePanel from './IsochronePanel';
import TrafficToggle from './TrafficToggle';
import NearbyPlacesControl from './NearbyPlacesControl';
import MapboxPlaceDetails from './MapboxPlaceDetails';
import StaticMapExport from './StaticMapExport';
import MapboxDirections from './MapboxDirections';
import RouteOptimizer from './RouteOptimizer';
import { Place, PlaceType } from '../types';
import { EnhancedMapboxService } from '@/services/enhancedMapboxService'; 

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
  
  // State for new features
  const [placeType, setPlaceType] = useState<PlaceType>('restaurant');
  const [searchRadius, setSearchRadius] = useState<string>('1000');
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<Place | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [showRouteOptimizer, setShowRouteOptimizer] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // State for isochrone
  const [isochroneData, setIsochroneData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isochroneLoading, setIsochroneLoading] = useState(false);
  const [isochroneVisible, setIsochroneVisible] = useState(false);
  // Định nghĩa kiểu dữ liệu cho các tọa độ và bounds thủ công
  type Coordinate = [number, number]; // [longitude, latitude]
  type BoundingBox = [Coordinate, Coordinate]; // [[minLng, minLat], [maxLng, maxLat]]
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

  // Hàm xử lý tạo isochrone (phạm vi di chuyển)
  const handleGenerateIsochrone = useCallback(async () => {
    if (mapRef.current && mapLoaded && currentLocation) {
      console.log('Generating isochrone for', currentLocation, 'with travel time', selectedTravelTime);
      
      setIsochroneLoading(true);
      
      try {
        // Gọi service để lấy dữ liệu isochrone
        const data = await EnhancedMapboxService.getIsochrone(
          currentLocation,
          selectedTravelTime,
          travelMode
        );
        
        console.log('Isochrone data received:', data);
        
        // Cập nhật state với dữ liệu nhận được
        setIsochroneData(data);
        setIsochroneVisible(true);
        
        // Nếu có dữ liệu, điều chỉnh bản đồ để hiển thị toàn bộ phạm vi
        if (data && data.features && data.features.length > 0 && mapRef.current) {
          const feature = data.features[0];
          
          // Kiểm tra kiểu geometry
          if (feature.geometry) {
            let bounds: BoundingBox | null = null;
            
            if (feature.geometry.type === 'Polygon') {
              // Xử lý Polygon
              const polygonGeometry = feature.geometry as GeoJSON.Polygon;
              // Lấy outer ring của polygon (mảng đầu tiên trong coordinates)
              const ring = polygonGeometry.coordinates[0] as Coordinate[];
              bounds = calculateBoundsFromCoordinates(ring);
              
            } else if (feature.geometry.type === 'MultiPolygon') {
              // Xử lý MultiPolygon
              const multiPolygonGeometry = feature.geometry as GeoJSON.MultiPolygon;
              // Lấy outer ring của polygon đầu tiên
              const ring = multiPolygonGeometry.coordinates[0][0] as Coordinate[];
              bounds = calculateBoundsFromCoordinates(ring);
            }
            
            // Nếu có bounds, điều chỉnh bản đồ
            if (bounds) {
              console.log('Calculated bounds for isochrone:', bounds);
              
              // Fit map để hiển thị toàn bộ isochrone
              mapRef.current.fitBounds(bounds, {
                padding: 50,
                duration: 1000
              });
            }
          }
        }
      } catch (error) {
        console.error('Error generating isochrone:', error);
      } finally {
        setIsochroneLoading(false);
      }
    }
  }, [currentLocation, selectedTravelTime, travelMode, mapLoaded]);
// Hàm trợ giúp để tính toán bounds từ mảng tọa độ
function calculateBoundsFromCoordinates(coordinates: Coordinate[]): BoundingBox {
  // Khởi tạo giá trị min/max với giá trị đầu tiên
  if (coordinates.length === 0) {
    // Nếu không có tọa độ nào, trả về bounds mặc định
    return [[0, 0], [0, 0]];
  }
  
  const firstCoord = coordinates[0];
  let minLng = firstCoord[0];
  let minLat = firstCoord[1];
  let maxLng = firstCoord[0];
  let maxLat = firstCoord[1];
  
  // Duyệt qua tất cả tọa độ để tìm min/max
  for (const coord of coordinates) {
    if (coord[0] < minLng) minLng = coord[0];
    if (coord[1] < minLat) minLat = coord[1];
    if (coord[0] > maxLng) maxLng = coord[0];
    if (coord[1] > maxLat) maxLat = coord[1];
  }
  
  // Trả về bounds dạng [[minLng, minLat], [maxLng, maxLat]]
  return [[minLng, minLat], [maxLng, maxLat]];
}
  // Handle nearby places search
  const handleNearbyPlacesSearch = useCallback(async () => {
    if (!currentLocation) {
      console.error('Current location not available');
      setSearchError('Vị trí hiện tại không khả dụng');
      return;
    }
    
    setIsSearchingNearby(true);
    setSearchError(null);
    setNearbyPlaces([]);
    
    try {
      // Sử dụng API TripAdvisor đã sửa chữa
      const params = new URLSearchParams({
        lat: String(currentLocation[1]), // Latitude
        lng: String(currentLocation[0]), // Longitude
        type: placeType,
        radius: searchRadius,
        language: 'vi',
        exact: 'true' // Request exact coordinates for better accuracy
      });
      
      console.log(`Searching for ${placeType} within ${searchRadius}m using TripAdvisor API`);
      
      // Gọi API TripAdvisor
      const response = await fetch(`/api/tripadvisor/search?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định' }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json() as Place[];
      setNearbyPlaces(data);
      
      console.log(`Found ${data.length} places nearby`);
      
      if (data.length === 0) {
        setSearchError('Không tìm thấy địa điểm nào phù hợp. Vui lòng thử lại với tùy chọn khác.');
      }
      
    } catch (error) {
      console.error('Error searching for nearby places:', error);
      setSearchError(error instanceof Error ? error.message : 'Lỗi không xác định khi tìm kiếm địa điểm');
      
      // Nếu API thực thất bại, sử dụng dịch vụ mô phỏng làm dự phòng
      
    } finally {
      setIsSearchingNearby(false);
    }
  }, [currentLocation, placeType, searchRadius]);

  // Handle selecting a place from nearby results
  const handleSelectNearbyPlace = useCallback(async (place: Place) => {
    // First, set the basic details and fly to location
    setSelectedPlaceDetails(place);
    setShowPlaceDetails(true);
    
    // Fly to the selected place
    if (mapRef.current && place.latitude && place.longitude) {
      mapRef.current.flyTo({
        center: [parseFloat(place.longitude), parseFloat(place.latitude)],
        zoom: 16,
        duration: 1000
      });
    }
    
    // Then fetch detailed information if we have a place ID
    if (place.id) {
      try {
        console.log(`Fetching details for place ID: ${place.id}`);
        
        // Fetch from TripAdvisor API
        const response = await fetch(`/api/tripadvisor/details/${place.id}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // Parse the response
        const detailedPlace = await response.json() as Place;
        setSelectedPlaceDetails(detailedPlace);
        
      } catch (error) {
        console.error('Error fetching place details:', error);
        
        // Fallback to mock service
 
        // Keep the basic place data if all fetches fail
      }
    }
  }, []);

  // Save a place to the list
  const handleSavePlace = useCallback((place: Place) => {
    setSavedPlaces(prev => {
      // Check if place already exists
      if (prev.some(p => p.id === place.id)) {
        return prev;
      }
      return [...prev, place];
    });
    setShowPlaceDetails(false);
  }, []);

  // Optimize route for saved places
  const handleOptimizeRoute = useCallback((places: Place[]) => {
    console.log('Optimizing route for places:', places);
    // Here you would implement the routing algorithm
    // For now, just close the optimizer
    setShowRouteOptimizer(false);
    
    // Create markers for each place on the map
    // And perhaps draw a route between them
  }, []);

  // Start navigation with the optimized route
  const handleStartNavigation = useCallback((places: Place[]) => {
    console.log('Starting navigation with places:', places);
    // Implement navigation UI
    setShowRouteOptimizer(false);
  }, []);
 
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
        
        {/* Nearby Places Markers */}
        {nearbyPlaces.map((place) => (
          <Marker 
            key={place.id || `${place.latitude}-${place.longitude}`}
            longitude={parseFloat(place.longitude)}
            latitude={parseFloat(place.latitude)}
            anchor="bottom"
          >
            <div className="relative group">
              <MapPin 
                size={24} 
                className={`${
                  place.type === 'restaurant' ? 'text-red-500' :
                  place.type === 'hotel' ? 'text-blue-500' :
                  place.type === 'cafe' ? 'text-amber-500' :
                  place.type === 'tourist_attraction' ? 'text-green-500' :
                  'text-purple-500'
                } cursor-pointer hover:scale-110 transition-transform duration-200`}
                onClick={() => handleSelectNearbyPlace(place)}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-max bg-white text-xs py-1 px-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {place.name}
              </div>
            </div>
          </Marker>
        ))}
        
        {/* Isochrone Layer */}
        {isochroneData && isochroneVisible && (
          <Source id="isochrone-data" type="geojson" data={isochroneData}>
            <Layer
              id="isochrone-fill"
              type="fill"
              paint={{
                'fill-color': travelMode === 'driving' ? 'rgba(59, 130, 246, 0.3)' : 
                              travelMode === 'cycling' ? 'rgba(16, 185, 129, 0.3)' : 
                              'rgba(245, 158, 11, 0.3)',
                'fill-outline-color': travelMode === 'driving' ? '#3b82f6' : 
                                      travelMode === 'cycling' ? '#10b981' : 
                                      '#f59e0b',
                'fill-opacity': 0.6
              }}
            />
            <Layer
              id="isochrone-outline"
              type="line"
              paint={{
                'line-color': travelMode === 'driving' ? '#3b82f6' : 
                              travelMode === 'cycling' ? '#10b981' : 
                              '#f59e0b',
                'line-width': 2
              }}
            />
          </Source>
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
        
        {/* Full Directions Component (when directions are active) */}
        {showDirections && currentLocation && selectedPlace && (
          <MapboxDirections
            startPoint={currentLocation}
            endPoint={selectedPlace.coordinates}
            mode={travelMode}
          />
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
              className={`flex-1 px-2 py-2 text-sm rounded-md flex items-center justify-center ${travelMode === 'walking' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTravelMode('walking')}
            >
              <span className="mr-1">🚶</span> Đi bộ
            </button>
            <button
              className={`flex-1 px-2 py-2 text-sm rounded-md flex items-center justify-center ${travelMode === 'cycling' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTravelMode('cycling')}
            >
              <span className="mr-1">🚲</span> Xe đạp
            </button>
            <button
              className={`flex-1 px-2 py-2 text-sm rounded-md flex items-center justify-center ${travelMode === 'driving' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
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
        
        {/* Static Map Export Button */}
        {currentLocation && (
          <StaticMapExport
            center={currentLocation}
            zoom={viewState.zoom}
            markers={[
              ...(selectedPlace ? [{
                longitude: selectedPlace.coordinates[0],
                latitude: selectedPlace.coordinates[1],
                label: selectedPlace.name
              }] : []),
              {
                longitude: currentLocation[0],
                latitude: currentLocation[1],
                label: 'Vị trí của tôi'
              }
            ]}
          />
        )}
        
        {/* Saved Places / Route Optimizer Button */}
        <button
          className="flex items-center space-x-2 py-2 px-3 rounded-lg shadow bg-white text-gray-700 hover:bg-gray-50"
          onClick={() => setShowRouteOptimizer(true)}
        >
          <List size={18} />
          <span>Lộ trình</span>
          {savedPlaces.length > 0 && (
            <span className="bg-blue-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
              {savedPlaces.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Right Side Panel - Nearby Places */}
      <div className="absolute top-4 right-4 z-10">
        <NearbyPlacesControl
          selectedLocation={currentLocation}
          placeType={placeType}
          searchRadius={searchRadius}
          onPlaceTypeChange={setPlaceType}
          onRadiusChange={setSearchRadius}
          isSearching={isSearchingNearby}
          onSearch={handleNearbyPlacesSearch}
        />
        
        {/* Error message */}
        {searchError && (
          <div className="mt-2 bg-red-50 border border-red-200 p-3 rounded-lg shadow-lg text-sm text-red-600">
            <div className="flex justify-between items-center">
              <span>{searchError}</span>
              <button 
                onClick={() => setSearchError(null)} 
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        
        {/* Results indicator */}
        {nearbyPlaces.length > 0 && !isSearchingNearby && !searchError && (
          <div className="mt-2 bg-white p-3 rounded-lg shadow-lg text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">Tìm thấy {nearbyPlaces.length} địa điểm</span>
              <button 
                onClick={() => setNearbyPlaces([])} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Controls */}
      <div className="absolute bottom-24 right-4 z-10">
        <IsochronePanel 
          travelTime={selectedTravelTime}
          onTravelTimeChange={setSelectedTravelTime}
          onGenerateIsochrone={handleGenerateIsochrone}
          isLoading={isochroneLoading}
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
      
      {/* Place Details Sidebar - When a nearby place is selected */}
      {showPlaceDetails && selectedPlaceDetails && (
        <div className="absolute top-0 right-0 bottom-0 w-80 z-30 bg-white shadow-lg">
          <MapboxPlaceDetails 
            place={selectedPlaceDetails}
            onClose={() => setShowPlaceDetails(false)}
            onGetDirections={(place) => {
              if (place.latitude && place.longitude && currentLocation) {
                setSelectedPlace({
                  name: place.name,
                  coordinates: [parseFloat(place.longitude), parseFloat(place.latitude)],
                  address: place.details?.address
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
      
      {/* Route Optimizer Modal */}
      {showRouteOptimizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-4 max-w-md w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Lộ trình của bạn</h3>
              <button 
                onClick={() => setShowRouteOptimizer(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <RouteOptimizer 
              savedPlaces={savedPlaces}
              onOptimizeRoute={handleOptimizeRoute}
              onStartNavigation={handleStartNavigation}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMapboxMap;