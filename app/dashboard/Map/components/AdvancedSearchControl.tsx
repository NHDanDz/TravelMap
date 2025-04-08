// app/dashboard/Map/components/AdvancedSearchControl.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Định nghĩa kiểu dữ liệu cho kết quả Mapbox Search Box API
interface MapboxSearchSuggestion {
  name: string;
  mapbox_id: string;
  feature_type: string;
  address?: string;
  full_address?: string;
  place_formatted?: string;
  context?: {
    country?: {
      name: string;
      country_code: string;
      country_code_alpha_3: string;
    };
    region?: {
      name: string;
      region_code?: string;
      region_code_full?: string;
    };
    place?: {
      name: string;
    };
    postcode?: {
      name: string;
    };
  };
  language: string;
  maki?: string;
  poi_category?: string[];
  poi_category_ids?: string[];
}

interface MapboxSearchResponse {
  suggestions: MapboxSearchSuggestion[];
  attribution: string;
}

interface SelectedPlace {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

interface AdvancedSearchControlProps {
  onPlaceSelect: (place: SelectedPlace) => void;
}

const AdvancedSearchControl: React.FC<AdvancedSearchControlProps> = ({ onPlaceSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapboxSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  
  // Tạo session token khi component mount
  useEffect(() => {
    setSessionToken(uuidv4());
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !sessionToken) return;
    
    setIsLoading(true);
    try {
      // Sử dụng Mapbox Search Box API với session_token
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `language=vi&` +
        `limit=5&` +
        `session_token=${sessionToken}&` +
        `country=vn&` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      );
      
      if (!response.ok) throw new Error('Lỗi tìm kiếm');
      
      const data = await response.json() as MapboxSearchResponse;
      setSearchResults(data.suggestions || []);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      // Nếu Search Box API vẫn không hoạt động, thử dùng Geocoding API
      await fallbackToGeocodingAPI();
    } finally {
      setIsLoading(false);
    }
  };

  // Phương thức dự phòng sử dụng Geocoding API
  const fallbackToGeocodingAPI = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
        `language=vi&` +
        `limit=5&` +
        `country=vn`
      );
      
      if (!response.ok) throw new Error('Lỗi tìm kiếm Geocoding');
      
      const data = await response.json();
      
      // Chuyển đổi từ định dạng Geocoding API sang định dạng tương thích
      const convertedResults: MapboxSearchSuggestion[] = data.features.map((feature: any) => ({
        name: feature.text,
        mapbox_id: feature.id,
        feature_type: feature.place_type[0],
        place_formatted: feature.place_name,
        language: 'vi',
        // Thêm coordinates để có thể sử dụng ngay mà không cần gọi /retrieve
        coordinates: feature.geometry.coordinates
      }));
      
      setSearchResults(convertedResults);
    } catch (error) {
      console.error('Lỗi tìm kiếm dự phòng:', error);
      setSearchResults([]);
    }
  };

  // Xử lý khi người dùng chọn một kết quả tìm kiếm
  const handleSelectResult = async (result: MapboxSearchSuggestion) => {
    try {
      // Kiểm tra xem kết quả đã có tọa độ chưa (từ fallbackToGeocodingAPI)
      if ((result as any).coordinates) {
        const coords = (result as any).coordinates as [number, number];
        onPlaceSelect({
          name: result.name,
          coordinates: coords,
          address: result.full_address || result.place_formatted
        });
        return;
      }
      
      // Gọi Mapbox Search Box API /retrieve để lấy chi tiết địa điểm
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${result.mapbox_id}?` +
        `session_token=${sessionToken}&` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      );
      
      if (!response.ok) {
        // Nếu không lấy được chi tiết địa điểm, thử dùng Geocoding API
        await fallbackGeocodingForPlace(result.name);
        return;
      }
      
      const data = await response.json();
      
      // Lấy tọa độ từ kết quả
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const coordinates: [number, number] = feature.geometry.coordinates;
        const name = feature.properties.name;
        const address = feature.properties.full_address || feature.properties.place_formatted;
        
        // Gọi callback để hiển thị đường đi
        onPlaceSelect({
          name,
          coordinates,
          address
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết địa điểm:', error);
      // Thử dùng Geocoding API nếu có lỗi
      await fallbackGeocodingForPlace(result.name);
    }
  };
  
  // Dự phòng tìm địa chỉ bằng Geocoding API 
  const fallbackGeocodingForPlace = async (placeName: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(placeName)}.json?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
        `language=vi&` +
        `limit=1&` +
        `country=vn`
      );
      
      if (!response.ok) throw new Error('Lỗi tìm kiếm Geocoding');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const coordinates: [number, number] = feature.geometry.coordinates;
        
        onPlaceSelect({
          name: feature.text,
          coordinates,
          address: feature.place_name
        });
      }
    } catch (error) {
      console.error('Lỗi khi dùng Geocoding API dự phòng:', error);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-96">
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
      </div>
      
      {/* Hiển thị kết quả tìm kiếm */}
      {searchResults.length > 0 && (
        <div className="max-h-64 overflow-y-auto border rounded-lg">
          {searchResults.map((result, index) => (
            <div 
              key={index} 
              className="p-2 hover:bg-gray-100 cursor-pointer border-b"
              onClick={() => handleSelectResult(result)}
            >
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 mr-2" />
                <div>
                  <p className="font-medium">{result.name}</p>
                  <p className="text-sm text-gray-600">
                    {result.full_address || result.place_formatted || ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Tìm kiếm nâng cao */}
      <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium mb-2">Tìm kiếm nâng cao</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Đang mở cửa</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Theo lịch</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchControl;