// app/dashboard/Map/components/DynamicMap.tsx
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ChevronDown } from 'lucide-react';
import { Place } from '../types';
import PlaceDetails from './PlaceDetails';
import Image from 'next/image';

// Ensure Leaflet CSS is loaded
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

interface DynamicMapProps {
  currentLocation: [number, number] | null;
  places: Place[];
  onLocationSelect: (lat: number, lng: number) => void;
  loading: boolean;
  selectedPlace: Place | null;
  showPlaceDetails: boolean;
  onPlaceSelect: (place: Place) => void;
  onPlaceDetailsClose: () => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

interface LocationMarkerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

interface RoutingMachineProps {
  startPoint: L.LatLng;
  endPoint: L.LatLng;
}

// Custom icon configuration
const customIcon = new L.Icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Category-specific icons
const createCategoryIcon = (category: string) => {
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

// Routing Machine component
function RoutingMachine({ startPoint, endPoint }: RoutingMachineProps) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove old control if exists
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (error) {
        console.error('Error removing routing control:', error);
      }
    }

    // Create new control
    try {
      // @ts-ignore - TypeScript doesn't recognize the Routing property on L
      const routingControl = L.Routing.control({
        waypoints: [startPoint, endPoint],
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: '#6366F1', weight: 4 }]
        },
        show: true,
        addWaypoints: false,
        draggableWaypoints: true,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: () => null,
        containerClassName: 'routing-container',
        position: 'bottomleft',
      });

      routingControl.addTo(map);
      routingControlRef.current = routingControl;
    } catch (error) {
      console.error('Error creating routing control:', error);
    }

    const style = document.createElement('style');
    style.textContent = `
      .routing-container {
        background: white;
        padding: 10px;
        margin: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
      }
      .leaflet-routing-container {
        background-color: white;
        padding: 10px;
        margin: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-height: 300px;
        overflow-y: auto;
        width: 300px;
        position: absolute;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
      }
      .custom-div-icon {
        background: none;
        border: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (error) {
          console.error('Error removing routing control on cleanup:', error);
        }
      }
      document.head.removeChild(style);
    };
  }, [map, startPoint, endPoint]);

  return null;
}

// Location marker component
function LocationMarker({ onLocationSelect }: LocationMarkerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click(e) {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control') || target.closest('.nearby-controls')) {
        return;
      }
      
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}>
      <Popup>Vị trí đã chọn</Popup>
    </Marker>
  );
}

// Main DynamicMap component
const DynamicMap: React.FC<DynamicMapProps> = ({
  currentLocation,
  places,
  onLocationSelect,
  loading,
  selectedPlace,
  showPlaceDetails,
  onPlaceSelect,
  onPlaceDetailsClose,
  showSidebar,
  setShowSidebar
}) => {
  // Safe image URL getter
  const getPlaceImageUrl = (place: Place) => {
    if (place.photo?.images?.large?.url) {
      return place.photo.images.large.url;
    }
    return '/images/placeholder-image.jpg'; // Fallback image
  };

  if (!currentLocation) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toggle Sidebar Button */}
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
      <MapContainer
        center={currentLocation}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Current Location Marker */}
        <Marker position={currentLocation} icon={customIcon}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>
        
        {/* Location Selection Marker */}
        <LocationMarker onLocationSelect={onLocationSelect} />
        
        {/* Place Markers */}
        {places.map((place, index) => (
          <Marker
            key={`${place.name}-${index}`}
            position={[Number(place.latitude), Number(place.longitude)]}
            icon={createCategoryIcon(place.type)}
            eventHandlers={{
              click: () => onPlaceSelect(place)
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
                  onClick={() => onPlaceSelect(place)}
                  className="mt-2 w-full py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Xem chi tiết
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Routing Machine */}
        {selectedPlace && currentLocation && (
          <RoutingMachine
            startPoint={L.latLng(currentLocation[0], currentLocation[1])}
            endPoint={L.latLng(Number(selectedPlace.latitude), Number(selectedPlace.longitude))}
          />
        )}
      </MapContainer>
      
      {/* Place Details Panel */}
      {showPlaceDetails && selectedPlace && (
        <div className="absolute top-0 right-0 w-full md:w-1/3 h-full bg-white shadow-lg overflow-y-auto z-[1001]">
          <PlaceDetails place={selectedPlace} onClose={onPlaceDetailsClose} />
        </div>
      )}
    </>
  );
};

export default DynamicMap;