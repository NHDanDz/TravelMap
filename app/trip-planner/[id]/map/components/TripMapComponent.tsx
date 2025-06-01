// app/trip-planner/[id]/map/components/TripMapComponent.tsx
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { NavigationControl, GeolocateControl, Source, Layer, Marker, Popup, ViewStateChangeEvent } from 'react-map-gl';
import MapGLWrapper from '@/app/dashboard/Map/components/MapGLWrapper';
import type { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  MapPin, Navigation, Clock, Star, Route, Play, 
  Pause, RotateCcw, Camera, ExternalLink, Phone,
  Globe, Utensils, Coffee, Building, Landmark, ShoppingBag
} from 'lucide-react';
import Image from 'next/image';

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
  rating?: number;
  category?: {
    name: string;
    icon?: string;
  };
}

interface Day {
  dayNumber: number;
  date: string;
  places: Place[];
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  days: Day[];
  city?: {
    latitude?: number;
    longitude?: number;
  };
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

interface TripMapComponentProps {
  trip: Trip;
  mapViewState: MapViewState;
  onMapViewStateChange: (updates: Partial<MapViewState>) => void;
  highlightedPlace?: string | null;
  onPlaceHighlight?: (placeId: string | null) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Place type configuration
const placeTypeConfig = {
  restaurant: { icon: Utensils, color: 'bg-red-500', label: 'Nhà hàng' },
  cafe: { icon: Coffee, color: 'bg-amber-500', label: 'Quán café' },
  hotel: { icon: Building, color: 'bg-blue-500', label: 'Khách sạn' },
  tourist_attraction: { icon: Landmark, color: 'bg-green-500', label: 'Địa điểm tham quan' },
  shopping: { icon: ShoppingBag, color: 'bg-purple-500', label: 'Mua sắm' },
  default: { icon: MapPin, color: 'bg-gray-500', label: 'Địa điểm' }
};

const getPlaceTypeInfo = (place: Place) => {
  const type = place.type.toLowerCase() as keyof typeof placeTypeConfig;
  return placeTypeConfig[type] || placeTypeConfig.default;
};

// Day colors for route visualization
const dayColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red  
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

const getDayColor = (dayNumber: number) => {
  return dayColors[(dayNumber - 1) % dayColors.length];
};

export default function TripMapComponent({
  trip,
  mapViewState,
  onMapViewStateChange,
  highlightedPlace,
  onPlaceHighlight,
  initialCenter,
  initialZoom
}: TripMapComponentProps) {
  const mapRef = useRef<MapboxMap | null>(null);
  const [viewState, setViewState] = useState({
    longitude: initialCenter?.[0] || trip.city?.longitude || 105.8542,
    latitude: initialCenter?.[1] || trip.city?.latitude || 21.0285,
    zoom: initialZoom || 13
  });
  
  const [routeData, setRouteData] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [routeAnimationIndex, setRouteAnimationIndex] = useState(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Mapbox token
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  // Get current day data
  const getCurrentDayPlaces = useCallback(() => {
    if (mapViewState.showAllDays) {
      return trip.days.flatMap(day => day.places.map(place => ({ ...place, dayNumber: day.dayNumber })));
    }
    const currentDay = trip.days.find(day => day.dayNumber === mapViewState.activeDay);
    return currentDay ? currentDay.places.map(place => ({ ...place, dayNumber: mapViewState.activeDay })) : [];
  }, [trip.days, mapViewState.activeDay, mapViewState.showAllDays]);

  // Calculate map bounds for current view
  const calculateBounds = useCallback(() => {
    const places = getCurrentDayPlaces();
    if (places.length === 0) return null;

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    places.forEach(place => {
      const lat = parseFloat(place.latitude);
      const lng = parseFloat(place.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
    });

    if (minLat === Infinity) return null;

    return {
      sw: [minLng, minLat],
      ne: [maxLng, maxLat]
    } as any;
  }, [getCurrentDayPlaces]);

  // Fit map to current day places
  const fitMapToPlaces = useCallback(() => {
    if (!mapRef.current) return;
    
    const bounds = calculateBounds();
    if (bounds) {
      mapRef.current.fitBounds([bounds.sw, bounds.ne], {
        padding: 100,
        duration: 1000
      });
    }
  }, [calculateBounds]);

  // Generate route between places for a day
  const generateRoute = useCallback(async (places: Place[], dayNumber: number) => {
    if (places.length < 2) return null;

    try {
      setIsLoadingRoute(true);
      
      // Create waypoints string for Mapbox Directions API
      const coordinates = places.map(place => 
        `${parseFloat(place.longitude)},${parseFloat(place.latitude)}`
      ).join(';');

      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}` +
                 `?steps=true&geometries=geojson&overview=full&language=vi` +
                 `&access_token=${mapboxToken}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch route');

      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }

      const route = data.routes[0];
      return {
        type: 'Feature',
        properties: {
          dayNumber,
          distance: route.distance,
          duration: route.duration,
          color: getDayColor(dayNumber)
        },
        geometry: route.geometry
      };
    } catch (error) {
      console.error('Error generating route:', error);
      return null;
    } finally {
      setIsLoadingRoute(false);
    }
  }, [mapboxToken]);

  // Update routes when day changes or route setting changes
  useEffect(() => {
    const updateRoutes = async () => {
      if (!mapViewState.showRoute) {
        setRouteData([]);
        return;
      }

      const routes = [];
      
      if (mapViewState.showAllDays) {
        // Generate routes for all days
        for (const day of trip.days) {
          if (day.places.length >= 2) {
            const route = await generateRoute(day.places, day.dayNumber);
            if (route) routes.push(route);
          }
        }
      } else {
        // Generate route for current day only
        const currentDay = trip.days.find(day => day.dayNumber === mapViewState.activeDay);
        if (currentDay && currentDay.places.length >= 2) {
          const route = await generateRoute(currentDay.places, mapViewState.activeDay);
          if (route) routes.push(route);
        }
      }

      setRouteData(routes);
    };

    updateRoutes();
  }, [mapViewState.activeDay, mapViewState.showRoute, mapViewState.showAllDays, trip.days, generateRoute]);

  // Fit map when active day changes
  useEffect(() => {
    if (!mapViewState.showAllDays) {
      fitMapToPlaces();
    }
  }, [mapViewState.activeDay, mapViewState.showAllDays, fitMapToPlaces]);

  // Route animation effect
  useEffect(() => {
    if (!mapViewState.followRoute || routeData.length === 0) {
      setRouteAnimationIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setRouteAnimationIndex(prev => (prev + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, [mapViewState.followRoute, routeData]);

  // Handle place click
  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedPlace(place);
    setShowPopup(true);
    
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [parseFloat(place.longitude), parseFloat(place.latitude)],
        zoom: 16,
        duration: 1000
      });
    }
  }, []);

