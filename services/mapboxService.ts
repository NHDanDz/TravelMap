// services/mapboxService.ts
import { Place, PlaceType } from '@/app/dashboard/Map/types';

interface DirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
    legs: Array<{
      steps: Array<{
        distance: number;
        duration: number;
        geometry: {
          coordinates: [number, number][];
          type: string;
        };
        maneuver: {
          location: [number, number];
          instruction: string;
        };
      }>;
    }>;
  }>;
}

export class MapboxService {
  private static accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  private static baseUrl = 'https://api.mapbox.com';

  /**
   * Get directions between two points
   */
  static async getDirections(
    start: [number, number],
    end: [number, number],
    mode: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<DirectionsResponse | null> {
    try {
      const startStr = `${start[1]},${start[0]}`;
      const endStr = `${end[1]},${end[0]}`;
      const url = `${this.baseUrl}/directions/v5/mapbox/${mode}/${startStr};${endStr}`;
      
      const params = new URLSearchParams({
        access_token: this.accessToken,
        geometries: 'geojson',
        overview: 'full',
        steps: 'true',
        language: 'en'
      });

      const response = await fetch(`${url}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching directions:', error);
      return null;
    }
  }

  /**
   * Search for places using Mapbox Geocoding API
   */
  static async searchPlaces(
    query: string,
    proximity?: [number, number],
    types: string[] = ['poi']
  ): Promise<Place[]> {
    try {
      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
      
      const params = new URLSearchParams({
        access_token: this.accessToken,
        types: types.join(','),
        limit: '10',
      });

      if (proximity) {
        params.append('proximity', `${proximity[1]},${proximity[0]}`);
      }

      const response = await fetch(`${url}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform Mapbox features to Place objects
      return data.features.map((feature: any) => {
        const [longitude, latitude] = feature.center;
        
        return {
          id: feature.id,
          name: feature.text,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          rating: '0', // Mapbox doesn't provide ratings
          type: this.mapFeatureToPlaceType(feature),
          details: {
            address: feature.place_name,
            description: feature.properties?.description || ''
          }
        };
      });
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Get place details by Mapbox feature ID
   */
  static async getPlaceDetails(featureId: string): Promise<Place | null> {
    try {
      // This is a simplified example, as Mapbox doesn't have a direct equivalent
      // to Foursquare's venue details API
      const parts = featureId.split('.');
      const id = parts[parts.length - 1];
      
      // For a real implementation, you might need to use a combination of:
      // 1. Mapbox's geocoding API with the ID from the feature
      // 2. A third-party API (like Foursquare, Google Places, etc.)
      
      // Example placeholder implementation
      const place: Place = {
        id: featureId,
        name: "Place Details",
        latitude: "0",
        longitude: "0",
        rating: "0",
        type: "restaurant" as PlaceType,
        details: {
          address: "Please implement actual details fetching",
          description: "This is a placeholder for place details"
        }
      };
      
      return place;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Map Mapbox feature to a PlaceType
   */
  private static mapFeatureToPlaceType(feature: any): PlaceType {
    const category = feature.properties?.category || '';
    const maki = feature.properties?.maki || '';
    
    // Map Mapbox categories to PlaceType
    // This is a simplified mapping, you may need to expand it based on your needs
    if (maki === 'restaurant' || category.includes('restaurant')) {
      return 'restaurant';
    } else if (maki === 'cafe' || category.includes('cafe')) {
      return 'cafe';
    } else if (maki === 'hotel' || category.includes('hotel')) {
      return 'hotel';
    } else if (maki === 'museum' || category.includes('museum')) {
      return 'museum';
    } else if (maki === 'monument' || category.includes('monument')) {
      return 'tourist_attraction';
    } else if (maki === 'hospital' || category.includes('hospital')) {
      return 'hospital';
    } else if (maki === 'pharmacy' || category.includes('pharmacy')) {
      return 'pharmacy';
    } else if (maki === 'cinema' || category.includes('cinema')) {
      return 'cinema';
    } else if (maki === 'shop' || category.includes('shop')) {
      return 'mall';
    }
    
    // Default to tourist_attraction if unknown
    return 'tourist_attraction';
  }
}