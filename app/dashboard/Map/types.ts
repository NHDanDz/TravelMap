// app/dashboard/Map/types.ts
export interface Place {
  id?: string;
  name: string;
  latitude: string;
  longitude: string;
  rating: string;
  type: PlaceType;
  source?: 'osm' | 'tripadvisor' | 'mapbox' | 'foursquare' | 'merged';
  
  // Main photo
  photo?: {
    images: {
      large: { url: string; width?: number; height?: number; };
      medium?: { url: string; width?: number; height?: number; };
      small?: { url: string; width?: number; height?: number; };
      original?: { url: string; width?: number; height?: number; };
    };
    caption?: string;
    author?: string;
    date?: string;
  };
  
  // Additional photos
  photos?: PlacePhoto[];
  
  // Basic details
  details?: PlaceDetails;
  
  // Additional TripAdvisor specific fields
  address_obj?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalcode?: string;
    address_string?: string;
  };
  
  web_url?: string;
  write_review?: string;
  num_reviews?: string;
  
  // Opening hours
  hours?: {
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekday_text: string[];
    open_now?: boolean;
  };
  
  // Features and amenities
  features?: string[];
  
  // Cuisine information
  cuisine?: Array<{
    name: string;
    localized_name?: string;
  }>;
  
  // Ranking data
  ranking_data?: {
    geo_location_id?: string;
    ranking_string?: string;
    geo_location_name?: string;
    ranking_out_of?: string;
    ranking?: string;
  };
  
  // Awards
  awards?: Award[];
  
  // Reviews
  reviews?: Review[];
  
  // Contact info
  email?: string;
  phone?: string;
  website?: string;
  timezone?: string;
  
  // Pricing
  price_level?: string;
  
  // Additional metadata
  see_all_photos?: string;
  distance?: string;
  bearing?: string;
}

export interface PlacePhoto {
  id: string;
  url?: string;
  caption?: string;
  images?: {
    small?: { url: string; width?: number; height?: number; };
    medium?: { url: string; width?: number; height?: number; };
    large?: { url: string; width?: number; height?: number; };
    original?: { url: string; width?: number; height?: number; };
  };
  source?: {
    name?: string;
    localized_name?: string;
  };
  user?: {
    user_id?: string;
    type?: string;
    username?: string;
  };
  is_professional?: boolean;
  created_at?: string;
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
  
  // Category specific details
  cuisine?: string;
  hotel_class?: string;
  room_types?: string[];
  
  // Features and amenities (detailed)
  features?: string[];
  outdoor_seating?: string;
  takeaway?: string;
  delivery?: string;
  smoking?: string;
  internet_access?: string;
  air_conditioning?: string;
  wheelchair?: string;
  parking?: string;
  reservations?: string;
  credit_cards?: string;
  
  // Location context
  neighborhood?: string;
  nearby_transit?: string;
  
  // Business hours
  business_hours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  
  // Pricing info
  price_range?: string;
  average_cost?: number;
  currency?: string;
  
  // Additional metadata
  established?: string;
  capacity?: number;
  languages_spoken?: string[];
  dress_code?: string;
  atmosphere?: string[];
}

export interface Award {
  year: string;
  name: string;
  display_name?: string;
  images?: {
    small?: string;
    large?: string;
  };
  category?: string;
}

export interface Review {
  id: string;
  lang?: string;
  location_id?: string;
  published_date: string;
  rating: number;
  helpful_votes?: string;
  rating_image_url?: string;
  url?: string;
  trip_type?: string;
  travel_date?: string;
  text: string;
  title?: string;
  user: {
    user_id?: string;
    name?: string;
    username: string;
    avatar?: {
      small?: { url: string; };
      large?: { url: string; };
    };
  };
  owner_response?: {
    id: string;
    title: string;
    message: string;
    published_date: string;
  };
  photos?: {
    url: string;
    caption?: string;
  }[];
  language?: string;
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
  wind_speed?: number;
  visibility?: number;
  pressure?: number;
}

