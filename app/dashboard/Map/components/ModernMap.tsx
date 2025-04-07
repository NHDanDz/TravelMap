// app/dashboard/Map/components/ModernMap.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
// We'll load CSS dynamically to avoid TypeScript import errors
import { Place, PlaceType } from '../types';
import Image from 'next/image';
import { 
  Search, MapPin, Star, Filter, X, Menu, ChevronDown, 
  Coffee, Hotel, Utensils, Landmark, Building2, CakeSlice, 
  Map, Navigation, Heart, Info, Clock, Phone, Globe,
  Camera, MessageCircle, ThumbsUp, Check, ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Define props for our map component
interface ModernMapProps {
  initialLocation?: [number, number];
}

// Create a custom icon factory for different place types
const createMarkerIcon = (type: PlaceType) => {
  // Color mapping for different categories
  const colors: Record<string, string> = {
    restaurant: '#FF5733',
    cafe: '#C70039',
    hotel: '#581845',
    tourist_attraction: '#2E86C1',
    museum: '#17A589',
    default: '#3498DB',
  };
  
  const baseType = type.split('_')[0] as keyof typeof colors;
  const color = colors[baseType] || colors.default;
  
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="background-color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
        <div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// User location marker icon
const userLocationIcon = new L.Icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map events and location selection
const MapEventsHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      // Don't trigger on clicks on controls or UI elements
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control') || target.closest('.map-controls')) {
        return;
      }
      
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  
  return null;
};

// Routing component
const RoutingControl = ({ 
  startPoint, 
  endPoint 
}: { 
  startPoint: L.LatLng; 
  endPoint: L.LatLng;
}) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new routing control
    try {
      const control = L.Routing.control({
        waypoints: [startPoint, endPoint],
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: '#0073bb', weight: 4 }] 
        },
        show: true,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: () => null,
        containerClassName: 'tripadvisor-routing-container',
      });

      control.addTo(map);
      routingControlRef.current = control;

      // Add custom CSS for the routing container
      const style = document.createElement('style');
      style.textContent = `
        .tripadvisor-routing-container {
          background: white;
          padding: 16px;
          margin: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          max-height: 300px;
          overflow-y: auto;
          width: 320px;
          position: absolute;
          bottom: 24px;
          left: 24px;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .tripadvisor-routing-container h2 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #333;
        }
        .leaflet-routing-alt {
          max-height: none !important;
        }
        .leaflet-routing-alt h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 8px 0;
        }
        .leaflet-routing-alt table {
          width: 100%;
          border-collapse: collapse;
        }
        .leaflet-routing-alt tr:hover {
          background-color: #f5f5f5;
        }
        .leaflet-routing-alt td {
          padding: 8px 4px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
      `;
      document.head.appendChild(style);

      return () => {
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
        }
        document.head.removeChild(style);
      };
    } catch (error) {
      console.error('Error setting up routing:', error);
    }
  }, [map, startPoint, endPoint]);

  return null;
};