  // Calculate animation opacity - FIXED: Ensure opacity stays between 0 and 1
  const getAnimatedOpacity = useCallback(() => {
    if (!mapViewState.followRoute) return 0.8;
    
    // Use Math.abs and normalize to ensure value is between 0.3 and 1.0
    const sineValue = Math.sin(routeAnimationIndex * 0.1);
    const normalizedSine = (Math.abs(sineValue) + 1) / 2; // Convert [-1,1] to [0,1], then shift to [0.5,1]
    return 0.3 + 0.5 * normalizedSine; // Result will be between 0.3 and 0.8
  }, [mapViewState.followRoute, routeAnimationIndex]);

  // Get all places for current view
  const displayPlaces = getCurrentDayPlaces();

  return (
    <div className="relative w-full h-full">
      <MapGLWrapper
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        mapStyle={`mapbox://styles/mapbox/${mapViewState.mapStyle}`}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        attributionControl={false}
        reuseMaps
        style={{ position: 'absolute', top: 0, bottom: 0, width: '100%', height: '100%' }}
      >
        {/* Map Controls */}
        <NavigationControl position="bottom-right" />
        <GeolocateControl 
          position="bottom-right" 
          trackUserLocation
          showAccuracyCircle={false}
        />

        {/* Route Lines */}
        {routeData.map((route, index) => (
          <Source key={`route-${index}`} id={`route-${index}`} type="geojson" data={route}>
            <Layer
              id={`route-line-${index}`}
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': route.properties.color,
                'line-width': mapViewState.showAllDays ? 4 : 6,
                'line-opacity': getAnimatedOpacity() // FIXED: Use safe opacity calculation
              }}
            />
          </Source>
        ))}

