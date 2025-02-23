// types/map.ts
export interface Place {
    id?: string;
    name: string;
    latitude: string;
    longitude: string;
    rating: string;
    type: PlaceType;
    source?: 'osm' | 'tripadvisor' | 'merged';
    photo?: {
      images: {
        large: {
          url: string;
        };
      };
    };
    details?: PlaceDetails;
    tripAdvisor?: {
      location_id: string;
      ranking?: string;
      price_level?: string;
      num_reviews?: number;
      rating_image_url?: string;
      awards?: Award[];
      reviews?: Review[];
    };
  }
  
  export interface PlaceDetails {
    // Existing fields
    cuisine?: string;
    openingHours?: string;
    phone?: string;
    website?: string;
    description?: string;
    address?: string;
    price_level?: string;
    rating_count?: number;
  
    // New TripAdvisor specific fields
    ranking?: string;
    dietary_restrictions?: string[];
    features?: string[];
    price_range?: string;
    meals?: string[];
    languages_spoken?: string[];
    neighborhood_info?: string;
    awards?: Award[];
    reviews?: Review[];
  }
  
  export interface Award {
    year: string;
    name: string;
    images: {
      small: string;
      large: string;
    };
  }
  
  export interface Review {
    id: string;
    rating: number;
    title: string;
    text: string;
    date: string;
    author: {
      name: string;
      avatar?: string;
    };
    language: string;
    trip_type?: string;
    photos?: {
      url: string;
      caption: string;
    }[];
  }
export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  export interface MapBounds {
    ne: Coordinates;
    sw: Coordinates;
  }
    
  export interface WeatherData {
    temp: number;
    humidity: number;
    description: string;
    icon: string;
  }
  
  export type PlaceType =
    | 'restaurant'
    | 'fast_food'
    | 'cafe'
    | 'bar'
    | 'food_court'
    | 'street_food'
    | 'hotel'
    | 'hostel'
    | 'apartment'
    | 'guest_house'
    | 'tourist_attraction'
    | 'museum'
    | 'temple'
    | 'historic'
    | 'viewpoint'
    | 'entertainment'
    | 'cinema'
    | 'karaoke'
    | 'mall'
    | 'supermarket'
    | 'market'
    | 'hospital'
    | 'pharmacy';
  
  export interface MapState {
    center: Coordinates;
    zoom: number;
    bounds: MapBounds | null;
    selectedLocation: Coordinates | null;
    places: Place[];
    selectedPlace: Place | null;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface MapFilters {
    placeType: PlaceType;
    radius: number; // in meters
    minRating: number;
    priceLevel?: string;
    openNow?: boolean;
  }
  
  export interface MapComponentProps {
    places: Place[];
    onLocationSelect?: (lat: number, lng: number) => void;
    filters: MapFilters;
    onFiltersChange: (filters: MapFilters) => void;
    isLoading: boolean;
  }
  
  // Routing interfaces
  export interface RouteInfo {
    distance: string;
    duration: string;
    startLocation: Coordinates;
    endLocation: Coordinates;
    steps: RouteStep[];
  }
  
  export interface RouteStep {
    instruction: string;
    distance: string;
    duration: string;
  }