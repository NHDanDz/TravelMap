// components/SearchFilters.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Search, Loader2, Filter } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Slider from '@radix-ui/react-slider';
import { PlaceType } from '../types';
import { 
  Coffee, Hotel, Utensils, Landmark, Beer, Pizza, 
  UtensilsCrossed, Sandwich, Building2, Church,
  Music, ShoppingBag, Store, Building, HeartPulse
} from 'lucide-react';
import debounce from 'lodash/debounce';

interface MapFilters {
  placeType: PlaceType;
  radius: number;
  minRating: number;
}

interface PlaceTypeOption {
  value: PlaceType;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const placeTypes: PlaceTypeOption[] = [
  // Ẩm thực
  { category: 'Ẩm thực', value: 'restaurant', label: 'Nhà hàng', icon: <Utensils className="w-4 h-4" /> },
  { category: 'Ẩm thực', value: 'fast_food', label: 'Đồ ăn nhanh', icon: <Pizza className="w-4 h-4" /> },
  { category: 'Ẩm thực', value: 'cafe', label: 'Quán café', icon: <Coffee className="w-4 h-4" /> },
  { category: 'Ẩm thực', value: 'bar', label: 'Quán bar', icon: <Beer className="w-4 h-4" /> },
  { category: 'Ẩm thực', value: 'food_court', label: 'Khu ẩm thực', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { category: 'Ẩm thực', value: 'street_food', label: 'Đồ ăn đường phố', icon: <Sandwich className="w-4 h-4" /> },

  // Lưu trú
  { category: 'Lưu trú', value: 'hotel', label: 'Khách sạn', icon: <Hotel className="w-4 h-4" /> },
  { category: 'Lưu trú', value: 'hostel', label: 'Nhà nghỉ', icon: <Building className="w-4 h-4" /> },
  { category: 'Lưu trú', value: 'apartment', label: 'Căn hộ', icon: <Building2 className="w-4 h-4" /> },
  { category: 'Lưu trú', value: 'guest_house', label: 'Nhà khách', icon: <Building className="w-4 h-4" /> },

  // Du lịch & Văn hóa
  { category: 'Du lịch & Văn hóa', value: 'tourist_attraction', label: 'Điểm du lịch', icon: <Landmark className="w-4 h-4" /> },
  { category: 'Du lịch & Văn hóa', value: 'museum', label: 'Bảo tàng', icon: <Building2 className="w-4 h-4" /> },
  { category: 'Du lịch & Văn hóa', value: 'temple', label: 'Đền/Chùa', icon: <Church className="w-4 h-4" /> },
  { category: 'Du lịch & Văn hóa', value: 'historic', label: 'Di tích lịch sử', icon: <Landmark className="w-4 h-4" /> },
  { category: 'Du lịch & Văn hóa', value: 'viewpoint', label: 'Điểm ngắm cảnh', icon: <Landmark className="w-4 h-4" /> },

  // Giải trí
  { category: 'Giải trí', value: 'entertainment', label: 'Khu vui chơi', icon: <Music className="w-4 h-4" /> },
  { category: 'Giải trí', value: 'cinema', label: 'Rạp chiếu phim', icon: <Music className="w-4 h-4" /> },
  { category: 'Giải trí', value: 'karaoke', label: 'Karaoke', icon: <Music className="w-4 h-4" /> },

  // Mua sắm
  { category: 'Mua sắm', value: 'mall', label: 'Trung tâm thương mại', icon: <ShoppingBag className="w-4 h-4" /> },
  { category: 'Mua sắm', value: 'supermarket', label: 'Siêu thị', icon: <Store className="w-4 h-4" /> },
  { category: 'Mua sắm', value: 'market', label: 'Chợ', icon: <Store className="w-4 h-4" /> },

  // Y tế & Sức khỏe
  { category: 'Y tế & Sức khỏe', value: 'hospital', label: 'Bệnh viện', icon: <HeartPulse className="w-4 h-4" /> },
  { category: 'Y tế & Sức khỏe', value: 'pharmacy', label: 'Nhà thuốc', icon: <HeartPulse className="w-4 h-4" /> },
];

// Nhóm các loại địa điểm theo category
const groupedPlaceTypes = placeTypes.reduce((acc, place) => {
  if (!acc[place.category]) {
    acc[place.category] = [];
  }
  acc[place.category].push(place);
  return acc;
}, {} as Record<string, PlaceTypeOption[]>);

interface SearchFiltersProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  isLoading?: boolean;
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  isLoading
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      // Implement search logic
      console.log('Searching for:', query);
    }, 300),
    []
  );

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle filter changes
  const handleFilterChange = (changes: Partial<MapFilters>) => {
    onFiltersChange({
      ...filters,
      ...changes
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchInput}
          placeholder="Tìm kiếm địa điểm..."
          className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <Filter className="w-4 h-4" />
        {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
      </button>

      {/* Filters Accordion */}
      {showFilters && (
        <Accordion.Root type="single" collapsible>
          {/* Place Type */}
          <Accordion.Item value="place-type">
            <Accordion.Trigger className="flex justify-between items-center w-full py-2 text-sm font-medium">
              Loại địa điểm
              <svg
                className="w-4 h-4 transition-transform duration-200 transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Accordion.Trigger>
            <Accordion.Content className="p-2">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(groupedPlaceTypes).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm mb-1">{category}</h4>
                    {items.map(type => (
                      <label
                        key={type.value}
                        className="flex items-center gap-2 text-sm py-1"
                      >
                        <input
                          type="radio"
                          name="placeType"
                          value={type.value}
                          checked={filters.placeType === type.value}
                          onChange={() => handleFilterChange({ placeType: type.value })}
                          className="text-blue-500"
                        />
                        <span className="flex items-center gap-1">
                          {type.icon}
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>

          {/* Radius */}
          <Accordion.Item value="radius">
            <Accordion.Trigger className="flex justify-between items-center w-full py-2 text-sm font-medium">
              Bán kính tìm kiếm
            </Accordion.Trigger>
            <Accordion.Content className="p-2">
              <Slider.Root
                className="relative flex items-center w-full h-5"
                value={[filters.radius]}
                max={5000}
                step={100}
                onValueChange={([value]) => handleFilterChange({ radius: value })}
              >
                <Slider.Track className="bg-gray-200 relative grow h-1 rounded-full">
                  <Slider.Range className="absolute bg-blue-500 h-full rounded-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full focus:outline-none"
                  aria-label="Radius"
                />
              </Slider.Root>
              <div className="flex justify-between text-sm mt-2">
                <span>100m</span>
                <span>{filters.radius}m</span>
                <span>5km</span>
              </div>
            </Accordion.Content>
          </Accordion.Item>

          {/* Rating */}
          <Accordion.Item value="rating">
            <Accordion.Trigger className="flex justify-between items-center w-full py-2 text-sm font-medium">
              Đánh giá tối thiểu
            </Accordion.Trigger>
            <Accordion.Content className="p-2">
              <div className="space-y-2">
                {[0, 3, 3.5, 4, 4.5].map(rating => (
                  <label
                    key={rating}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="minRating"
                      value={rating}
                      checked={filters.minRating === rating}
                      onChange={() => handleFilterChange({ minRating: rating })}
                      className="text-blue-500"
                    />
                    {rating === 0 ? (
                      'Tất cả'
                    ) : (
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1">& up</span>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )}
    </div>
  );
}