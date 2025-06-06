// app/dashboard/Map/components/NearbyPlacesControl.tsx
'use client';

import React from 'react';
import { 
  Coffee, Hotel, Utensils, Landmark, Beer, Pizza, 
  UtensilsCrossed, Sandwich, Building2, Church,
  Music, ShoppingBag, Store, Building, HeartPulse, Search
} from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import { PlaceType } from '../types';

interface NearbyPlacesProps {
  selectedLocation: [number, number] | null;
  placeType: PlaceType;
  searchRadius: string;
  onPlaceTypeChange: (value: PlaceType) => void;
  onRadiusChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
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

// Group the place types by category
const groupedPlaceTypes = placeTypes.reduce((acc, place) => {
  if (!acc[place.category]) {
    acc[place.category] = [];
  }
  acc[place.category].push(place);
  return acc;
}, {} as Record<string, PlaceTypeOption[]>);

const NearbyPlacesControl: React.FC<NearbyPlacesProps> = ({ 
  selectedLocation, 
  placeType,
  searchRadius,
  onPlaceTypeChange,
  onRadiusChange,
  onSearch,
  isSearching 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg min-w-[250px]">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Khám phá địa điểm</h2>
        
        <div className="space-y-2 relative">
          <label className="text-sm font-medium">Loại địa điểm</label>
          <Select.Root value={placeType} onValueChange={onPlaceTypeChange}>
            <Select.Trigger className="inline-flex items-center justify-between w-full px-3 py-2 text-sm bg-white border rounded-md shadow-sm hover:bg-gray-50">
              <Select.Value>
                {placeTypes.find(type => type.value === placeType)?.label || 'Chọn loại địa điểm'}
              </Select.Value>
              <Select.Icon>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content 
                position="popper" 
                className="z-[99999] bg-white rounded-md shadow-lg"
                style={{
                  width: 'var(--radix-select-trigger-width)',
                  maxHeight: 'var(--radix-select-content-available-height)',
                }}
                sideOffset={5}
              >
                <Select.Viewport className="p-1">
                  {Object.entries(groupedPlaceTypes).map(([category, items]) => (
                    <div key={category}>
                      <Select.Group>
                        <Select.Label className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
                          {category}
                        </Select.Label>
                        {items.map((type) => (
                          <Select.Item
                            key={type.value}
                            value={type.value}
                            className="relative flex items-center px-8 py-2 text-sm text-gray-700 rounded-md select-none hover:bg-gray-100 focus:bg-gray-100 outline-none"
                          >
                            <Select.ItemText>
                              <div className="flex items-center gap-2">
                                {type.icon}
                                {type.label}
                              </div>
                            </Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Group>
                      <Select.Separator className="h-px bg-gray-200 my-1" />
                    </div>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        
        <div className="space-y-2 relative">
          <label className="text-sm font-medium">Bán kính tìm kiếm</label>
          <Select.Root value={searchRadius} onValueChange={onRadiusChange}>
            <Select.Trigger className="inline-flex items-center justify-between w-full px-3 py-2 text-sm bg-white border rounded-md shadow-sm hover:bg-gray-50">
              <Select.Value>
                {`${searchRadius === '500' ? '500m' : 
                   searchRadius === '1000' ? '1km' : 
                   searchRadius === '2000' ? '2km' : '5km'}`}
              </Select.Value>
              <Select.Icon>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content 
                position="popper" 
                className="z-[99999] bg-white rounded-md shadow-lg"
                style={{
                  width: 'var(--radix-select-trigger-width)',
                  maxHeight: 'var(--radix-select-content-available-height)',
                }}
                sideOffset={5}
              >
                <Select.Viewport className="p-1">
                  <Select.Item value="500" className="relative flex items-center px-8 py-2 text-sm text-gray-700 rounded-md select-none hover:bg-gray-100 focus:bg-gray-100 outline-none">
                    <Select.ItemText>500m</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="1000" className="relative flex items-center px-8 py-2 text-sm text-gray-700 rounded-md select-none hover:bg-gray-100 focus:bg-gray-100 outline-none">
                    <Select.ItemText>1km</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="2000" className="relative flex items-center px-8 py-2 text-sm text-gray-700 rounded-md select-none hover:bg-gray-100 focus:bg-gray-100 outline-none">
                    <Select.ItemText>2km</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="5000" className="relative flex items-center px-8 py-2 text-sm text-gray-700 rounded-md select-none hover:bg-gray-100 focus:bg-gray-100 outline-none">
                    <Select.ItemText>5km</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <button
          onClick={onSearch}
          disabled={!selectedLocation || isSearching}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-white 
            ${!selectedLocation ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSearching ? (
            <>
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>Đang tìm kiếm...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Tìm địa điểm gần đây</span>
            </>
          )}
        </button>

        {!selectedLocation && (
          <p className="text-sm text-gray-500 text-center">
            Vui lòng chọn một điểm trên bản đồ để tìm kiếm
          </p>
        )}
      </div>
    </div>
  );
};

export default NearbyPlacesControl;