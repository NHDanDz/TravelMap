// app/dashboard/Map/components/ModernSearchControl.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, Star, Loader2, X, TrendingUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Search suggestion interface
interface SearchSuggestion {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  rating?: number;
  category?: string;
  distance?: string;
}

// Selected place interface
interface SelectedPlace {
  name: string;
  coordinates: [number, number];
  address?: string;
  rating?: number;
  type?: string;
  image?: string;
}

interface ModernSearchControlProps {
  onPlaceSelect: (place: SelectedPlace) => void;
}

const ModernSearchControl: React.FC<ModernSearchControlProps> = ({ onPlaceSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Popular searches for Vietnam
  const popularSearches = [
    'Nhà hàng gần đây',
    'Quán cafe',
    'Khách sạn',
    'Điểm du lịch',
    'Chợ đêm',
    'Trung tâm thương mại',
    'Bệnh viện',
    'Nhà thuốc'
  ];

  // Generate session token
  useEffect(() => {
    setSessionToken(uuidv4());
    loadRecentSearches();
  }, []);

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Save search to recent searches
  const saveRecentSearch = (query: string) => {
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Perform search using Mapbox Search Box API
  const performSearch = async (query: string) => {
    if (!query.trim() || !sessionToken) return;
    
    setIsLoading(true);
    try {
      // Try Mapbox Search Box API first
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?` +
        `q=${encodeURIComponent(query)}&` +
        `language=vi&` +
        `limit=8&` +
        `session_token=${sessionToken}&` +
        `country=vn&` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      );
      
      if (!response.ok) throw new Error('Search API error');
      
      const data = await response.json();
      
      // Transform results
      const suggestions = data.suggestions?.map((item: any) => ({
        id: item.mapbox_id || uuidv4(),
        name: item.name || item.text,
        address: item.full_address || item.place_formatted || '',
        coordinates: item.coordinates || [0, 0],
        category: item.feature_type || 'place',
        rating: item.rating || undefined
      })) || [];
      
      setSearchResults(suggestions);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to Geocoding API
      await fallbackGeocodingSearch(query);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback geocoding search
  const fallbackGeocodingSearch = async (query: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
        `language=vi&` +
        `limit=8&` +
        `country=vn`
      );
      
      if (!response.ok) throw new Error('Geocoding API error');
      
      const data = await response.json();
      
      const suggestions = data.features?.map((feature: any) => ({
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        coordinates: feature.center,
        category: feature.place_type?.[0] || 'place'
      })) || [];
      
      setSearchResults(suggestions);
    } catch (error) {
      console.error('Fallback search error:', error);
      setSearchResults([]);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: SearchSuggestion) => {
    try {
      setIsLoading(true);
      
      let coordinates = suggestion.coordinates;
      
      // If coordinates are [0,0], try to get actual coordinates
      if (coordinates[0] === 0 && coordinates[1] === 0 && suggestion.id.includes('mapbox')) {
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.id}?` +
          `session_token=${sessionToken}&` +
          `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.features?.[0]?.geometry?.coordinates) {
            coordinates = data.features[0].geometry.coordinates;
          }
        }
      }
      
      // Save to recent searches
      saveRecentSearch(suggestion.name);
      
      // Call parent handler
      onPlaceSelect({
        name: suggestion.name,
        coordinates,
        address: suggestion.address,
        rating: suggestion.rating,
        type: suggestion.category
      });
      
      // Clear search
      setSearchQuery('');
      setSearchResults([]);
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    } catch (error) {
      console.error('Error selecting suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick search
  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(true);
    searchInputRef.current?.focus();
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  // Handle input blur (with delay to allow clicks)
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-semibold text-gray-900">Tìm kiếm địa điểm</h2>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm nhà hàng, khách sạn, điểm du lịch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Search Results or Suggestions */}
      <div className="max-h-96 overflow-y-auto">
        {showSuggestions && !searchQuery && (
          <div className="p-4 space-y-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Tìm kiếm gần đây</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSearch(search)}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-700"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tìm kiếm phổ biến</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(search)}
                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700 text-left"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div ref={resultsRef} className="divide-y divide-gray-100">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelectSuggestion(result)}
                className="w-full p-4 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                    <MapPin className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-900">
                      {result.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {result.address}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      {result.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{result.rating}</span>
                        </div>
                      )}
                      {result.category && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {result.category}
                        </span>
                      )}
                      {result.distance && (
                        <span className="text-xs text-gray-500">
                          {result.distance}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults.length === 0 && !isLoading && (
          <div className="p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Không tìm thấy kết quả</h3>
            <p className="text-sm text-gray-600">
              Thử tìm kiếm với từ khóa khác hoặc mở rộng khu vực tìm kiếm
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernSearchControl;