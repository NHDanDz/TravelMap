// lib/services/tripService.ts

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

export interface TripDetail extends Trip {
  days: Day[];
}

export class TripService {
  private static baseUrl = '/api/trips';

  // Lấy danh sách trips
  static async getTrips(params?: {
    userId?: string;
    status?: string;
    search?: string;
  }): Promise<Trip[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.userId) searchParams.append('userId', params.userId);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);

      const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  }

  // Lấy chi tiết trip
  static async getTripById(tripId: string): Promise<TripDetail> {
    try {
      const response = await fetch(`${this.baseUrl}/${tripId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Trip not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching trip:', error);
      throw error;
    }
  }

  // Tạo trip mới
  static async createTrip(tripData: {
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    description?: string;
    userId: string;
    status?: string;
    days?: Day[];
  }): Promise<{ id: string; trip?: any }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { 
        id: result.tripId || result.trip?.id,
        trip: result.trip 
      };
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }

  // Cập nhật trip
  static async updateTrip(tripId: string, tripData: Partial<TripDetail>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  }

  // Xóa trip
  static async deleteTrip(tripId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${tripId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }

  // Lưu trip data (cho AI generation)
  static async saveTripData(tripId: string, data: { days: Day[] }): Promise<void> {
    try {
      await this.updateTrip(tripId, { days: data.days });
    } catch (error) {
      console.error('Error saving trip data:', error);
      throw error;
    }
  }

  // Load trip data (cho AI generation)
  static async loadTripData(tripId: string): Promise<{ days: Day[] } | null> {
    try {
      const trip = await this.getTripById(tripId);
      return { days: trip.days };
    } catch (error) {
      console.error('Error loading trip data:', error);
      return null;
    }
  }
}