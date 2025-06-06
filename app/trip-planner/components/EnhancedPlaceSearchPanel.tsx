// app/trip-planner/components/EnhancedPlaceSearchPanel.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Search, MapPin, Clock, X, Star, 
  Plus, Coffee, Utensils, Hotel, Landmark,
  ChevronDown,  SlidersHorizontal,
  Navigation, ExternalLink,
  DollarSign, Zap, AlertCircle, Loader2,
  Building, ShoppingBag, Trees, Music2, Umbrella
} from 'lucide-react';

// Types
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

interface DatabasePlace {
  id: number;
  name: string;
  address: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  openingHours?: string;
  contactInfo?: string;
  website?: string;
  avgDurationMinutes?: number;
  priceLevel?: string;
  rating?: number;
  category?: Category;
  photos?: Photo[];
  city?: City;
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

// Configuration
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
    icon: ShoppingBag, 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    label: 'Mua sắm',
    emoji: '🛍️'
  },
  museum: {
    icon: Building,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    label: 'Bảo tàng',
    emoji: '🏛️'
  },
  beach: {
    icon: Umbrella,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    label: 'Bãi biển',
    emoji: '🏖️'
  },
  nature: {
    icon: Trees,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    label: 'Thiên nhiên',
    emoji: '🌳'
  },
  entertainment: {
    icon: Music2,
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    label: 'Giải trí',
    emoji: '🎭'
  }
};

// Toast notification utility
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = `toast-notification fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-[200] transform transition-all duration-300 flex items-center space-x-2 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  }`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  toast.innerHTML = `<span class="font-semibold">${icon}</span><span>${message}</span>`;
  
  toast.style.transform = 'translateX(100%)';
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

