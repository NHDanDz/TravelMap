// app/dashboard/Map/components/ModernMapboxMap.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { 
  Map as MapGLComponent,
  NavigationControl, 
  GeolocateControl, 
  Marker, 
  Popup, 
  Source, 
  Layer,
  ViewStateChangeEvent
} from 'react-map-gl';
import type { Map as MapboxMap } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Place, PlaceType } from '../types';
import Image from 'next/image';
import { 
  Search, MapPin, Star, Filter, X, Menu, ChevronDown, 
  Coffee, Hotel, Utensils, Landmark, Building2, 
  Map as MapIcon, Navigation, Heart, Info, Clock, Phone, Globe,
  Camera, MessageCircle, ThumbsUp, Check, ChevronLeft,
  ChevronRight
} from 'lucide-react';
import MapboxDirections from './MapboxDirections';

// Create a forwarded ref wrapper for MapGL to fix the ref typing issue
const MapGL = forwardRef<MapboxMap, any>((props, ref) => {
  return <MapGLComponent {...props} ref={ref as any} />;
});
MapGL.displayName = 'MapGL';

// Define the Mapbox access token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

// Define props for our map component
interface ModernMapProps {
  initialLocation?: [number, number];
}

// Custom interface for map click events
interface MapClickEvent {
  lngLat: {
    lng: number;
    lat: number;
  };
  originalEvent: MouseEvent;
  features?: any[];
  point: [number, number];
}

// Custom interface for geolocate events
interface GeolocateEvent {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
}

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

