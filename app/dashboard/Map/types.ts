// app/dashboard/Map/types.ts
export interface Place {
  id?: string;
  name: string;
  latitude: string;
  longitude: string;
  rating: string;
  type: PlaceType;
  photo?: {
    images: {
      large: {
        url: string;
      };
      medium?: {
        url: string;
      };
      small?: {
        url: string;
      };
    };
    caption?: string;
    author?: string;
    date?: string;
  };
  details?: PlaceDetails;
}

export interface PlaceDetails {
  // Basic information
  description?: string;
  address?: string;
  price_level?: string;
  rating_count?: number;
  
  // Contact information
  phone?: string;
  website?: string;
  email?: string;
  
  // Opening hours
  openingHours?: string;
  
  // Specific details by category
  cuisine?: string;              // For restaurants and cafes
  hotel_class?: string;          // For hotels
  room_types?: string[];         // For hotels
  
  // Features and amenities
  features?: string[];
  
  // Accessibility
  wheelchair?: string;           // Wheelchair accessibility
  
  // Services
  internet_access?: string;      // WiFi/Internet
  outdoor_seating?: string;      // Outdoor seating
  takeaway?: string;             // Takeout available
  delivery?: string;             // Delivery service
  
  // Comfort
  smoking?: string;              // Smoking area
  air_conditioning?: string;     // Air conditioning
  
  // Location
  neighborhood?: string;         // Area/neighborhood
  nearby_transit?: string;       // Nearby public transportation
  
  // Reviews and ratings
  reviews?: Review[];
  
  // Photos
  additional_photos?: Photo[];
}

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  title?: string;
  content: string;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  author?: string;
  date?: string;
}

// Place types - more organized by category
export type PlaceType =
  // Dining
  | 'restaurant'
  | 'fast_food'
  | 'cafe'
  | 'bar'
  | 'food_court'
  | 'street_food'
  
  // Accommodation
  | 'hotel'
  | 'hostel'
  | 'apartment'
  | 'guest_house'
  
  // Tourism & Culture
  | 'tourist_attraction'
  | 'museum'
  | 'temple'
  | 'historic'
  | 'viewpoint'
  
  // Entertainment
  | 'entertainment'
  | 'cinema'
  | 'karaoke'
  
  // Shopping
  | 'mall'
  | 'supermarket'
  | 'market'
  
  // Healthcare
  | 'hospital'
  | 'pharmacy';

// Additional interfaces for the map components
export interface MapFilters {
  placeType: PlaceType;
  radius: number; // in meters
  minRating?: number;
  priceLevel?: string[];
  openNow?: boolean;
  features?: string[];
}

export interface MapState {
  center: [number, number];
  zoom: number;
  selectedLocation: [number, number] | null;
  places: Place[];
  selectedPlace: Place | null;
  isLoading: boolean;
  error: string | null;
}