export type PlaceType =
  // Dining & Food
  | 'restaurant'
  | 'fast_food'
  | 'cafe'
  | 'bar'
  | 'food_court'
  | 'street_food'
  | 'bakery'
  | 'ice_cream'
  
  // Accommodation
  | 'hotel'
  | 'hostel'
  | 'apartment'
  | 'guest_house'
  | 'resort'
  | 'motel'
  
  // Tourism & Culture
  | 'tourist_attraction'
  | 'museum'
  | 'temple'
  | 'historic'
  | 'viewpoint'
  | 'park'
  | 'beach'
  | 'nature'
  | 'monument'
  | 'castle'
  | 'church'
  
  // Entertainment & Recreation
  | 'entertainment'
  | 'cinema'
  | 'karaoke'
  | 'nightclub'
  | 'casino'
  | 'bowling'
  | 'arcade'
  | 'sports_center'
  | 'spa'
  | 'gym'
  
  // Shopping
  | 'mall'
  | 'supermarket'
  | 'market'
  | 'department_store'
  | 'boutique'
  | 'souvenir_shop'
  | 'bookstore'
  | 'electronics'
  
  // Transportation
  | 'airport'
  | 'train_station'
  | 'bus_station'
  | 'metro_station'
  | 'taxi_stand'
  | 'car_rental'
  | 'gas_station'
  | 'parking'
  
  // Healthcare & Services
  | 'hospital'
  | 'pharmacy'
  | 'clinic'
  | 'dentist'
  | 'bank'
  | 'atm'
  | 'post_office'
  | 'police'
  | 'embassy'
  
  // Education & Business
  | 'school'
  | 'university'
  | 'library'
  | 'conference_center'
  | 'business_center';

export interface MapState {
  center: Coordinates;
  zoom: number;
  bounds: MapBounds | null;
  selectedLocation: Coordinates | null;
  places: Place[];
  selectedPlace: Place | null;
  isLoading: boolean;
  error: string | null;
  searchResults: Place[];
  nearbyPlaces: Place[];
  savedPlaces: Place[];
  routeData: any;
  directions: DirectionsResult | null;
}

export interface MapFilters {
  placeType: PlaceType;
  radius: number; // in meters
  minRating: number;
  priceLevel?: string[];
  openNow?: boolean;
  features?: string[];
  sortBy?: 'distance' | 'rating' | 'price' | 'popularity';
  category?: string;
}

export interface SearchOptions {
  query: string;
  location?: Coordinates;
  radius?: number;
  limit?: number;
  language?: string;
  country?: string;
}

export interface MapComponentProps {
  places: Place[];
  onLocationSelect?: (lat: number, lng: number) => void;
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  isLoading: boolean;
  initialLocation?: [number, number];
  onPlaceSelect?: (place: Place) => void;
  showControls?: boolean;
}

// Routing interfaces
export interface RouteInfo {
  distance: string;
  duration: string;
  startLocation: Coordinates;
  endLocation: Coordinates;
  steps: RouteStep[];
  mode: 'driving' | 'walking' | 'cycling';
  bounds?: [[number, number], [number, number]];
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  geometry?: any;
  maneuver?: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

export interface DirectionsResult {
  routes: RouteInfo[];
  waypoints?: {
    location: [number, number];
    name: string;
  }[];
}

// Navigation interfaces
export interface NavigationState {
  isNavigating: boolean;
  currentStep: number;
  remainingDistance: number;
  remainingTime: number;
  nextInstruction?: string;
  currentLocation?: Coordinates;
  route?: RouteInfo;
}

// Search suggestion interface
export interface SearchSuggestion {
  id: string;
  name: string;
  description: string;
  location: Coordinates;
  type: PlaceType;
  category?: string;
  distance?: string;
  rating?: number;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface PlaceSearchResponse extends ApiResponse<Place[]> {
  suggestions?: SearchSuggestion[];
}

// Event interfaces
export interface MapEvent {
  type: string;
  target: any;
  originalEvent?: Event;
}

export interface PlaceSelectEvent extends MapEvent {
  place: Place;
  coordinates: Coordinates;
}

export interface LocationChangeEvent extends MapEvent {
  coordinates: Coordinates;
  zoom: number;
  bounds: MapBounds;
}

// Configuration interfaces
export interface MapConfig {
  mapboxToken: string;
  defaultLocation: Coordinates;
  defaultZoom: number;
  mapStyle: string;
  enableGeolocation: boolean;
  enableSearch: boolean;
  enableDirections: boolean;
  enableSaveFeature: boolean;
  maxSearchResults: number;
  searchRadius: number;
  supportedLanguages: string[];
}

// Style and theme interfaces
export interface MapTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface ComponentStyles {
  container: string;
  panel: string;
  button: string;
  input: string;
  card: string;
  marker: string;
  popup: string;
}