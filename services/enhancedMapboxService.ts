// services/enhancedMapboxService.ts
import { Place, PlaceType } from '@/app/dashboard/Map/types';

interface OptimizationOptions {
  coordinates: [number, number][];
  source?: 'any' | 'first';
  destination?: 'any' | 'last';
  roundTrip?: boolean;
}

export class EnhancedMapboxService {
  private static accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  private static baseUrl = 'https://api.mapbox.com';

  /**
   * Tạo isochrone (vùng có thể đi được trong thời gian cụ thể)
   */
  static async getIsochrone(
    center: [number, number],
    minutes: number = 15,
    mode: 'driving' | 'walking' | 'cycling' = 'walking'
  ): Promise<GeoJSON.FeatureCollection | null> {
    try {
      const url = `${this.baseUrl}/isochrone/v1/mapbox/${mode}/${center[0]},${center[1]}`;
      
      const params = new URLSearchParams({
        access_token: this.accessToken,
        contours_minutes: minutes.toString(),
        polygons: 'true'
      });

      const response = await fetch(`${url}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating isochrone:', error);
      return null;
    }
  }

  /**
   * Tối ưu hóa lộ trình khi có nhiều điểm
   */
  static async optimizeRoute(options: OptimizationOptions): Promise<any> {
    try {
      const url = `${this.baseUrl}/optimized-trips/v1/mapbox/driving`;
      
      const coordinates = options.coordinates
        .map(coord => `${coord[0]},${coord[1]}`)
        .join(';');
      
      const params = new URLSearchParams({
        access_token: this.accessToken,
        geometries: 'geojson',
        overview: 'full',
        steps: 'true',
        source: options.source || 'any',
        destination: options.destination || 'any',
        roundtrip: (options.roundTrip === undefined ? true : options.roundTrip).toString()
      });

      const response = await fetch(`${url}/${coordinates}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error optimizing route:', error);
      return null;
    }
  }

  /**
   * Tìm kiếm địa điểm với Search Box API
   */
  static async searchPlaces(
    query: string,
    proximity?: [number, number],
    options?: {
      language?: string;
      limit?: number;
      types?: string[];
    }
  ): Promise<Place[]> {
    try {
      const url = `${this.baseUrl}/search/searchbox/v1/suggest`;
      
      const params = new URLSearchParams({
        access_token: this.accessToken,
        q: query,
        language: options?.language || 'vi',
        limit: (options?.limit || 10).toString()
      });

      if (proximity) {
        params.append('proximity', `${proximity[0]},${proximity[1]}`);
      }

      if (options?.types && options.types.length > 0) {
        params.append('types', options.types.join(','));
      }

      const response = await fetch(`${url}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Chuyển đổi từ định dạng Mapbox sang định dạng Place của ứng dụng
      return data.suggestions.map((suggestion: any) => {
        return {
          id: suggestion.mapbox_id,
          name: suggestion.name,
          latitude: suggestion.geometry?.coordinates[1].toString() || '0',
          longitude: suggestion.geometry?.coordinates[0].toString() || '0',
          rating: '0', // Mapbox không cung cấp đánh giá
          type: this.mapCategoryToPlaceType(suggestion.category || ''),
          details: {
            address: suggestion.full_address || suggestion.place_formatted,
            description: suggestion.description || ''
          }
        };
      });
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Lấy matrix thời gian di chuyển giữa nhiều điểm
   */
  static async getTimeMatrix(
    coordinates: [number, number][],
    mode: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<number[][] | null> {
    try {
      const url = `${this.baseUrl}/directions-matrix/v1/mapbox/${mode}`;
      
      const coordsString = coordinates
        .map(coord => `${coord[0]},${coord[1]}`)
        .join(';');
      
      const params = new URLSearchParams({
        access_token: this.accessToken,
        annotations: 'duration',
        sources: 'all',
        destinations: 'all'
      });

      const response = await fetch(`${url}/${coordsString}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.durations;
    } catch (error) {
      console.error('Error getting time matrix:', error);
      return null;
    }
  }

  // Helper để chuyển đổi category của Mapbox sang PlaceType của ứng dụng
  private static mapCategoryToPlaceType(category: string): PlaceType {
    if (category.includes('restaurant') || category.includes('food')) return 'restaurant';
    if (category.includes('hotel') || category.includes('lodging')) return 'hotel';
    if (category.includes('cafe')) return 'cafe';
    if (category.includes('bar')) return 'bar';
    if (category.includes('museum')) return 'museum';
    if (category.includes('attraction')) return 'tourist_attraction';
    if (category.includes('landmark')) return 'tourist_attraction';
    if (category.includes('shop') || category.includes('mall')) return 'mall';
    if (category.includes('hospital')) return 'hospital';
    if (category.includes('pharmacy')) return 'pharmacy';
    
    // Mặc định
    return 'tourist_attraction';
  }
}