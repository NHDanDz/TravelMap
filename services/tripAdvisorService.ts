// TripAdvisorService.ts (Coordinate Fix)
import { Place, PlaceType } from '@/app/dashboard/Map/types';

export interface TripAdvisorSearchOptions {
  latitude: number;
  longitude: number;
  type: PlaceType;
  radius?: number;
  language?: string;
}

export class TripAdvisorService {
  private static readonly API_BASE_URL = 'https://api.content.tripadvisor.com/api/v1';
  private static readonly API_KEY = process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY;

  /**
   * Tìm kiếm địa điểm gần đó dựa trên TripAdvisor API
   */
  static async searchPlaces(options: TripAdvisorSearchOptions): Promise<Place[]> {
    try {
      // Kiểm tra API key
      if (!this.API_KEY) {
        console.error('Missing TripAdvisor API key');
        throw new Error('Thiếu API key TripAdvisor');
      }

      // Format tọa độ theo yêu cầu của TripAdvisor
      const latLong = `${options.latitude},${options.longitude}`;
      
      // Chuyển đổi từ PlaceType sang category của TripAdvisor
      const category = this.mapPlaceTypeToCategory(options.type);
      
      // Xây dựng URL với các tham số
      const url = new URL(`${this.API_BASE_URL}/location/nearby_search`);
      
      // Thêm API key vào query parameters (theo tài liệu TripAdvisor)
      url.searchParams.append('key', this.API_KEY);
      
      // Thêm các tham số khác
      url.searchParams.append('latLong', latLong);
      url.searchParams.append('category', category);
      
      if (options.radius) {
        url.searchParams.append('radius', options.radius.toString());
        url.searchParams.append('radiusUnit', 'km');
      }
      
      if (options.language) {
        url.searchParams.append('language', options.language);
      }
      
      console.log(`Searching TripAdvisor for ${category} near ${latLong}`);
      console.log('API URL (hiding key):', url.toString().replace(this.API_KEY, 'API_KEY_HIDDEN'));
      
      // Gọi API TripAdvisor
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TripAdvisor API error:', errorText);
        throw new Error(`Lỗi API TripAdvisor: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Phân tích cấu trúc dữ liệu trả về từ API
      console.log('API Response Structure:', JSON.stringify(data).substring(0, 500) + '...');
      
      // Xử lý dữ liệu trả về
      if (!data.data || !Array.isArray(data.data)) {
        console.error('Unexpected response format:', data);
        return [];
      }
      
      // Chuyển đổi dữ liệu từ TripAdvisor sang định dạng Place
      const places = data.data.map((location: any) => 
        this.convertLocationToPlace(location, options.type, options.latitude, options.longitude)
      );
      
      return places;
    } catch (error) {
      console.error('Error searching places with TripAdvisor:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết địa điểm từ TripAdvisor API
   */
  static async getPlaceDetails(locationId: string): Promise<Place | null> {
    try {
      // Kiểm tra API key
      if (!this.API_KEY) {
        console.error('Missing TripAdvisor API key');
        throw new Error('Thiếu API key TripAdvisor');
      }
      
      // Xây dựng URL API 
      const url = new URL(`${this.API_BASE_URL}/location/${locationId}/details`);
      url.searchParams.append('key', this.API_KEY); // API key trong URL
      url.searchParams.append('language', 'vi');
      url.searchParams.append('currency', 'VND');
      
      console.log(`Fetching details for location: ${url.toString()}`);
      
      // Gọi API TripAdvisor
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TripAdvisor API error:', errorText);
        throw new Error(`Lỗi API TripAdvisor: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Chuyển đổi dữ liệu từ API sang định dạng Place
      const place = this.convertDetailResponseToPlace(data);
      
      return place;
    } catch (error) {
      console.error('Error fetching place details from TripAdvisor:', error);
      throw error;
    }
  }

  /**
   * Chuyển đổi từ PlaceType trong ứng dụng sang category của TripAdvisor
   */
  private static mapPlaceTypeToCategory(type: PlaceType): string {
    switch (type) {
      case 'restaurant':
      case 'cafe':
      case 'bar':
      case 'fast_food':
      case 'food_court':
      case 'street_food':
        return 'restaurants';
      
      case 'hotel':
      case 'hostel':
      case 'apartment':
      case 'guest_house':
        return 'hotels';
      
      case 'tourist_attraction':
      case 'museum':
      case 'temple':
      case 'historic':
      case 'viewpoint':
      case 'entertainment':
      case 'cinema':
      case 'karaoke':
        return 'attractions';
      
      case 'mall':
      case 'supermarket':
      case 'market':
      case 'pharmacy':
      case 'hospital':
        // Không có category phù hợp, dùng restaurants làm mặc định
        return 'restaurants';
      
      default:
        return 'restaurants';
    }
  }

  /**
   * Chuyển đổi từ dữ liệu địa điểm của TripAdvisor sang định dạng Place của ứng dụng
   * Bổ sung tọa độ gốc để tính toán chính xác vị trí
   */
  private static convertLocationToPlace(
    location: any, 
    type: PlaceType, 
    originLat: number, 
    originLng: number
  ): Place {
    // Tính toán tọa độ từ thông tin distance và bearing
    let latitude = originLat;
    let longitude = originLng;
    
    if (location.distance && location.bearing) {
      // Convert distance from miles to kilometers if needed
      const distanceInKm = parseFloat(location.distance);
      // Compute new coordinates using simple approximation
      // This is a simple approximation for small distances
      const bearingRadians = this.getBearingInRadians(location.bearing);
      
      // Địa cầu có bán kính khoảng 6371 km
      // 1 độ kinh tuyến ở xích đạo ≈ 111.32 km
      // 1 độ vĩ tuyến ≈ 110.57 km
      
      // Thay đổi kinh độ và vĩ độ tương ứng
      const latChange = (distanceInKm * Math.cos(bearingRadians)) / 110.57;
      const lngChange = (distanceInKm * Math.sin(bearingRadians)) / 
                      (111.32 * Math.cos(latitude * (Math.PI / 180)));
      
      latitude += latChange;
      longitude += lngChange;
    }
    
    // Bảo đảm tọa độ có giá trị thực (không phải NaN)
    if (isNaN(latitude) || isNaN(longitude)) {
      console.warn(`Invalid coordinates calculated for ${location.name}, using origin coordinates`);
      latitude = originLat;
      longitude = originLng;
    }
    
    // Nếu có address_obj, sử dụng nó
    const address = location.address_obj ? 
      (location.address_obj.address_string || '') : '';
    
    return {
      id: location.location_id,
      name: location.name,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      rating: location.rating || '0',
      type: type,
      details: {
        address: address
      }
    };
  }

  /**
   * Chuyển đổi từ dữ liệu chi tiết của TripAdvisor sang định dạng Place của ứng dụng
   */
  private static convertDetailResponseToPlace(data: any): Place {
    // Tùy vào cấu trúc dữ liệu thực tế từ API
    return {
      id: data.location_id || '',
      name: data.name || '',
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      rating: data.rating || '0',
      type: 'restaurant', // Mặc định
      details: {
        address: data.address_obj?.address_string || '',
        phone: data.phone || '',
        website: data.website || '',
        description: data.description || '',
        openingHours: data.hours?.hours_text || '',
        price_level: data.price_level || '',
      }
    };
  }

  /**
   * Chuyển đổi bearing từ text sang radian
   */
  private static getBearingInRadians(bearing: string): number {
    switch (bearing.toLowerCase()) {
      case 'north': return 0;
      case 'northeast': return Math.PI / 4;
      case 'east': return Math.PI / 2;
      case 'southeast': return 3 * Math.PI / 4;
      case 'south': return Math.PI;
      case 'southwest': return 5 * Math.PI / 4;
      case 'west': return 3 * Math.PI / 2;
      case 'northwest': return 7 * Math.PI / 4;
      default: return 0;
    }
  }
}