// types.ts
export interface Place {
  name: string;
  latitude: string;
  longitude: string;
  rating: string;
  type: string;
  photo?: {
    images: {
      large: {
        url: string;
      };
    };
  };
  details?: PlaceDetails;
}

export interface PlaceDetails {
  // Thông tin cơ bản
  cuisine?: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  description?: string;
  address?: string;

  // Thông tin tiện nghi
  capacity?: string;           // Sức chứa
  wheelchair?: string;         // Tiếp cận cho người khuyết tật
  internet_access?: string;    // WiFi/Internet
  outdoor_seating?: string;    // Chỗ ngồi ngoài trời
  
  // Dịch vụ
  takeaway?: string;          // Đồ ăn mang về
  delivery?: string;          // Giao hàng
  drive_through?: string;     // Dịch vụ drive-through
  
  // Tiện nghi khác
  smoking?: string;           // Khu vực hút thuốc
  air_conditioning?: string;  // Điều hòa
}

export type PlaceType =
  // Ẩm thực
  | 'restaurant'
  | 'fast_food'
  | 'cafe'
  | 'bar'
  | 'food_court'
  | 'street_food'
  
  // Lưu trú
  | 'hotel'
  | 'hostel'
  | 'apartment'
  | 'guest_house'
  
  // Du lịch & Văn hóa
  | 'tourist_attraction'
  | 'museum'
  | 'temple'
  | 'historic'
  | 'viewpoint'
  
  // Giải trí
  | 'entertainment'
  | 'cinema'
  | 'karaoke'
  
  // Mua sắm
  | 'mall'
  | 'supermarket'
  | 'market'
  
  // Y tế & Sức khỏe
  | 'hospital'
  | 'pharmacy';

export interface PlaceTypeOption {
  value: PlaceType;
  label: string;
  icon: React.ReactNode;
  category: string;
}

export interface MapComponentProps {
  places: Place[];
  onLocationSelect?: (lat: number, lng: number) => void;
}

export interface NearbyPlacesProps {
  selectedLocation: { lat: number; lng: number } | null;
  placeType: PlaceType;
  searchRadius: string;
  onPlaceTypeChange: (type: PlaceType) => void;
  onRadiusChange: (radius: string) => void;
  isSearching: boolean;
}