// Place details component
const PlaceDetails = ({ 
  place, 
  onClose 
}: { 
  place: Place; 
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'reviews'>('info');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<Place | null>(null);

  useEffect(() => {
    if (place.id) {
      setLoading(true);
      fetch(`/api/places/${place.id}`)
        .then(res => res.json())
        .then(data => {
          setDetails(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching place details:', err);
          setLoading(false);
        });
    }
  }, [place.id]);

  const displayPlace = details || place;

  const renderRating = (rating: string) => {
    return (
      <div className="flex items-center">
        <span className="text-sm font-medium">{rating}</span>
      </div>
    );
  };
  

  return (
    <div className="bg-white h-full overflow-auto">
      {/* Header with image */}
      <div className="relative h-56">
        {displayPlace.photo ? (
          <Image
            src={displayPlace.photo.images.large.url}
            alt={displayPlace.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Camera className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <div className="absolute top-0 left-0 w-full flex justify-between items-center p-3">
          <button
            onClick={onClose}
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            aria-label="Save"
          >
            <Heart className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{displayPlace.name}</h2>
        <div className="flex items-center gap-2 mb-3">
          {renderRating(displayPlace.rating)}
          <pre>{JSON.stringify(displayPlace, null, 2)}</pre>
          <span className="text-sm text-gray-500">({displayPlace.details?.rating_count || '0'} reviews)</span>
        </div>

        {/* Tags/Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
            {displayPlace.type.replace('_', ' ')}
          </span>
          {displayPlace.details?.price_level && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
              {displayPlace.details.price_level}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <div className="flex">
            <button
              className={`pb-2 px-4 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('info')}
            >
              About
            </button>
            <button
              className={`pb-2 px-4 font-medium text-sm ${
                activeTab === 'photos'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('photos')}
            >
              Photos
            </button>
            <button
              className={`pb-2 px-4 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'info' && (
              <div className="space-y-4">
                {/* Location */}
                {displayPlace.details?.address && (
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm mb-1">Location</h3>
                      <p className="text-sm text-gray-600">{displayPlace.details.address}</p>
                    </div>
                  </div>
                )}

                {/* Hours */}
                {displayPlace.details?.openingHours && (
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm mb-1">Hours</h3>
                      <p className="text-sm text-gray-600">{displayPlace.details.openingHours}</p>
                    </div>
                  </div>
                )}

                {/* Contact */}
                {(displayPlace.details?.phone || displayPlace.details?.website) && (
                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm mb-1">Contact</h3>
                      {displayPlace.details?.phone && (
                        <p className="text-sm text-gray-600 mb-1">{displayPlace.details.phone}</p>
                      )}
                      {displayPlace.details?.website && (
                        <a
                          href={displayPlace.details.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Visit website
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {displayPlace.details?.description && (
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm mb-1">About</h3>
                      <p className="text-sm text-gray-600">{displayPlace.details.description}</p>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {displayPlace.details?.outdoor_seating === 'yes' && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Outdoor seating</span>
                      </div>
                    )}
                    {displayPlace.details?.takeaway === 'yes' && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Takeout available</span>
                      </div>
                    )}
                    {displayPlace.details?.delivery === 'yes' && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Delivery available</span>
                      </div>
                    )}
                    {displayPlace.details?.internet_access === 'yes' && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Free WiFi</span>
                      </div>
                    )}
                    {displayPlace.details?.air_conditioning === 'yes' && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Air conditioning</span>
                      </div>
                    )}
                    {displayPlace.details?.wheelchair === 'yes' && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Wheelchair accessible</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 mt-4">
                  <button className="w-full py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Directions
                  </button>
                  {displayPlace.details?.website && (
                    <a
                      href={displayPlace.details.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-white border border-green-600 text-green-600 font-medium rounded-full hover:bg-green-50 transition text-center"
                    >
                      Visit website
                    </a>
                  )}
                  {displayPlace.details?.phone && (
                    <a
                      href={`tel:${displayPlace.details.phone}`}
                      className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition text-center"
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div>
                {displayPlace.photo ? (
                  <div className="relative h-80 w-full rounded-lg overflow-hidden">
                    <Image
                      src={displayPlace.photo.images.large.url}
                      alt={displayPlace.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-80 w-full bg-gray-200 flex items-center justify-center rounded-lg">
                    <Camera className="w-16 h-16 text-gray-400" />
                    <p className="text-gray-500 mt-4">No photos available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Reviews</h3>
                  <button className="text-sm text-green-600 font-medium">Write a review</button>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No reviews available yet</p>
                  <button className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-full hover:bg-green-700 transition">
                    Be the first to review
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Place card component for the sidebar
const PlaceCard = ({ 
  place, 
  onClick 
}: { 
  place: Place; 
  onClick: () => void;
}) => {
  // Helper to get rating stars
  const renderRatingStars = (rating: string) => {
    const numRating = parseFloat(rating) || 0;
    return (
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= numRating
                ? 'text-green-600 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex h-24">
        <div className="relative w-24 h-full">
          {place.photo ? (
            <Image
              src={place.photo.images.large.url}
              alt={place.name}
              fill
              className="object-cover"
              sizes="100px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Camera className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 p-3">
          <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">{place.name}</h3>
          <div className="mb-1">
            {renderRatingStars(place.rating)}
          </div>
          {place.details?.address && (
            <div className="flex items-start text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{place.details.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Filter component for the sidebar
const FilterSection = ({
  placeType,
  searchRadius,
  onPlaceTypeChange,
  onRadiusChange,
  onSearch,
}: {
  placeType: PlaceType;
  searchRadius: string;
  onPlaceTypeChange: (type: PlaceType) => void;
  onRadiusChange: (radius: string) => void;
  onSearch: () => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="font-medium text-gray-700 mb-3">Filters</h3>
      
      {/* Place type filters */}
      <div className="mb-4">
        <h4 className="text-sm text-gray-500 mb-2">Place Type</h4>
        <div className="flex flex-wrap gap-2">
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
              placeType === 'restaurant' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => onPlaceTypeChange('restaurant')}
          >
            <Utensils className="w-3 h-3" />
            Restaurants
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
              placeType === 'hotel' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => onPlaceTypeChange('hotel')}
          >
            <Hotel className="w-3 h-3" />
            Hotels
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
              placeType === 'tourist_attraction' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => onPlaceTypeChange('tourist_attraction')}
          >
            <Landmark className="w-3 h-3" />
            Attractions
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
              placeType === 'cafe' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => onPlaceTypeChange('cafe')}
          >
            <Coffee className="w-3 h-3" />
            Cafes
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
              placeType === 'museum' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => onPlaceTypeChange('museum')}
          >
            <Building2 className="w-3 h-3" />
            Museums
          </button>
        </div>
      </div>
      
      {/* Distance filter */}
      <div className="mb-4">
        <h4 className="text-sm text-gray-500 mb-2">Distance</h4>
        <div className="flex gap-2">
          {['500', '1000', '2000', '5000'].map((radius) => (
            <button
              key={radius}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                searchRadius === radius ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => onRadiusChange(radius)}
            >
              {radius === '500' ? '500m' : 
               radius === '1000' ? '1km' : 
               radius === '2000' ? '2km' : '5km'}
            </button>
          ))}
        </div>
      </div>
      
      <button
        className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
        onClick={onSearch}
      >
        Apply Filters
      </button>
    </div>
  );
};

// Load Leaflet CSS dynamically
const loadLeafletCSS = () => {
  if (typeof window !== 'undefined') {
    // Check if CSS is already loaded
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCSS);
    }
    
    if (!document.querySelector('link[href*="leaflet-routing-machine.css"]')) {
      const routingCSS = document.createElement('link');
      routingCSS.rel = 'stylesheet';
      routingCSS.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
      document.head.appendChild(routingCSS);
    }
  }
};

// Main map component
const ModernMap: React.FC<ModernMapProps> = ({ initialLocation }) => {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeType, setPlaceType] = useState<PlaceType>('restaurant');
  const [searchRadius, setSearchRadius] = useState('1000');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [initialSearchDone, setInitialSearchDone] = useState(false);

  // Load CSS on mount
  useEffect(() => {
    loadLeafletCSS();
  }, []);

  // Get user's current location on mount
  useEffect(() => {
    if (initialLocation) {
      setCurrentLocation(initialLocation);
      return;
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Paris if location access is denied
          setCurrentLocation([48.8566, 2.3522]);
        }
      );
    } else {
      console.error('Geolocation not supported');
      setCurrentLocation([48.8566, 2.3522]); // Default to Paris
    }
  }, [initialLocation]);

  // Perform initial search once we have a location
  useEffect(() => {
    if (currentLocation && !initialSearchDone) {
      handleLocationSelect(currentLocation[0], currentLocation[1]);
      setInitialSearchDone(true);
    }
  }, [currentLocation, initialSearchDone]);

  // Handle selecting a location on the map
  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
    searchNearbyPlaces(lat, lng);
  }, [placeType, searchRadius]);

  // Search for places near a location
  const searchNearbyPlaces = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        type: placeType,
        radius: searchRadius
      });
  
      const response = await fetch(`/api/places?${params.toString()}`);
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

  // Apply filters and search again
  const handleApplyFilters = useCallback(() => {
    if (selectedLocation) {
      searchNearbyPlaces(selectedLocation[0], selectedLocation[1]);
    } else if (currentLocation) {
      searchNearbyPlaces(currentLocation[0], currentLocation[1]);
    }
  }, [selectedLocation, currentLocation, placeType, searchRadius]);

  // Handle selecting a place
  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setShowPlaceDetails(true);
  };

  // Close place details panel
  const handleClosePlaceDetails = () => {
    setShowPlaceDetails(false);
    setSelectedPlace(null);
  };

  if (!currentLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-green-500 border-green-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm py-3 px-4 flex items-center justify-between">
        <button 
          className="md:hidden"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex-1 max-w-lg mx-auto relative">
          <input
            type="text"
            placeholder="Search for places..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <div className="hidden md:block">
          <button 
            className="bg-white p-2 rounded-full shadow hover:bg-gray-50"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar for search results */}
        {showSidebar && (
          <div className="w-full md:w-80 lg:w-96 bg-gray-50 overflow-y-auto z-10 absolute md:relative inset-0">
            <div className="p-4">
              {/* Filters */}
              <FilterSection
                placeType={placeType}
                searchRadius={searchRadius}
                onPlaceTypeChange={setPlaceType}
                onRadiusChange={setSearchRadius}
                onSearch={handleApplyFilters}
              />
              
              {/* Places List */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-gray-800">Places Nearby</h2>
                  {places.length > 0 && (
                    <span className="text-sm text-gray-500">{places.length} results</span>
                  )}
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-10 h-10 border-4 border-t-green-500 border-green-200 rounded-full animate-spin"></div>
                  </div>
                ) : places.length > 0 ? (
                  <div className="space-y-3">
                    {places.map((place) => (
                      <PlaceCard
                        key={place.id || `${place.name}-${place.latitude}-${place.longitude}`}
                        place={place}
                        onClick={() => handlePlaceSelect(place)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No places found. Try selecting a different location or changing your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Map View */}
        <div className="flex-1 relative">
          <MapContainer
            center={currentLocation}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User's location marker */}
            <Marker position={currentLocation} icon={userLocationIcon}>
              <Popup>Your location</Popup>
            </Marker>
            
            {/* Selected location marker */}
            {selectedLocation && (
              <Marker position={selectedLocation} icon={userLocationIcon}>
                <Popup>Selected location</Popup>
              </Marker>
            )}
            
            {/* Place markers */}
            {places.map((place) => (
              <Marker
                key={place.id || `${place.name}-${place.latitude}-${place.longitude}`}
                position={[parseFloat(place.latitude), parseFloat(place.longitude)]}
                icon={createMarkerIcon(place.type)}
                eventHandlers={{
                  click: () => handlePlaceSelect(place)
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-medium mb-1">{place.name}</h3>
                    <div className="flex items-center mb-1">
                      <Star className="w-4 h-4 text-green-600 fill-current mr-1" />
                      <span>{place.rating}</span>
                    </div>
                    <button 
                      className="mt-2 w-full py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      onClick={() => handlePlaceSelect(place)}
                    >
                      View details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Map event handler for location selection */}
            <MapEventsHandler onLocationSelect={handleLocationSelect} />
            
            {/* Routing between current location and selected place */}
            {selectedPlace && (
              <RoutingControl
                startPoint={L.latLng(currentLocation[0], currentLocation[1])}
                endPoint={L.latLng(parseFloat(selectedPlace.latitude), parseFloat(selectedPlace.longitude))}
              />
            )}
            
            {/* Map controls */}
            <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
              <button 
                className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentLocation([latitude, longitude]);
                        handleLocationSelect(latitude, longitude);
                      }
                    );
                  }
                }}
              >
                <Navigation className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </MapContainer>
          
          {/* Place details panel */}
          {showPlaceDetails && selectedPlace && (
            <div className="absolute top-0 right-0 h-full w-full md:w-96 lg:w-1/3 z-[1001] shadow-lg overflow-hidden">
              <PlaceDetails 
                place={selectedPlace} 
                onClose={handleClosePlaceDetails} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernMap;