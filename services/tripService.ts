// lib/services/tripService.ts
import { 
  Trip, 
  TripDetail, 
  Day, 
  CreateTripRequest, 
  CreateTripResponse, 
  GetTripsParams 
} from '@/types/trip';

export class TripService {
  private static baseUrl = '/api/trips';

  // Lấy danh sách trips
  static async getTrips(params?: GetTripsParams): Promise<Trip[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.userId) searchParams.append('userId', params.userId);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);

      const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);

      // console.error('Response status:', response.status);
      // console.error('Response headers:', [...response.headers.entries()]);

      const responseBody = await response.text();
      // console.error('Raw response body:', responseBody);

      // Sau đó bạn có thể parse nó thành JSON nếu chắc chắn đó là JSON
      const data = JSON.parse(responseBody);
      return data;

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
  static async createTrip(tripData: CreateTripRequest): Promise<CreateTripResponse> {
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