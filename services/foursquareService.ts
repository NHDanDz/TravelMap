// services/foursquareService.ts
import { Place, PlaceType } from '@/app/dashboard/Map/types';

interface FoursquareVenue {
  fsq_id: string;
  name: string;
  categories: Array<{
    id: number;
    name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  location: {
    address?: string;
    country?: string;
    cross_street?: string;
    formatted_address?: string;
    locality?: string;
    postcode?: string;
    region?: string;
    address_extended?: string;
    latitude: number;
    longitude: number;
  };
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
  photos?: Array<{
    id: string;
    created_at: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }>;
  description?: string;
  tel?: string;
  website?: string;
  hours?: {
    display: string;
    is_local_holiday: boolean;
    open_now: boolean;
  };
  rating?: number;
  price?: number;
  features?: {
    payment?: {
      credit_cards?: boolean;
      digital_wallet?: boolean;
    };
    food_and_drink?: {
      alcohol?: boolean;
      breakfast?: boolean;
      dinner?: boolean;
      lunch?: boolean;
    };
    services?: {
      delivery?: boolean;
      takeout?: boolean;
    };
    amenities?: {
      outdoor_seating?: boolean;
      wifi?: boolean;
      restroom?: boolean;
      smoking?: boolean;
    };
  };
}

interface FoursquareResponse {
  results: FoursquareVenue[];
  context?: {
    geo_bounds?: {
      circle?: {
        center?: {
          latitude: number;
          longitude: number;
        };
        radius?: number;
      };
    };
  };
}

export class FoursquareService {
  private static apiKey = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY || '';
  private static baseUrl = 'https://api.foursquare.com/v3';