// Main map component
const ModernMapboxMap: React.FC<ModernMapProps> = ({ initialLocation }) => {
  // Use MapboxMap type for the ref
  const mapRef = useRef<MapboxMap>(null);
  
  const [viewport, setViewport] = useState({
    latitude: initialLocation?.[0] || 21.0285,
    longitude: initialLocation?.[1] || 105.8542,
    zoom: 13
  });
  
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
  const [popupInfo, setPopupInfo] = useState<{ place: Place, x: number, y: number } | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  // Get user's current location on mount
  useEffect(() => {
    if (initialLocation) {
      setCurrentLocation(initialLocation);
      setViewport({
        latitude: initialLocation[0],
        longitude: initialLocation[1],
        zoom: 13
      });
      return;
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setViewport({
            latitude,
            longitude,
            zoom: 13
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default location if geolocation fails
          setCurrentLocation([21.0285, 105.8542]);
        }
      );
    } else {
      console.error('Geolocation not supported');
      setCurrentLocation([21.0285, 105.8542]);
    }
  }, [initialLocation]);

  // Perform initial search once we have a location
  useEffect(() => {
    if (currentLocation && !initialSearchDone) {
      handleLocationSelect(currentLocation[0], currentLocation[1]);
      setInitialSearchDone(true);
    }
  }, [currentLocation, initialSearchDone]);

  // Handle map click
  const handleMapClick = useCallback((event: MapClickEvent) => {
    // Check if click is on a marker or control
    if (event.originalEvent && 
        (event.originalEvent.target instanceof Element) && 
        (event.originalEvent.target.classList.contains('mapboxgl-marker') ||
         event.originalEvent.target.closest('.mapboxgl-ctrl-group') ||
         event.originalEvent.target.closest('.sidebar'))) {
      return;
    }
    
    const { lng, lat } = event.lngLat;
    handleLocationSelect(lat, lng);
  }, []);

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
    setShowDirections(true);
    
    // Fly to the place
    if (mapRef.current && place.latitude && place.longitude) {
      mapRef.current.flyTo({
        center: [parseFloat(place.longitude), parseFloat(place.latitude)],
        zoom: 16,
        duration: 1500
      });
    }
  };

  // Close place details panel
  const handleClosePlaceDetails = () => {
    setShowPlaceDetails(false);
    setSelectedPlace(null);
    setShowDirections(false);
  };

  // Handle viewport change
  const handleViewportChange = (evt: ViewStateChangeEvent) => {
    setViewport({
      latitude: evt.viewState.latitude,
      longitude: evt.viewState.longitude,
      zoom: evt.viewState.zoom
    });
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Mapbox Token Missing</h2>
          <p className="text-gray-600 mb-4">
            Please add your Mapbox access token to the .env.local file:
          </p>
          <div className="bg-gray-100 p-3 rounded text-left text-sm mb-4">
            <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here</code>
          </div>
          <p className="text-gray-600">
            You can get a token from the <a href="https://account.mapbox.com/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Mapbox website</a>.
          </p>
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
          <MapGL
            ref={mapRef}
            initialViewState={viewport}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            onMove={handleViewportChange}
            onClick={handleMapClick as any}
            attributionControl={false}
          >
            {/* Navigation Controls */}
            <NavigationControl position="bottom-right" />
            <GeolocateControl
              position="bottom-right"
              trackUserLocation
              onGeolocate={(e: any) => {
                // Cast the event to our custom interface
                const geoEvent = e as GeolocateEvent;
                if (geoEvent && geoEvent.coords) {
                  const { latitude, longitude } = geoEvent.coords;
                  setCurrentLocation([latitude, longitude]);
                  handleLocationSelect(latitude, longitude);
                }
              }}
            />
            
            {/* User's location marker */}
            {currentLocation && (
              <Marker 
                longitude={currentLocation[1]} 
                latitude={currentLocation[0]}
                anchor="bottom"
              >
                <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full" />
              </Marker>
            )}
            
            {/* Selected location marker */}
            {selectedLocation && (
              <Marker 
                longitude={selectedLocation[1]} 
                latitude={selectedLocation[0]}
                anchor="bottom"
              >
                <div className="w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
              </Marker>
            )}
            
            {/* Place markers */}
            {places.map((place) => (
              <Marker
                key={place.id || `${place.name}-${place.latitude}-${place.longitude}`}
                longitude={parseFloat(place.longitude)}
                latitude={parseFloat(place.latitude)}
                anchor="bottom"
                onClick={(e: any) => {
                  // Prevent click event from propagating to the map
                  if (e.originalEvent) {
                    e.originalEvent.stopPropagation();
                  }
                  setPopupInfo({ 
                    place, 
                    x: e.originalEvent ? e.originalEvent.clientX : 0, 
                    y: e.originalEvent ? e.originalEvent.clientY : 0 
                  });
                }}
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => handlePlaceSelect(place)}
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                    {place.type === 'restaurant' && <Utensils className="w-4 h-4 text-red-500" />}
                    {place.type === 'hotel' && <Hotel className="w-4 h-4 text-blue-500" />}
                    {place.type === 'tourist_attraction' && <Landmark className="w-4 h-4 text-green-500" />}
                    {place.type === 'cafe' && <Coffee className="w-4 h-4 text-yellow-500" />}
                    {place.type === 'museum' && <Building2 className="w-4 h-4 text-purple-500" />}
                    {!['restaurant', 'hotel', 'tourist_attraction', 'cafe', 'museum'].includes(place.type) && 
                      <MapPin className="w-4 h-4 text-gray-500" />
                    }
                  </div>
                </div>
              </Marker>
            ))}
            
            {/* Popups */}
            {popupInfo && (
              <Popup
                longitude={parseFloat(popupInfo.place.longitude)}
                latitude={parseFloat(popupInfo.place.latitude)}
                anchor="bottom"
                onClose={() => setPopupInfo(null)}
                closeButton={true}
                closeOnClick={false}
              >
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-medium text-sm mb-1">{popupInfo.place.name}</h3>
                  <div className="flex items-center mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm">{popupInfo.place.rating}</span>
                  </div>
                  {popupInfo.place.details?.address && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">{popupInfo.place.details.address}</p>
                  )}
                  <button 
                    className="w-full py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                    onClick={() => {
                      setPopupInfo(null);
                      handlePlaceSelect(popupInfo.place);
                    }}
                  >
                    View details
                  </button>
                </div>
              </Popup>
            )}
            
            {/* Routing - Use the MapboxDirections component when showing directions */}
            {showDirections && currentLocation && selectedPlace && (
              <MapboxDirections
                startPoint={currentLocation}
                endPoint={[parseFloat(selectedPlace.latitude), parseFloat(selectedPlace.longitude)]}
                mode="walking"
              />
            )}
          </MapGL>
          
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

export default ModernMapboxMap;