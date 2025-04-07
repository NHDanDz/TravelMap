// services/tripAdvisorService.ts
import { Place, PlaceType } from '@/app/dashboard/Map/types';

interface SearchOptions {
  latitude: number;
  longitude: number;
  type: PlaceType;
  radius: number;
}

class TripadvisorServiceClass {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY || '';
    this.baseUrl = 'https://api.content.tripadvisor.com/api/v1';
  }

  async searchPlaces({ latitude, longitude, type, radius }: SearchOptions): Promise<Place[]> {
    try {
      // Convert place type to TripAdvisor category
      const category = this.mapTypeToCategory(type);
      
      // Prepare URL with query parameters
      const url = new URL(`${this.baseUrl}/location/search`);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('latLong', `${latitude},${longitude}`);
      url.searchParams.append('category', category);
      url.searchParams.append('radius', radius.toString());
      url.searchParams.append('radiusUnit', 'km');
      url.searchParams.append('language', 'en');
      
      // Make the API request
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`TripAdvisor API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      // Map TripAdvisor data to our Place interface
      return this.mapResponseToPlaces(data, type);
    } catch (error) {
      console.error('TripAdvisor search error:', error);
      throw error;
    }
  }

  async getPlaceDetails(locationId: string): Promise<Place | null> {
    try {
      // Prepare URL with query parameters
      const url = new URL(`${this.baseUrl}/location/${locationId}/details`);
      url.searchParams.append('key', this.apiKey);
      url.searchParams.append('language', 'en');
      url.searchParams.append('currency', 'USD');
      
      // Make the API request
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`TripAdvisor API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      // Map TripAdvisor data to our Place interface
      return this.mapDetailResponseToPlace(data);
    } catch (error) {
      console.error('TripAdvisor details error:', error);
      throw error;
    }
  }

  private mapTypeToCategory(type: PlaceType): string {
    // Map your PlaceType to TripAdvisor categories
    const categoryMap: Record<PlaceType, string> = {
      restaurant: 'restaurants',
      fast_food: 'restaurants',
      cafe: 'restaurants',
      bar: 'restaurants',
      food_court: 'restaurants',
      street_food: 'restaurants',
      hotel: 'hotels',
      hostel: 'hotels',
      apartment: 'hotels',
      guest_house: 'hotels',
      tourist_attraction: 'attractions',
      museum: 'attractions',
      temple: 'attractions',
      historic: 'attractions',
      viewpoint: 'attractions',
      entertainment: 'attractions',
      cinema: 'attractions',
      karaoke: 'attractions',
      mall: 'shopping',
      supermarket: 'shopping',
      market: 'shopping',
      hospital: 'attractions',
      pharmacy: 'attractions'
    };
    
    return categoryMap[type] || 'restaurants';
  }

  private mapResponseToPlaces(response: any, type: PlaceType): Place[] {
    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }
    
    return response.data.map((item: any) => ({
      id: item.location_id,
      name: item.name,
      latitude: item.latitude || '0',
      longitude: item.longitude || '0',
      rating: item.rating || '0',
      type: type,
      photo: item.photo ? {
        images: {
          large: {
            url: item.photo.images.large.url
          }
        }
      } : undefined,
      details: {
        address: item.address,
        website: item.website,
        phone: item.phone,
        description: item.description
      }
    }));
  }

  private mapDetailResponseToPlace(response: any): Place {
    const details = {
      address: response.address,
      phone: response.phone,
      website: response.website,
      description: response.description,
      openingHours: response.hours?.weekday_text?.join(', '),
      cuisine: response.cuisine?.map((c: any) => c.name).join(', '),
      price_level: response.price_level,
      // Amenities based on available data
      outdoor_seating: response.amenities?.includes('Outdoor Seating') ? 'yes' : 'no',
      takeaway: response.amenities?.includes('Takeout') ? 'yes' : 'no',
      delivery: response.amenities?.includes('Delivery') ? 'yes' : 'no',
      wheelchair: response.amenities?.includes('Wheelchair Accessible') ? 'yes' : 'no',
      air_conditioning: response.amenities?.includes('Air Conditioning') ? 'yes' : 'no',
      internet_access: response.amenities?.includes('Free Wifi') ? 'yes' : 'no',
      smoking: response.amenities?.includes('Smoking Allowed') ? 'yes' : 'no'
    };

    return {
      id: response.location_id,
      name: response.name,
      latitude: response.latitude || '0',
      longitude: response.longitude || '0',
      rating: response.rating || '0',
      type: this.determinePlaceType(response.category),
      photo: response.photo ? {
        images: {
          large: {
            url: response.photo.images.large.url
          }
        }
      } : undefined,
      details
    };
  }

  private determinePlaceType(category: any): PlaceType {
    // Try to determine the place type based on TripAdvisor category
    if (category?.name?.toLowerCase().includes('restaurant')) {
      return 'restaurant';
    } else if (category?.name?.toLowerCase().includes('hotel')) {
      return 'hotel';
    } else if (category?.name?.toLowerCase().includes('attraction')) {
      return 'tourist_attraction';
    }
    
    // Default to restaurant if unable to determine
    return 'restaurant';
  }
}

// Create a singleton instance with a different variable name to avoid naming conflict
export const TripadvisorService = new TripadvisorServiceClass();