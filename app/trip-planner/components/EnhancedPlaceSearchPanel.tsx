// app/trip-planner/components/EnhancedPlaceSearchPanel.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Search, Filter, MapPin, Clock, X, Star, 
  Plus, Coffee, Utensils, Hotel, Landmark,
  ChevronDown, ChevronUp, SlidersHorizontal,
  Navigation, Globe, Camera, Heart, ExternalLink,
  DollarSign, Users, Calendar, Thermometer,
  Award, TrendingUp, Zap, Target, Activity,
  RefreshCw, AlertCircle, CheckCircle2
} from 'lucide-react';

interface Photo {
  id: number;
  url: string;
  caption?: string;
  isPrimary: boolean;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  visitDate: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

interface Category {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

interface City {
  id: number;
  name: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: string;
  longitude: string;
  image: string;
  rating?: number;
  duration?: number;
  openingHours?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
  category?: Category;
  city?: City;
  photos?: Photo[];
  reviews?: Review[];
  website?: string;
  contactInfo?: string;
  priceLevel?: number;
  avgDurationMinutes?: number;
  description?: string;
}

interface PlaceSearchProps {
  onAddPlace: (place: Place, dayNumber: number) => void;
  currentDayNumber: number;
  allDays: number[];
  cityId?: number;
  onClose?: () => void;
}

// Place type configuration
const placeTypeConfig = {
  tourist_attraction: { 
    icon: Landmark, 
    color: 'bg-green-100 text-green-800 border-green-200', 
    label: 'Điểm tham quan',
    emoji: '🏛️'
  },
  restaurant: { 
    icon: Utensils, 
    color: 'bg-red-100 text-red-800 border-red-200', 
    label: 'Nhà hàng',
    emoji: '🍽️'
  },
  cafe: { 
    icon: Coffee, 
    color: 'bg-amber-100 text-amber-800 border-amber-200', 
    label: 'Quán cà phê',
    emoji: '☕'
  },
  hotel: { 
    icon: Hotel, 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    label: 'Khách sạn',
    emoji: '🏨'
  },
  shopping: { 
    icon: Activity, 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    label: 'Mua sắm',
    emoji: '🛍️'
  }
};

const EnhancedPlaceSearchPanel: React.FC<PlaceSearchProps> = ({ 
  onAddPlace,
  currentDayNumber,
  allDays,
  cityId,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(currentDayNumber);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'popularity' | 'name'>('rating');
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const categoriesData = await response.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  // Search places with debouncing
  const searchPlaces = useCallback(async (resetPage = true) => {
    if (resetPage) {
      setPage(1);
      setPlaces([]);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedType) params.append('category', selectedType);
      if (cityId) params.append('city', cityId.toString());
      if (selectedRating) params.append('minRating', selectedRating.toString());
      if (selectedPriceLevel) params.append('maxPriceLevel', selectedPriceLevel.toString());
      params.append('page', resetPage ? '1' : page.toString());
      params.append('limit', '20');
      params.append('sortBy', sortBy);
      
      const response = await fetch(`/api/places?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to search places');
      }
      
      const data = await response.json();
      
      if (resetPage) {
        setPlaces(data.places || []);
      } else {
        setPlaces(prev => [...prev, ...(data.places || [])]);
      }
      
      setHasMore(data.pagination.page < data.pagination.totalPages);
      
    } catch (error) {
      console.error('Error searching places:', error);
      setError('Có lỗi xảy ra khi tìm kiếm địa điểm');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, cityId, selectedRating, selectedPriceLevel, sortBy, page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlaces(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, selectedRating, selectedPriceLevel, sortBy]);

  // Load more places
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      searchPlaces(false);
    }
  };

  // Get place type icon and color
  const getPlaceTypeIcon = (type: string) => {
    const config = placeTypeConfig[type as keyof typeof placeTypeConfig] || placeTypeConfig.tourist_attraction;
    const IconComponent = config.icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getPlaceTypeConfig = (type: string) => {
    return placeTypeConfig[type as keyof typeof placeTypeConfig] || placeTypeConfig.tourist_attraction;
  };

  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
  };

  // Get price level indicator
  const getPriceLevelIndicator = (level?: number) => {
    if (!level) return null;
    return (
      <div className="flex items-center">
        {Array.from({ length: 4 }, (_, i) => (
          <DollarSign
            key={i}
            className={`w-3 h-3 ${i < level ? 'text-green-600' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Generate time suggestions for places
  const generateTimeSuggestion = (index: number) => {
    const startHour = 9 + Math.floor(index * 1.5);
    const startMinutes = (index * 30) % 60;
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
    
    const duration = 90; // Default 1.5 hours
    const endTimeMinutes = (startHour * 60 + startMinutes + duration);
    const endHour = Math.floor(endTimeMinutes / 60);
    const endMin = endTimeMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    
    return { startTime, endTime };
  };

  // Handle add place with timing suggestion
  const handleAddPlace = (place: Place, index: number) => {
    const timeSuggestion = generateTimeSuggestion(index);
    const placeWithTiming: Place = { 
      ...place,
      startTime: timeSuggestion.startTime,
      endTime: timeSuggestion.endTime
    };
    
    onAddPlace(placeWithTiming, selectedDay);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl text-gray-900 flex items-center">
            <Search className="w-6 h-6 mr-3 text-blue-600" />
            Tìm kiếm địa điểm
          </h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Search input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên địa điểm, địa chỉ..."
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              showFilters ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Quick category filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedType === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => setSelectedType(null)}
          >
            Tất cả
          </button>
          {Object.entries(placeTypeConfig).map(([type, config]) => (
            <button
              key={type}
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
            >
              <span>{config.emoji}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rating filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá tối thiểu
                </label>
                <div className="flex space-x-1">
                  {[3, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-all ${
                        selectedRating === rating
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                      onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>{rating}+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price level filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức giá tối đa
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map(level => (
                    <button
                      key={level}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center transition-all ${
                        selectedPriceLevel === level
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                      onClick={() => setSelectedPriceLevel(selectedPriceLevel === level ? null : level)}
                    >
                      {Array.from({ length: level }, (_, i) => (
                        <DollarSign key={i} className="w-3 h-3" />
                      ))}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp theo
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="popularity">Phổ biến nhất</option>
                  <option value="distance">Khoảng cách gần nhất</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
            </div>

            {/* Add to day selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thêm vào ngày
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {allDays.map(day => (
                  <option key={day} value={day}>
                    Ngày {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      <div className="flex-grow overflow-y-auto">
        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading && places.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Đang tìm kiếm địa điểm...</p>
            </div>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy địa điểm</h3>
            <p className="text-gray-500 mb-4">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType(null);
                setSelectedRating(null);
                setSelectedPriceLevel(null);
              }}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {places.map((place, index) => {
              const typeConfig = getPlaceTypeConfig(place.type);
              const timeSuggestion = generateTimeSuggestion(index);
              
              return (
                <div 
                  key={place.id} 
                  className="p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex space-x-4">
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden">
                      <Image
                        src={place.photos?.[0]?.url || place.image}
                        alt={place.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {place.rating && (
                        <div className="absolute top-1 left-1 bg-white/95 rounded-full px-1.5 py-0.5 flex items-center space-x-0.5 backdrop-blur-sm">
                          <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                          <span className="text-xs font-semibold text-gray-800">{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-grow">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeConfig.color}`}>
                              <span className="mr-1">{typeConfig.emoji}</span>
                              {typeConfig.label}
                            </span>
                            {place.priceLevel && getPriceLevelIndicator(place.priceLevel)}
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{place.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-1">{place.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        {place.openingHours && (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{place.openingHours}</span>
                          </div>
                        )}
                        {place.avgDurationMinutes && (
                          <div className="flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            <span>{formatDuration(place.avgDurationMinutes)}</span>
                          </div>
                        )}
                      </div>

                      {/* Time suggestion */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Đề xuất: {timeSuggestion.startTime} - {timeSuggestion.endTime}</span>
                        </div>
                        
                        <button
                          onClick={() => handleAddPlace(place, index)}
                          className="flex items-center text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors ml-2"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          <span>Thêm</span>
                        </button>
                      </div>

                      {/* Quick info */}
                      {place.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{place.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Load more button */}
            {hasMore && (
              <div className="p-4 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Tải thêm địa điểm</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPlaceSearchPanel;