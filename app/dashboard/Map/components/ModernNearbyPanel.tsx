// app/dashboard/Map/components/ModernNearbyPanel.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { 
  MapPin, 
  Search, 
  Loader2, 
  Star, 
  Clock, 
  DollarSign,
  Coffee, 
  Utensils, 
  Hotel, 
  ShoppingBag, 
  Landmark,
  Building,
  HeartPulse,
  Filter,
  RefreshCw,
  X, 
} from 'lucide-react';
import { Place, PlaceType } from '../types';

// Place type configuration
const placeTypeConfig = {
  restaurant: { icon: Utensils, color: 'bg-red-100 text-red-700 border-red-200', label: 'Nhà hàng' },
  cafe: { icon: Coffee, color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Quán cafe' },
  hotel: { icon: Hotel, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Khách sạn' },
  tourist_attraction: { icon: Landmark, color: 'bg-green-100 text-green-700 border-green-200', label: 'Du lịch' },
  mall: { icon: ShoppingBag, color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Mua sắm' },
  hospital: { icon: HeartPulse, color: 'bg-pink-100 text-pink-700 border-pink-200', label: 'Y tế' },
  entertainment: { icon: Building, color: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Giải trí' }
};

interface ModernNearbyPanelProps {
  currentLocation: [number, number] | null;
  onPlacesFound: (places: Place[]) => void;
  onPlaceSelect: (place: Place) => void;
}

const ModernNearbyPanel: React.FC<ModernNearbyPanelProps> = ({ 
  currentLocation, 
  onPlacesFound,
  onPlaceSelect 
}) => {
  const [selectedType, setSelectedType] = useState<PlaceType>('restaurant');
  const [radius, setRadius] = useState<string>('1000');
  const [isSearching, setIsSearching] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search for nearby places
  const searchNearbyPlaces = useCallback(async () => {
    if (!currentLocation) {
      setError('Vị trí hiện tại không khả dụng');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    setNearbyPlaces([]);
    
    try {
      const [lng, lat] = currentLocation;
      
      // Use TripAdvisor API through our backend
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        type: selectedType,
        radius: radius,
        language: 'vi'
      });
      
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
      
      const places = await response.json() as Place[];
      setNearbyPlaces(places);
      onPlacesFound(places);
      
      if (places.length === 0) {
        setError('Không tìm thấy địa điểm nào phù hợp');
      }
      
    } catch (error) {
      console.error('Error searching nearby places:', error);
      setError(error instanceof Error ? error.message : 'Lỗi khi tìm kiếm địa điểm');
      
      // Mock data as fallback for demo
      const mockPlaces: Place[] = [
        {
          id: 'mock-1',
          name: 'Nhà hàng Ngon',
          latitude: String(currentLocation[1] + 0.001),
          longitude: String(currentLocation[0] + 0.001),
          rating: '4.5',
          type: selectedType,
          details: {
            address: '123 Phố ABC, Quận 1, TP.HCM',
            openingHours: '10:00 - 22:00',
            price_level: '$$'
          }
        },
        {
          id: 'mock-2',
          name: 'Quán Cafe Xinh',
          latitude: String(currentLocation[1] - 0.001),
          longitude: String(currentLocation[0] - 0.001),
          rating: '4.2',
          type: selectedType,
          details: {
            address: '456 Đường XYZ, Quận 2, TP.HCM',
            openingHours: '07:00 - 23:00',
            price_level: '$'
          }
        }
      ];
      
      setNearbyPlaces(mockPlaces);
      onPlacesFound(mockPlaces);
    } finally {
      setIsSearching(false);
    }
  }, [currentLocation, selectedType, radius, onPlacesFound]);

  // Get price level indicator
  const getPriceLevelIndicator = (level?: string) => {
    if (!level) return null;
    const count = level.length;
    return (
      <div className="flex items-center">
        {Array(count).fill(0).map((_, i) => (
          <DollarSign key={i} className="w-3 h-3 text-green-600" />
        ))}
      </div>
    );
  };

  // Format rating
  const formatRating = (rating: string) => {
    const numRating = parseFloat(rating) || 0;
    return numRating.toFixed(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-semibold text-gray-900">Địa điểm gần đây</h2>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Type Selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Object.entries(placeTypeConfig).slice(0, 4).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type as PlaceType)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  selectedType === type
                    ? config.color + ' border shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-medium">{config.label}</div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-top duration-300">
            {/* Type Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Loại địa điểm</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as PlaceType)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              >
                {Object.entries(placeTypeConfig).map(([type, config]) => (
                  <option key={type} value={type}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Radius Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Bán kính: {radius === '500' ? '500m' : radius === '1000' ? '1km' : radius === '2000' ? '2km' : '5km'}
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>500m</span>
                <span>2.5km</span>
                <span>5km</span>
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={searchNearbyPlaces}
          disabled={!currentLocation || isSearching}
          className={`w-full mt-3 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            !currentLocation ? 
              'bg-gray-100 text-gray-400 cursor-not-allowed' :
              'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang tìm kiếm...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Tìm địa điểm gần đây</span>
            </>
          )}
        </button>

        {!currentLocation && (
          <p className="text-sm text-amber-600 text-center mt-2 bg-amber-50 p-2 rounded-lg">
            Vui lòng cho phép truy cập vị trí để tìm kiếm
          </p>
        )}
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <div className="flex">
              <X className="w-5 h-5 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Lỗi tìm kiếm</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {nearbyPlaces.length > 0 && (
          <div className="divide-y divide-gray-100">
            {nearbyPlaces.map((place, index) => {
              const typeConfig = placeTypeConfig[place.type as keyof typeof placeTypeConfig] || placeTypeConfig.restaurant;
              const Icon = typeConfig.icon;
              
              return (
                <button
                  key={place.id || index}
                  onClick={() => onPlaceSelect(place)}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${typeConfig.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-900">
                        {place.name}
                      </h3>
                      {place.details?.address && (
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                          {place.details.address}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-3 mt-2">
                        {place.rating && parseFloat(place.rating) > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">{formatRating(place.rating)}</span>
                          </div>
                        )}
                        
                        {place.details?.price_level && (
                          <div className="flex items-center">
                            {getPriceLevelIndicator(place.details.price_level)}
                          </div>
                        )}
                        
                        {place.details?.openingHours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">{place.details.openingHours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-gray-600">Đang tìm kiếm địa điểm gần bạn...</p>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && nearbyPlaces.length === 0 && !error && (
          <div className="p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Sẵn sàng khám phá</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tìm kiếm các địa điểm thú vị xung quanh bạn
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['cafe', 'restaurant', 'tourist_attraction'].map((type) => {
                const config = placeTypeConfig[type as keyof typeof placeTypeConfig];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type as PlaceType);
                      if (currentLocation) searchNearbyPlaces();
                    }}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {nearbyPlaces.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Tìm thấy {nearbyPlaces.length} địa điểm
            </span>
            <button
              onClick={searchNearbyPlaces}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernNearbyPanel;