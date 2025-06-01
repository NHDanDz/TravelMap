// app/dashboard/Map/utils/mapUtils.ts
import { Place, PlaceType, Coordinates, MapBounds } from '../types';

export class MapUtils {
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  /**
   * Convert degrees to radians
   */
  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  static formatDistance(kilometers: number): string {
    if (kilometers < 1) {
      return `${Math.round(kilometers * 1000)} m`;
    } else if (kilometers < 10) {
      return `${kilometers.toFixed(1)} km`;
    } else {
      return `${Math.round(kilometers)} km`;
    }
  }

  /**
   * Format duration for display
   */
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${minutes} phút`;
    }
  }

  /**
   * Get place type icon and color
   */
  static getPlaceTypeConfig(type: PlaceType) {
    const defaultConfig = { icon: '📍', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    
    const configs: Partial<Record<PlaceType, typeof defaultConfig>> = {
      // Dining & Food
      restaurant: { icon: '🍽️', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      fast_food: { icon: '🍔', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
      cafe: { icon: '☕', color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
      bar: { icon: '🍺', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
      food_court: { icon: '🍜', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      street_food: { icon: '🌮', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
      bakery: { icon: '🥖', color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
      ice_cream: { icon: '🍦', color: 'pink', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
      
      // Accommodation
      hotel: { icon: '🏨', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      hostel: { icon: '🏠', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      apartment: { icon: '🏢', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      guest_house: { icon: '🏡', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      resort: { icon: '🏖️', color: 'cyan', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      motel: { icon: '🛏️', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      
      // Tourism & Culture
      tourist_attraction: { icon: '🏛️', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      museum: { icon: '🖼️', color: 'violet', bgColor: 'bg-violet-100', textColor: 'text-violet-700' },
      temple: { icon: '⛩️', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      historic: { icon: '🏰', color: 'stone', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
      viewpoint: { icon: '🌄', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
      park: { icon: '🌳', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
      beach: { icon: '🏖️', color: 'cyan', bgColor: 'bg-cyan-100', textColor: 'text-cyan-700' },
      nature: { icon: '🌿', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      monument: { icon: '🗿', color: 'stone', bgColor: 'bg-stone-100', textColor: 'text-stone-700' },
      castle: { icon: '🏰', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      church: { icon: '⛪', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      
      // Entertainment & Recreation
      entertainment: { icon: '🎭', color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
      cinema: { icon: '🎬', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      karaoke: { icon: '🎤', color: 'pink', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
      nightclub: { icon: '🌃', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      casino: { icon: '🎰', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
      bowling: { icon: '🎳', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      arcade: { icon: '🕹️', color: 'indigo', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700' },
      sports_center: { icon: '⚽', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      spa: { icon: '🧘', color: 'teal', bgColor: 'bg-teal-100', textColor: 'text-teal-700' },
      gym: { icon: '🏋️', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      
      // Shopping
      mall: { icon: '🛍️', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      supermarket: { icon: '🛒', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      market: { icon: '🏪', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
      department_store: { icon: '🏬', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      boutique: { icon: '👗', color: 'pink', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
      souvenir_shop: { icon: '🎁', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
      bookstore: { icon: '📚', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      electronics: { icon: '📱', color: 'slate', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
      
      // Transportation
      airport: { icon: '✈️', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      train_station: { icon: '🚆', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      bus_station: { icon: '🚌', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
      metro_station: { icon: '🚇', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      taxi_stand: { icon: '🚕', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
      car_rental: { icon: '🚗', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      gas_station: { icon: '⛽', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      parking: { icon: '🅿️', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      
      // Healthcare & Services
      hospital: { icon: '🏥', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      pharmacy: { icon: '💊', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      clinic: { icon: '🩺', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      dentist: { icon: '🦷', color: 'white', bgColor: 'bg-white', textColor: 'text-gray-700' },
      bank: { icon: '🏦', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      atm: { icon: '🏧', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      post_office: { icon: '📮', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      police: { icon: '👮', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      embassy: { icon: '🏛️', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      
      // Education & Business
      school: { icon: '🏫', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      university: { icon: '🎓', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      library: { icon: '📚', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      conference_center: { icon: '🏢', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
      business_center: { icon: '💼', color: 'slate', bgColor: 'bg-slate-100', textColor: 'text-slate-700' }
    };
    
    return configs[type] || defaultConfig;
  }

  /**
   * Get Vietnamese label for place type
   */
  static getPlaceTypeLabel(type: PlaceType): string {
    const labels: Partial<Record<PlaceType, string>> = {
      // Dining & Food
      restaurant: 'Nhà hàng',
      fast_food: 'Đồ ăn nhanh',
      cafe: 'Quán cafe',
      bar: 'Quán bar',
      food_court: 'Khu ẩm thực',
      street_food: 'Đồ ăn đường phố',
      bakery: 'Tiệm bánh',
      ice_cream: 'Quán kem',
      
      // Accommodation
      hotel: 'Khách sạn',
      hostel: 'Nhà trọ',
      apartment: 'Căn hộ',
      guest_house: 'Nhà khách',
      resort: 'Khu nghỉ dưỡng',
      motel: 'Motel',
      
      // Tourism & Culture
      tourist_attraction: 'Điểm du lịch',
      museum: 'Bảo tàng',
      temple: 'Đền/Chùa',
      historic: 'Di tích lịch sử',
      viewpoint: 'Điểm ngắm cảnh',
      park: 'Công viên',
      beach: 'Bãi biển',
      nature: 'Thiên nhiên',
      monument: 'Đài tưởng niệm',
      castle: 'Lâu đài',
      church: 'Nhà thờ',
      
      // Entertainment & Recreation
      entertainment: 'Giải trí',
      cinema: 'Rạp chiếu phim',
      karaoke: 'Karaoke',
      nightclub: 'Hộp đêm',
      casino: 'Sòng bạc',
      bowling: 'Bowling',
      arcade: 'Khu vui chơi',
      sports_center: 'Trung tâm thể thao',
      spa: 'Spa',
      gym: 'Phòng tập gym',
      
      // Shopping
      mall: 'Trung tâm thương mại',
      supermarket: 'Siêu thị',
      market: 'Chợ',
      department_store: 'Cửa hàng bách hóa',
      boutique: 'Cửa hàng thời trang',
      souvenir_shop: 'Cửa hàng quà lưu niệm',
      bookstore: 'Nhà sách',
      electronics: 'Cửa hàng điện tử',
      
      // Transportation
      airport: 'Sân bay',
      train_station: 'Ga tàu hỏa',
      bus_station: 'Bến xe buýt',
      metro_station: 'Ga tàu điện ngầm',
      taxi_stand: 'Điểm taxi',
      car_rental: 'Thuê xe',
      gas_station: 'Cây xăng',
      parking: 'Bãi đỗ xe',
      
      // Healthcare & Services
      hospital: 'Bệnh viện',
      pharmacy: 'Nhà thuốc',
      clinic: 'Phòng khám',
      dentist: 'Nha khoa',
      bank: 'Ngân hàng',
      atm: 'ATM',
      post_office: 'Bưu điện',
      police: 'Đồn công an',
      embassy: 'Đại sứ quán',
      
      // Education & Business
      school: 'Trường học',
      university: 'Đại học',
      library: 'Thư viện',
      conference_center: 'Trung tâm hội nghị',
      business_center: 'Trung tâm kinh doanh'
    };
    
    return labels[type] || 'Địa điểm';
  }

  /**
   * Parse and format rating
   */
  static formatRating(rating: string | number): { value: number; display: string; stars: number } {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const validRating = isNaN(numRating) ? 0 : Math.max(0, Math.min(5, numRating));
    
    return {
      value: validRating,
      display: validRating > 0 ? validRating.toFixed(1) : 'N/A',
      stars: Math.round(validRating)
    };
  }

  /**
   * Generate price level indicators
   */
  static getPriceLevelIndicator(level?: string): { count: number; label: string; symbol: string } {
    if (!level) return { count: 0, label: 'Không rõ', symbol: '' };
    
    const count = level.length;
    const labels = ['Rất rẻ', 'Rẻ', 'Trung bình', 'Đắt', 'Rất đắt'];
    
    return {
      count,
      label: labels[count - 1] || 'Không rõ',
      symbol: '$'.repeat(count)
    };
  }

  /**
   * Calculate bounds for multiple places
   */
  static calculateBounds(places: Place[]): MapBounds | null {
    if (places.length === 0) return null;
    
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    
    places.forEach(place => {
      const lat = parseFloat(place.latitude);
      const lng = parseFloat(place.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }
    });
    
    if (minLat === Infinity) return null;
    
    return {
      sw: { lat: minLat, lng: minLng },
      ne: { lat: maxLat, lng: maxLng }
    };
  }

  /**
   * Check if coordinates are valid
   */
  static isValidCoordinates(lat: number, lng: number): boolean {
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
  }

  /**
   * Generate static map URL for sharing/export
   */
  static generateStaticMapUrl(options: {
    center: Coordinates;
    zoom: number;
    width: number;
    height: number;
    markers?: Array<{ coordinates: Coordinates; label?: string; color?: string }>;
    style?: string;
    token: string;
  }): string {
    const { center, zoom, width, height, markers = [], style = 'streets-v12', token } = options;
    
    let url = `https://api.mapbox.com/styles/v1/mapbox/${style}/static`;
    
    // Add markers
    if (markers.length > 0) {
      const markerString = markers.map(marker => {
        const color = marker.color || 'ff0000';
        const label = marker.label ? encodeURIComponent(marker.label) : '';
        return `pin-s-${label}+${color}(${marker.coordinates.lng},${marker.coordinates.lat})`;
      }).join(',');
      
      url += `/${markerString}`;
    }
    
    // Add center and zoom
    url += `/${center.lng},${center.lat},${zoom}`;
    
    // Add dimensions
    url += `/${width}x${height}`;
    
    // Add token
    url += `?access_token=${token}`;
    
    return url;
  }

  /**
   * Filter places by criteria
   */
  static filterPlaces(places: Place[], criteria: {
    types?: PlaceType[];
    minRating?: number;
    maxDistance?: number;
    userLocation?: Coordinates;
    priceLevel?: string[];
    openNow?: boolean;
    searchQuery?: string;
  }): Place[] {
    return places.filter(place => {
      // Filter by type
      if (criteria.types && criteria.types.length > 0) {
        if (!criteria.types.includes(place.type)) return false;
      }
      
      // Filter by rating
      if (criteria.minRating !== undefined) {
        const rating = parseFloat(place.rating);
        if (isNaN(rating) || rating < criteria.minRating) return false;
      }
      
      // Filter by distance
      if (criteria.maxDistance !== undefined && criteria.userLocation) {
        const placeCoords = { 
          lat: parseFloat(place.latitude), 
          lng: parseFloat(place.longitude) 
        };
        const distance = this.calculateDistance(criteria.userLocation, placeCoords);
        if (distance > criteria.maxDistance) return false;
      }
      
      // Filter by price level
      if (criteria.priceLevel && criteria.priceLevel.length > 0) {
        if (!place.details?.price_level || 
            !criteria.priceLevel.includes(place.details.price_level)) return false;
      }
      
      // Filter by search query
      if (criteria.searchQuery) {
        const query = criteria.searchQuery.toLowerCase();
        const searchableText = [
          place.name,
          place.details?.address,
          place.details?.description,
          ...((place.cuisine || []).map(c => c.name)),
          ...(place.features || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }
      
      return true;
    });
  }

  /**
   * Sort places by different criteria
   */
  static sortPlaces(places: Place[], sortBy: 'distance' | 'rating' | 'name' | 'price', userLocation?: Coordinates): Place[] {
    return [...places].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!userLocation) return 0;
          const distA = this.calculateDistance(userLocation, {
            lat: parseFloat(a.latitude),
            lng: parseFloat(a.longitude)
          });
          const distB = this.calculateDistance(userLocation, {
            lat: parseFloat(b.latitude),
            lng: parseFloat(b.longitude)
          });
          return distA - distB;
          
        case 'rating':
          const ratingA = parseFloat(a.rating) || 0;
          const ratingB = parseFloat(b.rating) || 0;
          return ratingB - ratingA;
          
        case 'name':
          return a.name.localeCompare(b.name, 'vi');
          
        case 'price':
          const priceA = a.details?.price_level?.length || 0;
          const priceB = b.details?.price_level?.length || 0;
          return priceA - priceB;
          
        default:
          return 0;
      }
    });
  }

  /**
   * Debounce function for search inputs
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Generate shareable link for a place or location
   */
  static generateShareableLink(options: {
    place?: Place;
    coordinates?: Coordinates;
    zoom?: number;
    baseUrl?: string;
  }): string {
    const { place, coordinates, zoom = 15, baseUrl = window.location.origin } = options;
    
    if (place) {
      const lat = parseFloat(place.latitude);
      const lng = parseFloat(place.longitude);
      return `${baseUrl}/map?lat=${lat}&lng=${lng}&zoom=${zoom}&place=${encodeURIComponent(place.name)}`;
    } else if (coordinates) {
      return `${baseUrl}/map?lat=${coordinates.lat}&lng=${coordinates.lng}&zoom=${zoom}`;
    }
    
    return baseUrl;
  }

  /**
   * Save places to local storage
   */
  static savePlacesToLocal(places: Place[], key: string = 'saved_places'): void {
    try {
      localStorage.setItem(key, JSON.stringify(places));
    } catch (error) {
      console.error('Error saving places to localStorage:', error);
    }
  }

  /**
   * Load places from local storage
   */
  static loadPlacesFromLocal(key: string = 'saved_places'): Place[] {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading places from localStorage:', error);
      return [];
    }
  }

  /**
   * Export places data as JSON
   */
  static exportPlacesAsJSON(places: Place[], filename: string = 'places.json'): void {
    const dataStr = JSON.stringify(places, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate map screenshot/export URL
   */
  static generateMapScreenshot(options: {
    center: Coordinates;
    zoom: number;
    width?: number;
    height?: number;
    places?: Place[];
    token: string;
  }): string {
    const { center, zoom, width = 800, height = 600, places = [], token } = options;
    
    const markers = places.slice(0, 10).map(place => ({
      coordinates: { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) },
      label: place.name.charAt(0).toUpperCase(),
      color: this.getPlaceTypeConfig(place.type).color
    }));
    
    return this.generateStaticMapUrl({
      center,
      zoom,
      width,
      height,
      markers,
      token
    });
  }
}