  private static async makeRequest(endpoint: string, params: Record<string, string>) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${endpoint}?${queryString}`;

    try {
      console.log('FoursquareService.makeRequest - URL:', url.replace(this.apiKey, '[API_KEY]'));
      console.log('FoursquareService.makeRequest - Headers:', { 
        'Accept': 'application/json',
        'Authorization': this.apiKey ? 'API Key present' : 'No API Key'
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Foursquare API error:', response.status, errorText);
        throw new Error(`Foursquare API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Foursquare API request failed:', error);
      throw error;
    }
  }

  static async searchPlaces(
    lat: number,
    lng: number,
    type: PlaceType,
    radius: number
  ): Promise<Place[]> {
    try {
      console.log('FoursquareService.searchPlaces - Params:', { lat, lng, type, radius });
      console.log('API Key length:', (this.apiKey || '').length > 0 ? `${(this.apiKey || '').slice(0, 5)}...` : 'không có');
      
      const params: Record<string, string> = {
        ll: `${lat},${lng}`,
        radius: radius.toString(),
        limit: '50',
        categories: this.mapPlaceType(type),
        sort: 'DISTANCE',
        fields: 'fsq_id,name,geocodes,location,categories,photos,description,tel,website,hours,rating,price'
      };

      console.log('FoursquareService.searchPlaces - Mapped category:', this.mapPlaceType(type));
      
      const response = await this.makeRequest('/places/search', params) as FoursquareResponse;
      console.log('FoursquareService.searchPlaces - Response count:', response.results?.length || 0);

      return response.results.map(venue => this.transformToPlace(venue, type));
    } catch (error) {
      console.error('Error searching Foursquare places:', error);
      return [];
    }
  }

  static async getPlaceDetails(fsqId: string): Promise<Place | null> {
    try {
      const params: Record<string, string> = {
        fields: 'fsq_id,name,geocodes,location,categories,photos,description,tel,website,hours,rating,price,features'
      };

      const response = await this.makeRequest(`/places/${fsqId}`, params) as FoursquareVenue;
      return this.transformToPlace(response);
    } catch (error) {
      console.error('Error fetching Foursquare place details:', error);
      return null;
    }
  }

  private static mapPlaceType(type: PlaceType): string {
    // Map app place types to Foursquare category IDs
    // https://location.foursquare.com/developer/reference/categories
    const typeMapping: Record<string, string> = {
      restaurant: '13065',      // Restaurant
      fast_food: '13145',       // Fast Food Restaurant
      cafe: '13032',            // Café
      bar: '13003',             // Bar
      food_court: '13049',      // Food Court
      street_food: '13064',     // Street Food Gathering
      hotel: '19014',           // Hotel
      hostel: '19013',          // Hostel
      apartment: '19051',       // Serviced Apartment
      guest_house: '19015',     // Bed & Breakfast
      tourist_attraction: '16000', // Tourist Attraction
      museum: '10027',          // Museum
      temple: '12096',          // Buddhist Temple
      historic: '16007',        // Historic Site
      viewpoint: '16020',       // Scenic Lookout
      entertainment: '10000',   // Arts & Entertainment
      cinema: '10024',          // Movie Theater
      karaoke: '10019',         // Karaoke
      mall: '17114',            // Shopping Mall
      supermarket: '17069',     // Supermarket
      market: '17114',          // Market
      hospital: '15014',        // Hospital
      pharmacy: '17069'         // Pharmacy
    };

    return typeMapping[type] || '13065'; // Default to restaurant if type not found
  }

  private static transformToPlace(venue: FoursquareVenue, defaultType?: PlaceType): Place {
    const latitude = venue.geocodes?.main?.latitude || venue.location?.latitude;
    const longitude = venue.geocodes?.main?.longitude || venue.location?.longitude;
    
    // Get the primary category name as the place type
    const categoryName = venue.categories && venue.categories.length > 0 
      ? venue.categories[0].name 
      : defaultType || 'restaurant';
    
    // Build photo URL if available
    let photo = undefined;
    if (venue.photos && venue.photos.length > 0) {
      photo = {
        images: {
          large: {
            url: `${venue.photos[0].prefix}original${venue.photos[0].suffix}`
          }
        }
      };
    }

    return {
      id: venue.fsq_id,
      name: venue.name,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      rating: venue.rating ? venue.rating.toString() : '0',
      type: defaultType || this.getPlaceTypeFromCategory(venue.categories),
      photo: photo,
      details: {
        cuisine: venue.categories?.slice(1).map(c => c.name).join(', '),
        openingHours: venue.hours?.display,
        phone: venue.tel,
        website: venue.website,
        description: venue.description,
        address: venue.location?.formatted_address || this.formatAddress(venue.location),
        price_level: venue.price ? '$'.repeat(venue.price) : undefined,
        // Additional details
        outdoor_seating: venue.features?.amenities?.outdoor_seating ? 'yes' : undefined,
        takeaway: venue.features?.services?.takeout ? 'yes' : undefined,
        delivery: venue.features?.services?.delivery ? 'yes' : undefined,
        smoking: venue.features?.amenities?.smoking ? 'yes' : undefined,
        internet_access: venue.features?.amenities?.wifi ? 'yes' : undefined
      }
    };
  }

  private static formatAddress(location: FoursquareVenue['location']): string | undefined {
    if (!location) return undefined;
    
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.address_extended) parts.push(location.address_extended);
    if (location.locality) parts.push(location.locality);
    if (location.region) parts.push(location.region);
    if (location.postcode) parts.push(location.postcode);
    if (location.country) parts.push(location.country);
    
    return parts.join(', ');
  }

  private static getPlaceTypeFromCategory(categories?: FoursquareVenue['categories']): PlaceType {
    if (!categories || categories.length === 0) return 'restaurant';
    
    // Map Foursquare category to our PlaceType
    const primaryCategory = categories[0];
    
    // This is a simplified mapping logic - extend as needed
    if (primaryCategory.name.toLowerCase().includes('restaurant')) return 'restaurant';
    if (primaryCategory.name.toLowerCase().includes('cafe')) return 'cafe';
    if (primaryCategory.name.toLowerCase().includes('bar')) return 'bar';
    if (primaryCategory.name.toLowerCase().includes('hotel')) return 'hotel';
    if (primaryCategory.name.toLowerCase().includes('museum')) return 'museum';
    if (primaryCategory.name.toLowerCase().includes('temple')) return 'temple';
    if (primaryCategory.name.toLowerCase().includes('cinema')) return 'cinema';
    if (primaryCategory.name.toLowerCase().includes('mall')) return 'mall';
    if (primaryCategory.name.toLowerCase().includes('hospital')) return 'hospital';
    
    // Default
    return 'tourist_attraction';
  }
}