        {/* Place Markers */}
        {displayPlaces.map((place, index) => {
          const typeInfo = getPlaceTypeInfo(place);
          const TypeIcon = typeInfo.icon;
          const isCurrentDay = !mapViewState.showAllDays || place.dayNumber === mapViewState.activeDay;
          const isHighlighted = highlightedPlace === place.id;
          
          return (
            <Marker
              key={`${place.id}-${place.dayNumber || ''}`}
              longitude={parseFloat(place.longitude)}
              latitude={parseFloat(place.latitude)}
              anchor="bottom"
            >
              <button
                onClick={() => handlePlaceClick(place)}
                onMouseEnter={() => onPlaceHighlight?.(place.id)}
                onMouseLeave={() => onPlaceHighlight?.(null)}
                className={`relative group transition-all duration-200 hover:scale-110 ${
                  isCurrentDay ? 'z-10' : 'z-5'
                } ${isHighlighted ? 'animate-bounce' : ''}`}
              >
                {/* Marker Pin */}
                <div className={`
                  w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center
                  ${isCurrentDay ? typeInfo.color : 'bg-gray-400'}
                  ${mapViewState.showAllDays && !isCurrentDay ? 'opacity-60' : ''}
                  ${isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-60' : ''}
                `}>
                  <TypeIcon className="w-5 h-5 text-white" />
                </div>
                
                {/* Place Index */}
                {!mapViewState.showAllDays && (
                  <div className={`absolute -top-2 -right-2 w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 ${
                    isHighlighted ? 'bg-yellow-300 border-yellow-400' : 'bg-white'
                  }`}>
                    {index + 1}
                  </div>
                )}

                {/* Day Badge for all days view */}
                {mapViewState.showAllDays && (
                  <div 
                    className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      isHighlighted ? 'ring-2 ring-yellow-400' : ''
                    }`}
                    style={{ backgroundColor: getDayColor(place.dayNumber || 1) }}
                  >
                    {place.dayNumber}
                  </div>
                )}

                {/* Pulse animation for active route or highlighted */}
                {(mapViewState.followRoute || isHighlighted) && isCurrentDay && (
                  <div className={`absolute inset-0 rounded-full animate-ping ${
                    isHighlighted ? 'bg-yellow-400' : typeInfo.color
                  } opacity-75`} />
                )}
              </button>
            </Marker>
          );
        })}

        {/* Place Popup */}
       {selectedPlace && showPopup && (
          <Popup
            longitude={parseFloat(selectedPlace.longitude)}
            latitude={parseFloat(selectedPlace.latitude)}
            anchor="bottom"
            onClose={() => setShowPopup(false)}
            closeButton={false}
            closeOnClick={false}
            offset={[0, -40]}
            className="z-50"
            maxWidth="none" // Allow custom width control
          >
            <div className="p-3 w-72 max-w-[90vw] bg-white rounded-xl shadow-lg border border-gray-100 max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">{selectedPlace.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{selectedPlace.address}</p>
                  
                  {/* Metadata */}
                  <div className="flex items-center space-x-3 text-xs text-gray-500 flex-wrap gap-1">
                    {selectedPlace.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{selectedPlace.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {selectedPlace.startTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{selectedPlace.startTime}</span>
                        {selectedPlace.endTime && <span> - {selectedPlace.endTime}</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowPopup(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  ×
                </button>
              </div>

              {/* Image */}
              {selectedPlace.image && (
                <div className="relative h-24 sm:h-32 mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={selectedPlace.image}
                    alt={selectedPlace.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Notes */}
              {selectedPlace.duration && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">Thời gian dự kiến: {Math.floor(selectedPlace.duration / 60)}h {selectedPlace.duration % 60}m</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`;
                    window.open(url, '_blank');
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors min-w-0"
                >
                  <Navigation className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Chỉ đường</span>
                </button>
                <button 
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  title="Chụp ảnh màn hình"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </Popup> 
        )}
      </MapGLWrapper>

      {/* Loading overlay */}
      {isLoadingRoute && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="bg-white rounded-xl p-4 shadow-lg flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">Đang tạo tuyến đường...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {displayPlaces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 backdrop-blur-sm">
          <div className="text-center p-8">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {mapViewState.showAllDays ? 'Chưa có địa điểm nào' : `Ngày ${mapViewState.activeDay} chưa có địa điểm`}
            </h3>
            <p className="text-gray-600">
              {mapViewState.showAllDays 
                ? 'Thêm địa điểm vào lịch trình để xem trên bản đồ'
                : 'Chọn ngày khác hoặc thêm địa điểm cho ngày này'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}