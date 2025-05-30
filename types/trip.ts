// types/trip.ts

export interface City {
  id: number;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: string;
  longitude: string;
  image: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  rating?: number;
  notes?: string;
  openingHours?: string;
}

export interface Day {
  dayNumber: number;
  date: string;
  places: Place[];
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  numDays: number;
  placesCount: number;
  status: 'draft' | 'planned' | 'completed';
  description?: string;
  createdBy?: 'manual' | 'ai';
  tags?: string[];
  estimatedBudget?: number;
  travelCompanions?: number;
  city?: City;
}

export interface TripDetail extends Trip {
  days: Day[];
}

// Additional interfaces for API responses
export interface CreateTripRequest {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  userId: string;
  status?: string;
  days?: Day[];
  cityId?: number;
}

export interface CreateTripResponse {
  id: string;
  trip?: any;
}

export interface GetTripsParams {
  userId?: string;
  status?: string;
  search?: string;
}