const EnhancedPlaceSearchPanel: React.FC<PlaceSearchProps> = ({ 
  onAddPlace,
  currentDayNumber,
  allDays,
  cityId,
  onClose
}) => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(currentDayNumber);
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
  const [totalResults, setTotalResults] = useState(0);
  
  // Debug states
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [cityInfo, setCityInfo] = useState<City | null>(null);

  // Utility functions
  const getPlaceTypeConfig = (type: string) => {
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_');
    return placeTypeConfig[normalizedType as keyof typeof placeTypeConfig] || placeTypeConfig.tourist_attraction;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
  };

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

  const generateTimeSuggestion = (index: number) => {
    const startHour = 9 + Math.floor(index * 1.5);
    const startMinutes = (index * 30) % 60;
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
    
    const duration = 90;
    const endTimeMinutes = (startHour * 60 + startMinutes + duration);
    const endHour = Math.floor(endTimeMinutes / 60);
    const endMin = endTimeMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    
    return { startTime, endTime };
  };

  // Convert database place to component place format
  const convertDatabasePlace = (dbPlace: DatabasePlace): Place => {
    return {
      id: dbPlace.id.toString(),
      name: dbPlace.name,
      type: dbPlace.category?.name || 'tourist_attraction',
      address: dbPlace.address || '',
      latitude: dbPlace.latitude?.toString() || '0',
      longitude: dbPlace.longitude?.toString() || '0',
      image: dbPlace.photos?.[0]?.url || dbPlace.imageUrl || '/images/place-default.jpg',
      rating: dbPlace.rating ? parseFloat(dbPlace.rating.toString()) : undefined,
      category: dbPlace.category,
      photos: dbPlace.photos,
      description: dbPlace.description,
      openingHours: dbPlace.openingHours,
      avgDurationMinutes: dbPlace.avgDurationMinutes,
      duration: dbPlace.avgDurationMinutes || 60,
      priceLevel: dbPlace.priceLevel ? (
        typeof dbPlace.priceLevel === 'string' ? 
        parseInt(dbPlace.priceLevel) || 2 : 
        dbPlace.priceLevel
      ) : undefined,
      website: dbPlace.website,
      contactInfo: dbPlace.contactInfo,
      city: dbPlace.city
    };
  };

  // Load city information
  useEffect(() => {
    if (cityId) {
      const loadCityInfo = async () => {
        try {
          const response = await fetch(`/api/cities/${cityId}`);
          if (response.ok) {
            const cityData = await response.json();
            setCityInfo(cityData);
            console.log('✅ Loaded city info:', cityData);
          } else {
            console.warn('⚠️ Could not load city info for ID:', cityId);
          }
        } catch (error) {
          console.error('❌ Error loading city info:', error);
        }
      };
      loadCityInfo();
    }
  }, [cityId]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('🏷️ Loading categories...');
        const response = await fetch('/api/categories');
        if (response.ok) {
          const categoriesData = await response.json();
          setCategories(categoriesData);
          console.log('✅ Loaded categories:', categoriesData);
        } else {
          console.warn('⚠️ Failed to load categories:', response.status);
        }
      } catch (error) {
        console.error('❌ Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  // Search places function
  // Phần searchPlaces function cải thiện trong EnhancedPlaceSearchPanel.tsx

const searchPlaces = useCallback(async (resetPage = true) => {
  console.log('🔍 === SEARCH PLACES DEBUG ===');
  console.log('Parameters:', {
    searchQuery: searchQuery || 'none',
    selectedType: selectedType || 'none',
    cityId: cityId || 'none',
    cityInfo: cityInfo?.name || 'none',
    selectedRating: selectedRating || 'none',
    selectedPriceLevel: selectedPriceLevel || 'none',
    sortBy,
    page: resetPage ? 1 : page,
    resetPage
  });

  if (resetPage) {
    setPage(1);
    setPlaces([]); // ✅ Clear places khi reset
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const params = new URLSearchParams();
    
    // Add search query
    if (searchQuery && searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    
    // Add category filter - chính xác hơn
    if (selectedType && selectedType.trim()) {
      params.append('category', selectedType.trim());
    }
    
    // Add city filter using city name - chính xác hơn
    if (cityInfo?.name && cityInfo.name.trim()) {
      params.append('city', cityInfo.name.trim());
    }
    
    // Add pagination
    const currentPage = resetPage ? 1 : page;
    params.append('page', currentPage.toString());
    params.append('limit', '20');
    
    const url = `/api/places?${params.toString()}`;
    console.log('🌐 API URL:', url);
    
    const response = await fetch(url);
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📋 Raw API response structure:', Object.keys(data));
    
    // ✅ Handle response structure properly
    let placesData: DatabasePlace[] = [];
    let paginationInfo = null;
    
    if (data.places && Array.isArray(data.places)) {
      placesData = data.places;
      paginationInfo = data.pagination;
    } else if (Array.isArray(data)) {
      placesData = data;
    } else {
      console.warn('⚠️ Unexpected response structure:', data);
      placesData = [];
    }
    
    console.log('📍 Places received from API:', placesData.length);
    
    // ✅ Detect and log duplicates before conversion
    const apiIds = placesData.map(p => p.id);
    const uniqueApiIds = [...new Set(apiIds)];
    
    if (apiIds.length !== uniqueApiIds.length) {
      console.error('🚨 API returned duplicate places!', {
        total: apiIds.length,
        unique: uniqueApiIds.length,
        duplicates: apiIds.length - uniqueApiIds.length,
        duplicateIds: apiIds.filter((id, index) => apiIds.indexOf(id) !== index)
      });
      
      // Remove duplicates from API data
      placesData = placesData.filter((place, index, array) => {
        return array.findIndex(p => p.id === place.id) === index;
      });
      console.log('✅ Cleaned API data:', placesData.length, 'unique places');
    }
    
    // Convert to component format
    const convertedPlaces = placesData.map(convertDatabasePlace);
    console.log('🔄 Converted places:', convertedPlaces.length);
    
    // ✅ Final duplicate check after conversion
    const convertedIds = convertedPlaces.map(p => p.id);
    const uniqueConvertedIds = [...new Set(convertedIds)];
    
    if (convertedIds.length !== uniqueConvertedIds.length) {
      console.error('🚨 Duplicates found after conversion!', {
        total: convertedIds.length,
        unique: uniqueConvertedIds.length
      });
      
      // This should not happen if API is fixed, but just in case
      const finalUniquePlaces = convertedPlaces.filter((place, index, array) => {
        return array.findIndex(p => p.id === place.id) === index;
      });
      
      console.log('✅ Final cleanup:', finalUniquePlaces.length, 'unique places');
      
      // Update state
      if (resetPage) {
        setPlaces(finalUniquePlaces);
      } else {
        setPlaces(prev => {
          const combined = [...prev, ...finalUniquePlaces];
          // ✅ Remove duplicates between old and new data
          const uniqueCombined = combined.filter((place, index, array) => {
            return array.findIndex(p => p.id === place.id) === index;
          });
          
          console.log('📊 Load more with dedup:', {
            previous: prev.length,
            new: finalUniquePlaces.length,
            combined: combined.length,
            uniqueCombined: uniqueCombined.length,
            duplicatesRemoved: combined.length - uniqueCombined.length
          });
          
          return uniqueCombined;
        });
      }
    } else {
      // No duplicates - normal flow
      if (resetPage) {
        setPlaces(convertedPlaces);
      } else {
        setPlaces(prev => {
          const combined = [...prev, ...convertedPlaces];
          // ✅ Still check for duplicates between old and new
          const uniqueCombined = combined.filter((place, index, array) => {
            return array.findIndex(p => p.id === place.id) === index;
          });
          
          if (combined.length !== uniqueCombined.length) {
            console.warn('🔧 Removed overlapping places:', combined.length - uniqueCombined.length);
          }
          
          return uniqueCombined;
        });
      }
    }
    
    // Handle pagination
if (paginationInfo) {
  // ✅ Tính toán dựa trên total vs current count
  const total = paginationInfo.total || 0;
  const currentCount = resetPage ? convertedPlaces.length : (places.length + convertedPlaces.length);
  
  setHasMore(currentCount < total); // ← FIX CHÍNH Ở ĐÂY
  setTotalResults(total);
} else {
  setHasMore(convertedPlaces.length >= 20); // ← FIX PHỤ
  setTotalResults(convertedPlaces.length);
}

    
    // Update debug info
    setDebugInfo({
      searchQuery,
      selectedType,
      cityName: cityInfo?.name,
      placesFound: convertedPlaces.length,
      totalResults: paginationInfo?.total || convertedPlaces.length,
      apiUrl: url,
      responseStructure: Object.keys(data),
      duplicatesDetected: apiIds.length !== uniqueApiIds.length,
      duplicatesCount: apiIds.length - uniqueApiIds.length
    });
    
    console.log('✅ Search completed successfully');
    
  } catch (error) {
    console.error('❌ Search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    setError(`Lỗi tìm kiếm: ${errorMessage}`);
    setDebugInfo({
      error: errorMessage,
      searchQuery,
      selectedType,
      cityName: cityInfo?.name
    });
  } finally {
    setLoading(false);
  }
}, [searchQuery, selectedType, cityInfo, selectedRating, selectedPriceLevel, sortBy, page]);

// ✅ Cải thiện render function để sử dụng unique key
{places.map((place, index) => {
  const typeConfig = getPlaceTypeConfig(place.type);
  const timeSuggestion = generateTimeSuggestion(index);
  
  // ✅ Tạo unique key chắc chắn không trùng
  const uniqueKey = `place-${place.id}-${index}-${place.name.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  return (
    <div 
      key={uniqueKey} // ✅ Sử dụng unique key
      className="p-4 hover:bg-gray-50 transition-colors group"
    >
      {/* Rest of component */}
    </div>
  );
})}
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || selectedType || cityInfo) {
        searchPlaces(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, cityInfo]);

  // Initial load
  useEffect(() => {
    console.log('🚀 Initial load...');
    searchPlaces(true);
  }, []);

  // Load more function
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      setTimeout(() => searchPlaces(false), 100);
    }
  };

  // Handle add place
  const handleAddPlace = (place: Place, index: number) => {
    const timeSuggestion = generateTimeSuggestion(index);
    const placeWithTiming: Place = { 
      ...place,
      startTime: timeSuggestion.startTime,
      endTime: timeSuggestion.endTime
    };
    
    console.log('➕ Adding place:', placeWithTiming.name, 'to day', selectedDay);
    onAddPlace(placeWithTiming, selectedDay);
    showToast(`Đã thêm ${place.name} vào ngày ${selectedDay}!`, 'success');
  };

  // Test API function
  const testAPI = async () => {
    console.log('🧪 === TESTING API ENDPOINTS ===');
    
    try {
      // Test 1: Basic places endpoint
      console.log('Test 1: Basic places endpoint');
      const response1 = await fetch('/api/places?limit=5');
      console.log('Status:', response1.status);
      const data1 = await response1.json();
      console.log('Response:', data1);
      
      // Test 2: Categories endpoint
      console.log('Test 2: Categories endpoint');
      const response2 = await fetch('/api/categories');
      console.log('Status:', response2.status);
      const data2 = await response2.json();
      console.log('Response:', data2);
      
      // Test 3: City endpoint if cityId exists
      if (cityId) {
        console.log('Test 3: City endpoint');
        const response3 = await fetch(`/api/cities/${cityId}`);
        console.log('Status:', response3.status);
        const data3 = await response3.json();
        console.log('Response:', data3);
      }
      
      showToast('API test completed - check console', 'info');
      
    } catch (error) {
      console.error('❌ API test failed:', error);
      showToast('API test failed - check console', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col overflow-hidden max-h-[90vh]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl text-gray-900 flex items-center">
            <Search className="w-6 h-6 mr-3 text-blue-600" />
            Tìm kiếm địa điểm
            {totalResults > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({totalResults} kết quả)
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            {/* Debug button */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={testAPI}
                className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600 transition-colors"
                title="Test API endpoints"
              >
                🧪 Test
              </button>
            )}
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
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

        {/* City info */}
        {cityInfo && (
          <div className="mb-4 p-3 bg-white/50 rounded-lg border border-blue-200">
            <div className="flex items-center text-sm text-blue-700">
              <MapPin className="w-4 h-4 mr-2" />
              <span>Tìm kiếm tại: <strong>{cityInfo.name}, {cityInfo.country}</strong></span>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Clear filters */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType(null);
                  setSelectedRating(null);
                  setSelectedPriceLevel(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
              
              <div className="text-xs text-gray-500">
                {places.length} địa điểm hiển thị
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      <div className="flex-grow overflow-y-auto">
        {/* Error state */}
        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => searchPlaces(true)}
                className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors"
              >
                Thử lại
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={testAPI}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Test API
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && places.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Đang tìm kiếm địa điểm...</p>
              {cityInfo && (
                <p className="text-sm text-gray-500 mt-1">Tại {cityInfo.name}</p>
              )}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && places.length === 0 && !error && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy địa điểm</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedType 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                : 'Không có dữ liệu địa điểm trong hệ thống'
              }
            </p>
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg mb-4 text-left max-w-md mx-auto">
                <strong>Debug Info:</strong><br/>
                Search: {debugInfo.searchQuery || 'none'}<br/>
                Type: {debugInfo.selectedType || 'none'}<br/>
                City: {debugInfo.cityName || 'none'}<br/>
                API URL: {debugInfo.apiUrl}<br/>
                {debugInfo.responseStructure && (
                  <>Response keys: {debugInfo.responseStructure.join(', ')}</>
                )}
              </div>
            )}
            
            <div className="space-x-2">
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
              {/* {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={testAPI}
                  className="px-4 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                >
                  Kiểm tra API
                </button>
              )} */}
            </div>
          </div>
        )}

        {/* Places list */}
        {places.length > 0 && (
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
                    {/* Place image */}
                    <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={place.image}
                        alt={place.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/place-default.jpg';
                        }}
                      />
                      {place.rating && (
                        <div className="absolute top-2 left-2 bg-white/95 rounded-full px-2 py-0.5 flex items-center space-x-1 backdrop-blur-sm shadow-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-semibold text-gray-800">{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {place.priceLevel && (
                        <div className="absolute top-2 right-2 bg-white/95 rounded-full px-1.5 py-0.5 backdrop-blur-sm shadow-sm">
                          {getPriceLevelIndicator(place.priceLevel)}
                        </div>
                      )}
                    </div>
                    
                    {/* Place details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-grow min-w-0">
                          {/* Category and type */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}>
                              <span className="mr-1">{typeConfig.emoji}</span>
                              <span className="truncate">{typeConfig.label}</span>
                            </span>
                            {place.city && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {place.city.name}
                              </span>
                            )}
                          </div>
                          
                          {/* Name and address */}
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">
                            {place.name}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                            {place.address}
                          </p>
                          
                          {/* Additional info */}
                          <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                            {place.openingHours && (
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                <span className="truncate">{place.openingHours}</span>
                              </div>
                            )}
                            {place.avgDurationMinutes && (
                              <div className="flex items-center">
                                <Zap className="w-3 h-3 mr-1" />
                                <span>{formatDuration(place.avgDurationMinutes)}</span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {place.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                              {place.description}
                            </p>
                          )}

                          {/* Time suggestion and actions */}
                          <div className="flex items-center justify-between">
                            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center">
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                Đề xuất: {timeSuggestion.startTime} - {timeSuggestion.endTime}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => handleAddPlace(place, index)}
                              className="flex items-center text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors ml-2 flex-shrink-0"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              <span>Thêm</span>
                            </button>
                          </div>

                          {/* Quick actions */}
                          <div className="flex items-center space-x-2 mt-2">
                            {place.website && (
                              <a 
                                href={place.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Website
                              </a>
                            )}
                            
                            {place.latitude !== '0' && place.longitude !== '0' && (
                              <button 
                                onClick={() => {
                                  const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
                                  window.open(url, '_blank');
                                }}
                                className="flex items-center text-xs text-green-600 hover:text-green-800 transition-colors"
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Chỉ đường
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Load more button */}
            {hasMore && (
              <div className="p-4 text-center border-t border-gray-100">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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

        {/* Loading more indicator */}
        {loading && places.length > 0 && (
          <div className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Đang tải thêm...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer with summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {places.length > 0 ? (
              <>
                Hiển thị <strong>{places.length}</strong>
                {totalResults > places.length && (
                  <> / <strong>{totalResults}</strong></>
                )} địa điểm
                {cityInfo && (
                  <> tại <strong>{cityInfo.name}</strong></>
                )}
              </>
            ) : (
              'Chưa có kết quả'
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Thêm vào:</span>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {allDays.map(day => (
                <option key={day} value={day}>
                  Ngày {day}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Debug panel in development
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <details className="mt-3">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              🐛 Debug Info (Click to expand)
            </summary>
            <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded border">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </details>
        )} */}
      </div>
    </div>
  );
};

export default EnhancedPlaceSearchPanel;