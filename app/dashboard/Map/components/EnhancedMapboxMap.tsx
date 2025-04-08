// app/dashboard/Map/components/EnhancedMapboxMap.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { NavigationControl, GeolocateControl, Source, Layer, ViewStateChangeEvent, Marker, Popup } from 'react-map-gl';
import MapGLWrapper from './MapGLWrapper';
import type { Map as MapboxMap } from 'mapbox-gl';
import * as turf from '@turf/turf';
import { Search, Navigation, MapPin, X } from 'lucide-react';
import AdvancedSearchControl from './AdvancedSearchControl';
import IsochronePanel from './IsochronePanel';
import TrafficToggle from './TrafficToggle';
import MapboxDirections from './MapboxDirections';

interface SelectedPlace {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

interface EnhancedMapboxMapProps {
  initialLocation?: [number, number];
}

const EnhancedMapboxMap: React.FC<EnhancedMapboxMapProps> = ({ initialLocation }) => {
  const mapRef = useRef<MapboxMap>(null);
  const [viewState, setViewState] = useState({
    longitude: initialLocation?.[1] || 105.8542,
    latitude: initialLocation?.[0] || 21.0285,
    zoom: 13
  });
  const [isTrafficVisible, setIsTrafficVisible] = useState(false);
  const [isochrones, setIsochrones] = useState<GeoJSON.FeatureCollection | null>(null);
  const [selectedTravelTime, setSelectedTravelTime] = useState(15); // 15 phút
  const [travelMode, setTravelMode] = useState<'walking' | 'cycling' | 'driving'>('walking');
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Lấy Mapbox token từ biến môi trường
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  // Lấy vị trí hiện tại khi component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([longitude, latitude]);
        },
        (error) => {
          console.error('Lỗi xác định vị trí:', error);
          // Dùng vị trí mặc định nếu không thể lấy vị trí hiện tại
          if (initialLocation) {
            setCurrentLocation([initialLocation[1], initialLocation[0]]);
          } else {
            setCurrentLocation([105.8542, 21.0285]); // Hà Nội
          }
        }
      );
    }
  }, [initialLocation]);

  // Tạo isochrone khi người dùng nhấp vào bản đồ
  const generateIsochrone = async (point: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/isochrone/v1/mapbox/${travelMode}/${point[0]},${point[1]}?` +
        `contours_minutes=${selectedTravelTime}&polygons=true&access_token=${mapboxToken}`
      );
      
      if (!response.ok) throw new Error('Không thể tạo isochrone');
      
      const data = await response.json();
      setIsochrones(data);
    } catch (error) {
      console.error('Lỗi khi tạo isochrone:', error);
    }
  };

  // Xử lý khi người dùng chọn địa điểm từ kết quả tìm kiếm
  const handlePlaceSelect = (place: SelectedPlace) => {
    setSelectedPlace(place);
    setShowPopup(true);
    setShowRoute(true);
    
    // Zoom đến địa điểm đã chọn
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: place.coordinates,
        zoom: 15,
        duration: 1500
      });
    }
  };

  // Xử lý sự kiện thay đổi viewport
  const handleViewStateChange = (evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  };

  return (
    <div className="relative h-full w-full">
      <MapGLWrapper
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        mapStyle={isTrafficVisible ? 
          "mapbox://styles/mapbox/traffic-day-v2" : 
          "mapbox://styles/mapbox/streets-v12"
        }
        {...viewState}
        onMove={handleViewStateChange}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl 
          position="bottom-right" 
          trackUserLocation 
        />
        
        {/* Lớp hiển thị Isochrone */}
        {isochrones && (
          <Source id="isochrone-data" type="geojson" data={isochrones}>
            <Layer
              id="isochrone-fill"
              type="fill"
              paint={{
                'fill-color': '#4287f5',
                'fill-opacity': 0.3
              }}
            />
            <Layer
              id="isochrone-border"
              type="line"
              paint={{
                'line-color': '#2563eb',
                'line-width': 2
              }}
            />
          </Source>
        )}

        {/* Hiển thị vị trí hiện tại */}
        {currentLocation && (
          <Marker 
            longitude={currentLocation[0]} 
            latitude={currentLocation[1]}
          >
            <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full" />
          </Marker>
        )}
        
        {/* Hiển thị địa điểm đã chọn */}
        {selectedPlace && (
          <Marker 
            longitude={selectedPlace.coordinates[0]} 
            latitude={selectedPlace.coordinates[1]}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-red-500 -mt-4" />
            </div>
          </Marker>
        )}
        
        {/* Hiển thị popup thông tin địa điểm */}
        {selectedPlace && showPopup && (
          <Popup
            longitude={selectedPlace.coordinates[0]}
            latitude={selectedPlace.coordinates[1]}
            anchor="bottom"
            onClose={() => setShowPopup(false)}
            closeButton={true}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-medium text-sm mb-1">{selectedPlace.name}</h3>
              {selectedPlace.address && (
                <p className="text-xs text-gray-600 mb-2">{selectedPlace.address}</p>
              )}
              <button 
                className="w-full py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition flex items-center justify-center"
                onClick={() => setShowRoute(true)}
              >
                <Navigation className="w-3 h-3 mr-1" />
                Chỉ đường
              </button>
            </div>
          </Popup>
        )}
        
        {/* Hiển thị đường đi */}
        {currentLocation && selectedPlace && showRoute && (
          <MapboxDirections 
            startPoint={currentLocation}
            endPoint={[selectedPlace.coordinates[0], selectedPlace.coordinates[1]]}
            mode={travelMode}
          />
        )}
      </MapGLWrapper>
      
      {/* Bảng điều khiển */}
      <div className="absolute top-4 left-4 z-10">
        <AdvancedSearchControl onPlaceSelect={handlePlaceSelect} />
      </div>
      
      <div className="absolute top-4 right-4 z-10">
        <TrafficToggle 
          isActive={isTrafficVisible} 
          onChange={() => setIsTrafficVisible(!isTrafficVisible)} 
        />
      </div>
      
      <div className="absolute bottom-24 right-4 z-10">
        <IsochronePanel 
          travelTime={selectedTravelTime}
          onTravelTimeChange={setSelectedTravelTime}
          onGenerateIsochrone={() => {
            if (mapRef.current) {
              const center = mapRef.current.getCenter();
              generateIsochrone([center.lng, center.lat]);
            }
          }}
        />
      </div>

      {/* Chọn phương thức di chuyển */}
      <div className="absolute bottom-24 left-4 z-10 bg-white p-3 rounded-lg shadow-lg">
        <h3 className="text-sm font-medium mb-2">Phương thức di chuyển</h3>
        <div className="flex flex-col space-y-2">
          <button
            className={`px-3 py-1.5 text-sm rounded-md flex items-center ${travelMode === 'walking' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            onClick={() => setTravelMode('walking')}
          >
            <span className="mr-2">🚶</span> Đi bộ
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md flex items-center ${travelMode === 'cycling' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            onClick={() => setTravelMode('cycling')}
          >
            <span className="mr-2">🚲</span> Xe đạp
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md flex items-center ${travelMode === 'driving' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
            onClick={() => setTravelMode('driving')}
          >
            <span className="mr-2">🚗</span> Xe hơi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMapboxMap;