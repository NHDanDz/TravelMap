'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import Image from 'next/image';
import { Place, PlaceType } from '../types';
import NearbyPlacesControl from './NearbyPlacesControl';
import PlaceDetails from './PlaceDetails';

interface MapComponentProps {
  places: Place[];
  onLocationSelect?: (lat: number, lng: number) => void;
}

interface LocationMarkerProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  onSearch: (type: PlaceType, radius: number) => Promise<void>;
  placeType: PlaceType;
  searchRadius: string;
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

// Các biểu tượng cho từng loại địa điểm
const createCategoryIcon = (category: string) => {
  const colors: {[key: string]: string} = {
    restaurant: '#FF5733', // Đỏ cam
    fast_food: '#FFC300', // Vàng
    cafe: '#C70039', // Đỏ đậm
    bar: '#900C3F', // Hồng đậm
    hotel: '#581845', // Tím đậm
    tourist_attraction: '#2E86C1', // Xanh dương
    museum: '#17A589', // Xanh lá
    entertainment: '#D35400', // Cam
    mall: '#8E44AD', // Tím
    hospital: '#E74C3C', // Đỏ
    default: '#3498DB', // Xanh dương mặc định
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

    // Xóa control cũ nếu có
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (error) {
        console.error('Error removing routing control:', error);
      }
    }

    // Tạo control mới
    try {
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
        router: L.Routing.osrmv1({
          language: 'vi',
          profile: 'foot',
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        })
      }).addTo(map);

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

function LocationMarker({ 
  onLocationSelect,
  onSearch,
  placeType,
  searchRadius
}: LocationMarkerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click(e) {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control') || target.closest('.nearby-controls')) {
        return;
      }
      
      setPosition(e.latlng);
      onLocationSelect?.(e.latlng.lat, e.latlng.lng);
      onSearch(placeType, parseInt(searchRadius));
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}>
      <Popup>Vị trí đã chọn</Popup>
    </Marker>
  );
}

export default function MapComponent({ places, onLocationSelect }: MapComponentProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [localPlaces, setLocalPlaces] = useState<Place[]>(places);
  const [isSearching, setIsSearching] = useState(false);
  const [placeType, setPlaceType] = useState<PlaceType>('restaurant');
  const [searchRadius, setSearchRadius] = useState('1000');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);

  useEffect(() => {
    setLocalPlaces(places);
  }, [places]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          console.error('Lỗi khi lấy vị trí:', error);
          setLoading(false);
        }
      );
    } else {
      console.error('Trình duyệt không hỗ trợ geolocation');
      setLoading(false);
    }
  }, []);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setSelectedLocation(L.latLng(lat, lng));
    onLocationSelect?.(lat, lng);
  }, [onLocationSelect]);

  const handleNearbySearch = useCallback(async (type: PlaceType, radius: number) => {
    if (!selectedLocation) return;
    
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        lat: selectedLocation.lat.toString(),
        lng: selectedLocation.lng.toString(),
        type,
        radius: radius.toString()
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
      setLocalPlaces([]); 
      setTimeout(() => {
        setLocalPlaces(data); 
      }, 100);
  
    } catch (error) {
      console.error('Error searching nearby places:', error);
      alert('Lỗi khi tìm kiếm địa điểm');
    } finally {
      setIsSearching(false);
    }
  }, [selectedLocation]);

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setShowPlaceDetails(true);
  };

  const handlePlaceDetailsClose = () => {
    setShowPlaceDetails(false);
    setSelectedPlace(null);
  };

  if (loading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={currentLocation || [21.0285, 105.8542]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {currentLocation && (
          <Marker position={currentLocation} icon={customIcon}>
            <Popup>Vị trí của bạn</Popup>
          </Marker>
        )}

        <LocationMarker 
          onLocationSelect={handleLocationSelect}
          onSearch={handleNearbySearch}
          placeType={placeType}
          searchRadius={searchRadius}
        />

        <NearbyPlacesControl
          selectedLocation={selectedLocation}
          placeType={placeType}
          searchRadius={searchRadius}
          onPlaceTypeChange={setPlaceType}
          onRadiusChange={setSearchRadius}
          isSearching={isSearching}
        />

        {currentLocation && selectedLocation && (
          <RoutingMachine
            startPoint={L.latLng(currentLocation[0], currentLocation[1])}
            endPoint={selectedLocation}
          />
        )}

        {localPlaces.map((place, index) => (
          <Marker
            key={`${place.name}-${index}`}
            position={[Number(place.latitude), Number(place.longitude)]}
            icon={createCategoryIcon(place.type)}
            eventHandlers={{
              click: () => handlePlaceSelect(place)
            }}
          >
            <Popup>
              <div className="min-w-[250px]">
                <h3 className="text-sm font-medium mb-1">{place.name}</h3>
                {place.photo && (
                  <div className="relative w-full h-32 mb-2 overflow-hidden rounded">
                    <Image
                      src={place.photo.images.large.url}
                      alt={place.name}
                      fill
                      className="object-cover"
                      sizes="250px"
                    />
                  </div>
                )}
                {place.details && (
                  <div className="text-sm space-y-1">
                    {place.details.openingHours && (
                      <p>⏰ {place.details.openingHours}</p>
                    )}
                    {place.details.phone && (
                      <p>📞 {place.details.phone}</p>
                    )}
                    {place.details.cuisine && (
                      <p>🍴 {place.details.cuisine}</p>
                    )}
                    {place.details.website && (
                      <a href={place.details.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline">
                        🌐 Website
                      </a>
                    )}
                  </div>
                )}
                <div className="flex items-center mt-2">
                  <div className="text-yellow-400">
                    {(() => {
                      const rating = Number(place.rating) || 0;
                      const roundedRating = Math.min(5, Math.max(0, Math.round(rating)));
                      const emptyStars = Math.max(0, 5 - roundedRating);
                      return (
                        <>
                          {'★'.repeat(roundedRating)}
                          <span className="text-gray-300">
                            {'★'.repeat(emptyStars)}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
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
      </MapContainer>
      
      {showPlaceDetails && selectedPlace && (
        <div className="absolute top-0 right-0 w-full md:w-1/3 h-full z-[1001] bg-white shadow-lg overflow-y-auto">
          <PlaceDetails place={selectedPlace} onClose={handlePlaceDetailsClose} />
        </div>
      )}
    </div>
  );
}