// services/tripAdvisorService.ts
import { Place, Coordinates } from '@/types/map';

interface TripAdvisorPlace {
  location_id: string;
  name: string;
  latitude: string;
  longitude: string;
  rating: string;
  num_reviews: string;
  location_string: string;
  photo?: {
    images: {
      large: {
        url: string;
      };
    };
  };
  price_level: string;
  price: string;
  ranking: string;
  phone: string;
  website: string;
  email: string;
  address: string;
  cuisine?: { 
    name: string;
  }[];
  dietary_restrictions?: {
    name: string;
  }[];
  hours?: {
    week_ranges: {
      open_time: number;
      close_time: number;
    }[][];
  };
}

export class TripAdvisorService {
  private static apiKey = process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY;
  private static baseUrl = 'https://api.content.tripadvisor.com/api/v1';

  private static async makeRequest(endpoint: string, params: Record<string, string>) {
    const queryParams = new URLSearchParams({
      ...params,
      key: this.apiKey as string,
    });

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`TripAdvisor API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('TripAdvisor API request failed:', error);
      throw error;
    }
  }

  static async searchPlaces(
    location: Coordinates,
    type: string,
    radius: number
  ): Promise<Place[]> {
    try {
      const response = await this.makeRequest('/location/search', {
        latLong: `${location.lat},${location.lng}`,
        category: this.mapPlaceType(type),
        radius: (radius / 1000).toString(), // Convert meters to km
        language: 'vi',
      });

      return response.data.map(this.transformToPlace);
    } catch (error) {
      console.error('Error searching TripAdvisor places:', error);
      return [];
    }
  }

  static async getPlaceDetails(locationId: string): Promise<Place | null> {
    try {
      const response = await this.makeRequest('/location/details', {
        location_id: locationId,
        language: 'vi',
        currency: 'VND',
      });

      return this.transformToPlace(response);
    } catch (error) {
      console.error('Error fetching TripAdvisor place details:', error);
      return null;
    }
  }

  private static mapPlaceType(type: string): string {
    // Map your application's place types to TripAdvisor categories
    const typeMapping: Record<string, string> = {
      restaurant: 'restaurants',
      cafe: 'restaurants',
      bar: 'restaurants',
      hotel: 'hotels',
      attraction: 'attractions',
      // Add more mappings as needed
    };

    return typeMapping[type] || 'restaurants';
  }

  private static transformToPlace(taPlace: TripAdvisorPlace): Place {
    return {
      id: taPlace.location_id,
      name: taPlace.name,
      latitude: taPlace.latitude,
      longitude: taPlace.longitude,
      rating: taPlace.rating,
      type: 'restaurant', // You'll need to map this based on the response
      photo: taPlace.photo,
      details: {
        cuisine: taPlace.cuisine?.map(c => c.name).join(', '),
        price_level: taPlace.price_level,
        phone: taPlace.phone,
        website: taPlace.website,
        address: taPlace.address,
        openingHours: this.formatOpeningHours(taPlace.hours),
        rating_count: parseInt(taPlace.num_reviews, 10),
      },
    };
  }

  private static formatOpeningHours(hours?: { week_ranges: any[][] }): string {
    if (!hours?.week_ranges) return '';

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    return hours.week_ranges.map((ranges, dayIndex) => {
      if (!ranges.length) return `${daysOfWeek[dayIndex]}: Đóng cửa`;
      
      const times = ranges.map(range => {
        const openTime = this.minutesToTime(range.open_time);
        const closeTime = this.minutesToTime(range.close_time);
        return `${openTime}-${closeTime}`;
      }).join(', ');
      
      return `${daysOfWeek[dayIndex]}: ${times}`;
    }).join('\n');
  }

  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}