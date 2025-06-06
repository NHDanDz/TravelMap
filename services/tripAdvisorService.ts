// TripAdvisorService.ts (Đã sửa lỗi ESLint)
import { Place, PlaceType } from '@/app/dashboard/Map/types';

export interface TripAdvisorSearchOptions {
  latitude: number;
  longitude: number;
  type: PlaceType;
  radius?: number;
  language?: string;
}

// Định nghĩa interface cho response từ TripAdvisor API
interface TripAdvisorLocation {
  location_id: string;
  name: string;
  latitude?: string;
  longitude?: string;
  rating?: string;
  distance?: string;
  bearing?: string;
  address_obj?: {
    address_string?: string;
  };
  web_url?: string;
  write_review?: string;
  photo?: unknown;
  description?: string;
  category?: {
    name: string;
  };
  subcategory?: Array<{
    name: string;
    localized_name?: string;
  }>;
  phone?: string;
  website?: string;
}

interface TripAdvisorSearchResponse {
  data: TripAdvisorLocation[];
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
      
      const data: TripAdvisorSearchResponse = await response.json();
      
      // Phân tích cấu trúc dữ liệu trả về từ API
      console.log('API Response Structure:', JSON.stringify(data).substring(0, 500) + '...');
      
      // Xử lý dữ liệu trả về
      if (!data.data || !Array.isArray(data.data)) {
        console.error('Unexpected response format:', data);
        return [];
      }
      
      // Trả về dữ liệu cơ bản với tọa độ gần đúng trước để có hiệu suất tốt hơn
      const places = data.data.map((location: TripAdvisorLocation) => 
        this.convertLocationToPlace(location, options.type, options.latitude, options.longitude)
      );
      
      return places;
    } catch (error) {
      console.error('Error searching places with TripAdvisor:', error);
      throw error;
    }
  }

  /**
   * Tìm kiếm địa điểm với tọa độ chính xác (bằng cách lấy chi tiết cho mỗi địa điểm)
   * Lưu ý: Phương thức này sẽ thực hiện nhiều cuộc gọi API hơn nhưng cung cấp dữ liệu tọa độ chính xác
   */
  static async searchPlacesWithExactCoordinates(options: TripAdvisorSearchOptions): Promise<Place[]> {
    try {
      // Đầu tiên lấy danh sách địa điểm cơ bản
      const basicPlaces = await this.searchPlaces(options);
      
      if (basicPlaces.length === 0) {
        return [];
      }
      
      console.log(`Getting exact coordinates for ${basicPlaces.length} places...`);
      
      // Sau đó lấy chi tiết cho mỗi địa điểm (bao gồm tọa độ chính xác)
      // Sử dụng Promise.all để thực hiện các cuộc gọi song song nhưng giới hạn số lượng
      const placesWithCoordinates = await Promise.all(
        basicPlaces.slice(0, 5).map(async (place) => {
          if (!place.id) return place;
          
          try {
            // Lấy chi tiết địa điểm bao gồm tọa độ chính xác
            const detailedPlace = await this.getPlaceDetails(place.id);
            return detailedPlace || place;
          } catch (error) {
            console.error(`Error getting details for place ${place.id}:`, error);
            return place;
          }
        })
      );
      
      return placesWithCoordinates.filter((place): place is Place => place !== null);
    } catch (error) {
      console.error('Error searching places with exact coordinates:', error);
      return [];
    }
  }

  /**
   * Chuyển đổi dữ liệu chi tiết từ API sang định dạng Place
   */
  private static convertDetailResponseToPlace(data: TripAdvisorLocation): Place {
    // Xác định loại địa điểm
    const type = this.determinePlaceType(data);
  
    // Địa chỉ
    const address = data.address_obj?.address_string || '';
  
    // Tạo đối tượng Place
    const place: Place = {
      id: data.location_id,
      name: data.name,
      latitude: data.latitude?.toString() || '',
      longitude: data.longitude?.toString() || '',
      rating: data.rating?.toString() || '0',
      type: type,
  
      // Thông tin bổ sung
      address_obj: data.address_obj,
      web_url: data.web_url,
      write_review: data.write_review,
      photo: data.photo,
  
      details: {
        address: address,
        description: data.description || '',
        phone: data.phone,
        website: data.website
      }
    };
  
    return place;
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
      
      console.log(`Fetching details for location: ${locationId}`);
      
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
      
      const data: TripAdvisorLocation = await response.json();
      
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
   * Bổ sung tọa độ gốc để tính toán gần đúng vị trí cho tìm kiếm ban đầu
   */
  private static convertLocationToPlace(
    location: TripAdvisorLocation, 
    type: PlaceType, 
    originLat: number, 
    originLng: number
  ): Place {
    // Tính toán tọa độ từ thông tin distance và bearing
    let latitude = originLat;
    let longitude = originLng;
    
    // Kiểm tra nếu đã có tọa độ chính xác từ API
    if (location.latitude && location.longitude) {
      latitude = parseFloat(location.latitude);
      longitude = parseFloat(location.longitude);
      console.log(`Using exact coordinates for ${location.name}: ${latitude}, ${longitude}`);
    }
    // Nếu không, tính toán tọa độ tương đối từ khoảng cách và hướng
    else if (location.distance && location.bearing) {
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
      console.log(`Calculated approximate coordinates for ${location.name}: ${latitude}, ${longitude} (from distance ${distanceInKm}km, bearing ${location.bearing})`);
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
    
    // Thu thập tất cả dữ liệu có sẵn từ đối tượng địa điểm
    const place: Place = {
      id: location.location_id,
      name: location.name,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      rating: location.rating || '0',
      type: type,
      
      // Giữ lại đối tượng địa chỉ nếu có
      address_obj: location.address_obj,
      
      // Thêm các trường khác nếu có
      web_url: location.web_url,
      write_review: location.write_review,
      photo: location.photo,
      
      // Đặt thông tin chi tiết
      details: {
        address: address,
        description: location.description || ''
      }
    };
    
    return place;
  }

  /**
   * Xác định loại địa điểm từ dữ liệu API
   */
  private static determinePlaceType(data: TripAdvisorLocation): PlaceType {
    // Cố gắng xác định type từ dữ liệu subtype
    if (data.category?.name === 'restaurant' || 
        (data.subcategory && data.subcategory.some((sub) => 
          sub.name === 'restaurant' || sub.localized_name?.toLowerCase().includes('nhà hàng')))) {
      return 'restaurant';
    }
    
    if (data.category?.name === 'hotel' || 
        (data.subcategory && data.subcategory.some((sub) => 
          sub.name === 'hotel' || sub.localized_name?.toLowerCase().includes('khách sạn')))) {
      return 'hotel';
    }
    
    if (data.category?.name === 'attraction' || 
        (data.subcategory && data.subcategory.some((sub) => 
          sub.name === 'attraction' || sub.localized_name?.toLowerCase().includes('điểm du lịch')))) {
      return 'tourist_attraction';
    }
    
    // Mặc định trả về restaurant nếu không xác định được
    return 'restaurant';
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