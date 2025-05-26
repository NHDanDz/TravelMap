// services/travelAIService.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8089';

interface ChatRequest {
  session_id: string;
  content: string;
}

interface ChatResponse {
  msg: string;
  code: number;
  data: {
    session_id: string;
    response: string;
  };
}

interface TripItinerary {
  trip_name: string;
  destination: string;
  duration: string;
  itinerary: DayItinerary[];
}

interface DayItinerary {
  day: number;
  theme: string;
  description: string;
  morning?: Activity;
  afternoon?: Activity;
  lunch?: Restaurant;
  dinner?: Restaurant;
  evening?: Activity;
  // Add more time slots as needed
}

interface Activity {
  time: string;
  activity: string;
  description: string;
  location: LocationInfo;
  duration: string;
}

interface Restaurant extends Activity {
  cost?: {
    USD: number;
    VND: number;
  };
}

interface LocationInfo {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  google_reviews?: {
    average_rating: number;
    number_of_reviews: number;
    description: string;
  };
}

export class TravelAIService {
  static async createNewSession(): Promise<string> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat/_new_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create new session');
      }

      const data = await response.json();
      return data.data.session_id;
    } catch (error) {
      console.error('Error creating new session:', error);
      throw error;
    }
  }

  static async generateItinerary(
    destination: string,
    days: number,
    preferences?: string
  ): Promise<TripItinerary> {
    try {
      // Create a new session
      const sessionId = await this.createNewSession();

      // Build the prompt
      let prompt = `Tôi muốn đi du lịch ${destination} ${days} ngày, hãy lập lịch trình giúp tôi. `;
      if (preferences) {
        prompt += `${preferences}. `;
      }
      prompt += 'Viết dưới dạng file json và có tọa độ địa điểm và các đánh giá. Đừng trả lời thừa thãi chỉ trả về cho tôi dạng json thôi';

      // Send request to backend
      const request: ChatRequest = {
        session_id: sessionId,
        content: prompt,
      };

      const response = await fetch(`${BACKEND_URL}/api/v1/chat/_chat_complete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const data: ChatResponse = await response.json();
      
      // Parse the JSON response
      const jsonMatch = data.data.response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      } else {
        // Try parsing the whole response as JSON
        return JSON.parse(data.data.response);
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw error;
    }
  }

  static convertToTripFormat(aiItinerary: TripItinerary, startDate: string) {
    const places: any[] = [];
    const days: any[] = [];
    
    // Parse AI itinerary and convert to app format
    aiItinerary.itinerary.forEach((dayData, index) => {
      const dayPlaces: any[] = [];
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + index);
      
      // Process each time slot
      const timeSlots = ['morning', 'lunch', 'afternoon', 'dinner', 'evening'];
      
      timeSlots.forEach((slot) => {
        const activity = (dayData as any)[slot];
        if (activity) {
          const place = {
            id: `place_${index}_${slot}`,
            name: activity.location.name,
            type: slot === 'lunch' || slot === 'dinner' ? 'restaurant' : 'tourist_attraction',
            address: activity.location.name, // You might want to enhance this
            latitude: activity.location.coordinates.latitude.toString(),
            longitude: activity.location.coordinates.longitude.toString(),
            image: '/images/default-place.jpg', // Default image
            startTime: activity.time,
            duration: this.parseDuration(activity.duration),
            rating: activity.location.google_reviews?.average_rating,
            notes: activity.description,
          };
          
          dayPlaces.push(place);
          places.push(place);
        }
      });
      
      days.push({
        dayNumber: dayData.day,
        date: currentDate.toISOString().split('T')[0],
        places: dayPlaces,
      });
    });
    
    return { places, days };
  }
  
  static parseDuration(durationStr: string): number {
    // Convert "2 hours" or "1.5 hours" to minutes
    const match = durationStr.match(/(\d+\.?\d*)\s*hour/i);
    if (match) {
      return Math.round(parseFloat(match[1]) * 60);
    }
    return 60; // Default 1 hour
  }
}