// app/trip-planner/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Plus, Search, Clock, MapPin, ChevronRight, 
  MoreHorizontal, Trash2, Edit, Share, 
  Sparkles, Loader2, Globe, Users, DollarSign, Tag
} from 'lucide-react';
import { TripService } from '@/services/tripService';
import { AuthService } from '@/lib/auth';
import { Trip, Day, Place } from '@/types/trip';
import SharedLayout from '@/app/components/layout/SharedLayout';

// Service imports
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8089';

// Cấu trúc JSON chuẩn
const STANDARD_REQUEST_FORMAT = {
  destination: "string",
  startDate: "YYYY-MM-DD",
  endDate: "YYYY-MM-DD", 
  duration: "number",
  preferences: "string",
  tags: ["array"],
  budget: "number",
  travelers: "number",
  language: "vi"
};

const EXPECTED_RESPONSE_FORMAT = {
  tripName: "string",
  destination: "string",
  duration: "number", 
  estimatedBudget: "number",
  itinerary: [
    {
      day: "number",
      date: "YYYY-MM-DD",
      theme: "string",
      activities: [
        {
          name: "string",
          time: "string",
          duration: "number",
          location: {
            name: "string", 
            address: "string",
            coordinates: {
              latitude: "number",
              longitude: "number"
            }
          },
          type: "string",
          description: "string", 
          estimatedCost: "number",
          rating: "number",
          notes: "string"
        }
      ]
    }
  ]
};
  
interface TripRequest {
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  preferences: string;
  tags: string[];
  budget?: number;
  travelers: number;
  language: string;
}

interface ActivityResponse {
  name: string;
  time: string;
  duration?: number;
  location: {
    name: string;
    address?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  type?: string;
  description?: string;
  estimatedCost?: number;
  rating?: number;
  notes?: string;
}

interface DayResponse {
  day: number;
  date?: string;
  theme?: string;
  activities: ActivityResponse[];
}

interface TripResponse {
  tripName: string;
  destination: string;
  duration: number;
  estimatedBudget?: number;
  itinerary: DayResponse[];
}

// AI Service với cấu trúc chuẩn hóa
class TravelAIService {
  // Tạo session mới
  static async createNewSession(): Promise<string> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat/_new_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const data = await response.json();
      return data.data.session_id;
    } catch (error) {
      console.error('Error creating new session:', error);
      throw error;
    }
  }

  // Tạo lịch trình với cấu trúc chuẩn
  static async generateItinerary(requestData: TripRequest): Promise<TripResponse> {
    try {
      const sessionId = await this.createNewSession();
      console.log('Created session:', sessionId);

      // Tạo prompt chuẩn hóa
      const prompt = this.buildStandardPrompt(requestData);
      
      console.log('Sending standardized request:', requestData);
      
      const response = await fetch(`${BACKEND_URL}/api/v1/chat/_chat_complete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          content: prompt,
          metadata: {
            requestType: "trip_planning",
            expectedFormat: "structured_json",
            ...requestData
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to generate itinerary: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
      
      return this.parseAndValidateResponse(data.data.response, requestData);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw error;
    }
  }

  // Xây dựng prompt chuẩn
  // Cập nhật buildStandardPrompt trong TravelAIService
private static buildStandardPrompt(request: TripRequest): string {
  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);

  return `Tạo lịch trình du lịch ${request.destination} ${request.duration} ngày.
THÔNG TIN CHUYẾN ĐI:

Điểm đến: ${request.destination}
Ngày bắt đầu: ${request.startDate}
Ngày kết thúc: ${request.endDate}
Số ngày: ${request.duration}
Số người: ${request.travelers}
Ngân sách: ${request.budget ? this.formatCurrency(request.budget) : 'Không giới hạn'}
Sở thích: ${request.preferences || 'Không có yêu cầu đặc biệt'}
Thể loại: ${request.tags.length > 0 ? request.tags.join(', ') : 'Chung'}
YÊU CẦU ĐỊNH DẠNG JSON CHUẨN DATABASE:
{
"tripName": "tên chuyến đi phù hợp",
"destination": "${request.destination}",
"duration": ${request.duration},
"estimatedBudget": tổng ngân sách dự kiến (VND),
"itinerary": [
{
"day": 1,
"date": "${this.formatDate(startDate, 0)}",
"theme": "chủ đề của ngày",
"activities": [
{
"name": "tên hoạt động cụ thể",
"time": "${this.formatDate(startDate, 0)}T09:00:00+07:00",
"duration": 120,
"location": {
"name": "tên địa điểm chính xác",
"address": "địa chỉ đầy đủ",
"coordinates": {
"latitude": 21.0285,
"longitude": 105.8542
}
},
"type": "restaurant|tourist_attraction|cafe|hotel|shopping",
"description": "mô tả chi tiết hoạt động",
"estimatedCost": chi phí dự kiến (VND),
"rating": 4.5,
"notes": "lưu ý thêm"
}
]
}
]
}

QUAN TRỌNG - ĐỊNH DẠNG DỮ LIỆU:

time: Sử dụng định dạng ISO-8601 DateTime, kết hợp ngày (date) của ngày đó với thời gian cụ thể (ví dụ: "${this.formatDate(startDate, 0)}T09:00:00+07:00")
KHÔNG dùng "Morning", "Afternoon", "Evening" hoặc định dạng "HH:MM"
Thời gian từ 06:00 đến 22:00, sử dụng múi giờ +07:00 (Việt Nam)
coordinates: Sử dụng tọa độ thực của ${request.destination}
latitude: số thập phân (ví dụ: 21.0285)
longitude: số thập phân (ví dụ: 105.8542)
type: CHỈ sử dụng các giá trị sau:
"tourist_attraction" (cho điểm tham quan)
"restaurant" (cho nhà hàng, quán ăn)
"cafe" (cho quán cà phê)
"hotel" (cho khách sạn, nơi ở)
"shopping" (cho mua sắm)
duration: Thời gian tính bằng phút (số nguyên)
Tham quan: 60-180 phút
Ăn uống: 60-90 phút
Mua sắm: 90-120 phút
rating: Số thập phân từ 1.0 đến 5.0
estimatedCost: Số nguyên (VND), không có dấu phẩy
address: Địa chỉ đầy đủ, cụ thể tại ${request.destination}
VÍ DỤ THỜI GIAN HỢP LÝ (ĐỊNH DẠNG ISO-8601):

"${this.formatDate(startDate, 0)}T08:00:00+07:00": Ăn sáng
"${this.formatDate(startDate, 0)}T09:30:00+07:00": Tham quan điểm đầu tiên
"${this.formatDate(startDate, 0)}T12:00:00+07:00": Ăn trưa
"${this.formatDate(startDate, 0)}T14:00:00+07:00": Tham quan chiều
"${this.formatDate(startDate, 0)}T17:30:00+07:00": Nghỉ ngơi/cafe
"${this.formatDate(startDate, 0)}T19:00:00+07:00": Ăn tối
"${this.formatDate(startDate, 0)}T21:00:00+07:00": Vui chơi tối
CHỈ trả về JSON hợp lệ, không có markdown, không có text thừa.`;
}
  // Xử lý và validate response
  private static parseAndValidateResponse(responseText: string, originalRequest: TripRequest): TripResponse {
    try {
      // Làm sạch response
      let jsonString = responseText.trim();
      
      // Loại bỏ các định dạng markdown
      const patterns = [
        /```json\s*\n?([\s\S]*?)\n?```/i,
        /```\s*\n?([\s\S]*?)\n?```/i,
        /`([\s\S]*?)`/,
        /^[^{]*({[\s\S]*})[^}]*$/
      ];
      
      for (const pattern of patterns) {
        const match = jsonString.match(pattern);
        if (match && match[1]) {
          jsonString = match[1].trim();
          break;
        }
      }

      // Parse JSON
      const parsed = JSON.parse(jsonString);
      
      // Validate cấu trúc
      const validated = this.validateAndFixStructure(parsed, originalRequest);
      
      console.log('Validated response:', validated);
      return validated;
      
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Raw response:', responseText);
      
      // Fallback structure
      return this.createFallbackResponse(originalRequest);
    }
  }

  // Validate và sửa cấu trúc
  private static validateAndFixStructure(data: any, request: TripRequest): TripResponse {
    const result: TripResponse = {
      tripName: data.tripName || `Khám phá ${request.destination}`,
      destination: data.destination || request.destination,
      duration: data.duration || request.duration,
      estimatedBudget: data.estimatedBudget || undefined,
      itinerary: []
    };

    // Validate itinerary
    if (data.itinerary && Array.isArray(data.itinerary)) {
      const startDate = new Date(request.startDate);
      
      data.itinerary.forEach((day: any, index: number) => {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + index);
        
        const dayData: DayResponse = {
          day: day.day || index + 1,
          date: day.date || dayDate.toISOString().split('T')[0],
          theme: day.theme || `Ngày ${index + 1}`,
          activities: []
        };

        // Validate activities
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach((activity: any) => {
            if (activity.name && activity.location) {
              const validatedActivity: ActivityResponse = {
                name: activity.name,
                time: activity.time || "09:00",
                duration: activity.duration || 60,
                location: {
                  name: activity.location.name || "Địa điểm",
                  address: activity.location.address || activity.location.name || "",
                  coordinates: {
                    latitude: activity.location.coordinates?.latitude || 0,
                    longitude: activity.location.coordinates?.longitude || 0
                  }
                },
                type: activity.type || "tourist_attraction",
                description: activity.description || "",
                estimatedCost: activity.estimatedCost || 0,
                rating: activity.rating || 4,
                notes: activity.notes || ""
              };
              
              dayData.activities.push(validatedActivity);
            }
          });
        }

        result.itinerary.push(dayData);
      });
    }

    // Đảm bảo có ít nhất 1 ngày
    if (result.itinerary.length === 0) {
      const startDate = new Date(request.startDate);
      for (let i = 0; i < request.duration; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + i);
        
        result.itinerary.push({
          day: i + 1,
          date: dayDate.toISOString().split('T')[0],
          theme: `Khám phá ${request.destination}`,
          activities: []
        });
      }
    }

    return result;
  }

  // Tạo fallback response
  private static createFallbackResponse(request: TripRequest): TripResponse {
    const startDate = new Date(request.startDate);
    const itinerary: DayResponse[] = [];

    for (let i = 0; i < request.duration; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);
      
      itinerary.push({
        day: i + 1,
        date: dayDate.toISOString().split('T')[0],
        theme: `Ngày ${i + 1} - Khám phá ${request.destination}`,
        activities: [{
          name: `Khám phá ${request.destination}`,
          time: "09:00",
          duration: 480, // 8 tiếng
          location: {
            name: request.destination,
            address: request.destination,
            coordinates: { latitude: 0, longitude: 0 }
          },
          type: "tourist_attraction",
          description: "Tự do khám phá địa điểm địa phương",
          estimatedCost: 500000,
          rating: 4,
          notes: "Lịch trình sẽ được cập nhật chi tiết sau"
        }]
      });
    }

    return {
      tripName: `Khám phá ${request.destination}`,
      destination: request.destination,
      duration: request.duration,
      estimatedBudget: request.budget,
      itinerary
    };
  }

  // Convert về format cũ để tương thích
  // Cập nhật convertToTripFormat trong TravelAIService

static convertToTripFormat(tripResponse: TripResponse, startDate: string): { places: Place[], days: Day[] } {
  const places: Place[] = [];
  const days: Day[] = [];

  tripResponse.itinerary.forEach((dayData, index) => {
    const dayPlaces: Place[] = [];
    const dayDate = dayData.date || this.formatDate(new Date(startDate), index);

    dayData.activities.forEach((activity, activityIndex) => {
      // Phân tích thời gian
      let startTime = activity.time;
      let endTime: string | undefined;

      // Chuẩn hóa định dạng thời gian nếu cần
      if (startTime && !startTime.match(/^\d{2}:\d{2}$/)) {
        startTime = this.normalizeTimeFormat(startTime);
      }

      // Chuyển đổi sang định dạng ISO-8601 DateTime
      let startDateTime: string | undefined;
      if (startTime) {
        startDateTime = `${dayDate}T${startTime}:00Z`; // Kết hợp ngày và giờ
      }

      // Tính toán thời gian kết thúc nếu có thời lượng
      if (startTime && activity.duration) {
        endTime = this.calculateEndTime(startTime, activity.duration);
        if (endTime) {
          endTime = `${dayDate}T${endTime}:00Z`; // Kết hợp ngày và giờ
        }
      }

      const place: Place = {
        id: `place_${dayData.day}_${activityIndex}_${Date.now()}`,
        name: activity.name,
        type: this.validatePlaceType(activity.type),
        address: activity.location.address || activity.location.name,
        latitude: activity.location.coordinates.latitude.toString(),
        longitude: activity.location.coordinates.longitude.toString(),
        image: this.getDefaultImage(activity.type),
        startTime: startDateTime, // Định dạng ISO-8601
        endTime: endTime, // Định dạng ISO-8601
        duration: activity.duration,
        rating: activity.rating,
        notes: activity.description || activity.notes,
        openingHours: this.getDefaultOpeningHours(activity.type)
      };

      dayPlaces.push(place);
      places.push(place);
    });

    days.push({
      dayNumber: dayData.day,
      date: dayDate,
      places: dayPlaces
    });
  });

  return { places, days };
}
// Helper methods
private static normalizeTimeFormat(timeStr: string): string {
  const lowerTime = timeStr.toLowerCase();
  
  if (lowerTime.includes('morning') || lowerTime.includes('sáng')) {
    return '09:00';
  } else if (lowerTime.includes('afternoon') || lowerTime.includes('chiều')) {
    return '14:00';
  } else if (lowerTime.includes('evening') || lowerTime.includes('tối')) {
    return '18:00';
  }
  
  // Try to extract HH:MM pattern
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
  
  return '09:00'; // Default fallback
}

private static calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + durationMinutes;
  
  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}

private static validatePlaceType(type?: string): string {
  const validTypes = ['tourist_attraction', 'restaurant', 'cafe', 'hotel', 'shopping'];
  return validTypes.includes(type || '') ? type! : 'tourist_attraction';
}

private static getDefaultImage(type?: string): string {
  const imageMap: Record<string, string> = {
    'tourist_attraction': '/images/place-default.jpg',
    'restaurant': '/images/restaurant-default.jpg',
    'cafe': '/images/cafe-default.jpg',
    'hotel': '/images/hotel-default.jpg',
    'shopping': '/images/shopping-default.jpg'
  };
  
  return imageMap[type || 'tourist_attraction'] || '/images/place-default.jpg';
}

private static getDefaultOpeningHours(type?: string): string {
  const hoursMap: Record<string, string> = {
    'tourist_attraction': '8:00 - 17:00',
    'restaurant': '11:00 - 22:00',
    'cafe': '7:00 - 22:00',
    'hotel': '24/7',
    'shopping': '9:00 - 21:00'
  };
  
  return hoursMap[type || 'tourist_attraction'] || '9:00 - 17:00';
}

  // Helper methods
  private static formatDate(date: Date, addDays: number = 0): string {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + addDays);
    return newDate.toISOString().split('T')[0];
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
}

// Sample data
const sampleTrips: Trip[] = [
  {
    id: 'trip1',
    name: 'Khám phá Hà Nội',
    destination: 'Hà Nội',
    startDate: '2025-04-20',
    endDate: '2025-04-23',
    coverImage: '/images/ha-noi.jpg',
    numDays: 4,
    placesCount: 12,
    status: 'planned',
    description: 'Khám phá các địa điểm nổi tiếng và ẩm thực đặc sắc của thủ đô nghìn năm văn hiến.',
    createdBy: 'manual',
    tags: ['Văn hóa', 'Ẩm thực', 'Lịch sử'],
    estimatedBudget: 5000000,
    travelCompanions: 2
  },
  {
    id: 'trip2', 
    name: 'Du lịch Đà Nẵng - Hội An',
    destination: 'Đà Nẵng',
    startDate: '2025-05-10',
    endDate: '2025-05-15',
    coverImage: '/images/da-nang.jpg',
    numDays: 6,
    placesCount: 15,
    status: 'draft',
    description: 'Tham quan các bãi biển đẹp ở Đà Nẵng và khu phố cổ Hội An.',
    createdBy: 'ai',
    tags: ['Biển', 'Nghỉ dưỡng', 'Phố cổ'],
    estimatedBudget: 8000000,
    travelCompanions: 4
  }
];
const generateEmptyDays = (startDate: string, numDays: number): Day[] => {
  const days: Day[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < numDays; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + i);
    
    days.push({
      dayNumber: i + 1,
      date: dayDate.toISOString().split('T')[0],
      places: [] // Empty places array
    });
  }
  
  console.log('Generated empty days:', days);
  return days;
};
// Helper functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'planned':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'draft':
      return 'Bản nháp';
    case 'planned':
      return 'Đã lên kế hoạch';
    case 'completed':
      return 'Đã hoàn thành';
    default:
      return status;
  }
};

const formatBudget = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export default function TripPlannerPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // States for new trip form
  const [newTrip, setNewTrip] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    estimatedBudget: '',
    travelCompanions: '1'
  });
  
  // AI generation states
  const [useAI, setUseAI] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPreferences, setAiPreferences] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Available tags
  const availableTags = [
    'Văn hóa', 'Ẩm thực', 'Lịch sử', 'Biển', 'Núi', 
    'Nghỉ dưỡng', 'Phiêu lưu', 'Gia đình', 'Lãng mạn', 
    'Phố cổ', 'Thiên nhiên', 'Mua sắm'
  ];
  
  // Load trips on mount
useEffect(() => {
  const loadTrips = async () => {
    try { 
     // Lấy userId từ AuthService
      const userId = AuthService.getUserId();
      
      // Kiểm tra xác thực
      if (!AuthService.isAuthenticated()) {
        console.warn('User not authenticated, redirecting to login');
        router.push('/auth');
        return;
      }
      if (!userId) {
        throw new Error('User not authenticated');
      }      
      const tripsData = await TripService.getTrips({ userId });
       setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
      setTrips(sampleTrips); // Fallback về sample data
    } finally {
      setLoading(false);
    }
  };
  
  loadTrips();
}, []);
  
  // Save trips to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('user_trips', JSON.stringify(trips));
    }
  }, [trips, loading]);
  
  // Filter trips
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.tags && trip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesStatus = filterStatus ? trip.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle dropdown clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.dropdown-menu')) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);
  
  // Handle delete trip
  const handleDeleteTrip = (id: string) => {
    setTripToDelete(id);
    setIsDeleting(true);
    setActiveDropdown(null);
  };
  
  // Confirm delete
  const confirmDelete = async () => {
    if (tripToDelete) {
      try {
        await TripService.deleteTrip(tripToDelete);
        // Reload trips
      const userId = AuthService.getUserId();
      
      // Kiểm tra xác thực
      if (!AuthService.isAuthenticated()) {
        console.warn('User not authenticated, redirecting to login');
        router.push('/auth');
        return;
      }
        const tripsData = await TripService.getTrips({ userId });
        setTrips(tripsData);
        
        setTripToDelete(null);
        setIsDeleting(false);
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Có lỗi xảy ra khi xóa lịch trình');
      }
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTrip({
      ...newTrip,
      [name]: value
    });
  };
  
  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
 // Handle create trip với cấu trúc chuẩn
const handleCreateTrip = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate required fields
  if (!newTrip.destination || !newTrip.startDate || !newTrip.endDate) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc');
    return;
  }
  
  // Calculate trip duration
  const start = new Date(newTrip.startDate);
  const end = new Date(newTrip.endDate);
  
  if (end < start) {
    alert('Ngày kết thúc phải sau ngày bắt đầu');
    return;
  }
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  // Get current user ID
  const userId = AuthService.getUserId();
  
  if (useAI) {
    // AI-generated trip flow
    setIsGenerating(true);
    try {
      // Build preferences string
      let fullPreferences = aiPreferences;
      if (selectedTags.length > 0) {
        fullPreferences += `. Quan tâm đến: ${selectedTags.join(', ')}`;
      }
      if (newTrip.estimatedBudget) {
        fullPreferences += `. Ngân sách khoảng ${formatBudget(parseInt(newTrip.estimatedBudget))}`;
      }
      if (newTrip.travelCompanions && newTrip.travelCompanions !== '1') {
        fullPreferences += `. Đi ${newTrip.travelCompanions} người`;
      }

      // Prepare AI request
      const tripRequest: TripRequest = {
        destination: newTrip.destination,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        duration: diffDays,
        preferences: fullPreferences,
        tags: selectedTags,
        budget: newTrip.estimatedBudget ? parseInt(newTrip.estimatedBudget) : undefined,
        travelers: parseInt(newTrip.travelCompanions),
        language: 'vi'
      };
        
      // Generate AI itinerary
      const aiResponse = await TravelAIService.generateItinerary(tripRequest);
      console.log('AI response:', aiResponse);
      const { days } = TravelAIService.convertToTripFormat(aiResponse, newTrip.startDate);
      
      // Prepare trip data for database
      const tripData = {
        name: newTrip.name || aiResponse.tripName || `Khám phá ${newTrip.destination}`,
        destination: newTrip.destination,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        description: newTrip.description || `Lịch trình ${diffDays} ngày khám phá ${newTrip.destination} được tạo bởi AI`,
        userId: userId,
        status: 'draft' as const,
        days: days
      };
      
      // Create trip in database
      const result = await TripService.createTrip(tripData);
      
      // Success - navigate to trip detail
      resetForm();
      router.push(`/trip-planner/${result.id}`);
      
    } catch (error) {
      console.error('Error creating AI trip:', error);
      alert('Có lỗi xảy ra khi tạo lịch trình bằng AI. Vui lòng thử lại sau.');
    } finally {
      setIsGenerating(false);
    }
  } else {
    // Manual trip creation flow
    try {
      // ✅ Generate empty days for manual trip
      const emptyDays = generateEmptyDays(newTrip.startDate, diffDays);
      
      const tripData = {
        name: newTrip.name || `Khám phá ${newTrip.destination}`,
        destination: newTrip.destination,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        description: newTrip.description,
        userId: userId,
        status: 'draft' as const,
        days: emptyDays // ✅ Add empty days to manual trip
      };
      
      console.log('Creating manual trip with days:', tripData);
      
      // Create trip in database
      const result = await TripService.createTrip(tripData);
      
      // Success - navigate to trip detail
      resetForm();
      router.push(`/trip-planner/${result.id}?showSuggestions=true`); // ✅ Auto-show suggestions
      
    } catch (error) {
      console.error('Error creating manual trip:', error);
      alert('Có lỗi xảy ra khi tạo lịch trình. Vui lòng thử lại sau.');
    }
  }
};
  
  // Reset form
  const resetForm = () => {
    setNewTrip({
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      description: '',
      estimatedBudget: '',
      travelCompanions: '1'
    });
    setUseAI(false);
    setAiPreferences('');
    setSelectedTags([]);
    setShowCreateModal(false);
  };
  
  return (
      <SharedLayout>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center"> 
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Lịch trình du lịch</h1>
                <p className="text-sm text-gray-600 mt-1">Quản lý và lên kế hoạch cho chuyến đi của bạn</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>Tạo lịch trình mới</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-8">
        {/* Search and filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search input */}
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm lịch trình, điểm đến, tags..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Status filter */}
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterStatus(null)}
              >
                Tất cả ({trips.length})
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterStatus(filterStatus === 'draft' ? null : 'draft')}
              >
                Bản nháp ({trips.filter(t => t.status === 'draft').length})
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'planned' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterStatus(filterStatus === 'planned' ? null : 'planned')}
              >
                Đã lên kế hoạch ({trips.filter(t => t.status === 'planned').length})
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterStatus(filterStatus === 'completed' ? null : 'completed')}
              >
                Đã hoàn thành ({trips.filter(t => t.status === 'completed').length})
              </button>
            </div>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
        
        {/* No trips message */}
        {!loading && filteredTrips.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không có lịch trình nào</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery || filterStatus
                ? 'Không có lịch trình nào phù hợp với điều kiện tìm kiếm của bạn.'
                : 'Bạn chưa tạo lịch trình du lịch nào. Hãy bắt đầu tạo lịch trình đầu tiên của bạn.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Tạo lịch trình mới</span>
            </button>
          </div>
        )}
        
        {/* Trips grid */}
        {!loading && filteredTrips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTrips.map(trip => (
              <div key={trip.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                
                <div className="relative">
                  <div className="relative h-48 w-full">
                     <Image
                      src={trip.city?.imageUrl ?? "/images/default-city.jpg"}
                      alt={trip.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {getStatusText(trip.status)}
                    </div>
                    {trip.createdBy === 'ai' && (
                      <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{trip.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {trip.destination}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Clock className="w-4 h-4 mr-1.5" />
                    <span>{trip.numDays} ngày</span>
                    <span className="mx-2">•</span>
                    <MapPin className="w-4 h-4 mr-1.5" />
                    <span>{trip.placesCount} địa điểm</span>
                  </div>
                  
                  {/* Additional info */}
                  {(trip.estimatedBudget || trip.travelCompanions) && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      {trip.estimatedBudget && (
                        <>
                          <DollarSign className="w-4 h-4 mr-1.5" />
                          <span>{formatBudget(trip.estimatedBudget)}</span>
                        </>
                      )}
                      {trip.estimatedBudget && trip.travelCompanions && trip.travelCompanions > 1 && (
                        <span className="mx-2">•</span>
                      )}
                      {trip.travelCompanions && trip.travelCompanions > 1 && (
                        <>
                          <Users className="w-4 h-4 mr-1.5" />
                          <span>{trip.travelCompanions} người</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{trip.description}</p>
                  )}
                  
                  {/* Tags */}
                  {trip.tags && trip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {trip.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {trip.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{trip.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <Link
                      href={`/trip-planner/${trip.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm group"
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <div className="relative dropdown-menu">
                      <button 
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === trip.id ? null : trip.id);
                        }}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {activeDropdown === trip.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border">
                          <Link
                            href={`/trip-planner/${trip.id}/edit`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            <span>Chỉnh sửa</span>
                          </Link>
                          <Link
                            href={`/trip-planner/${trip.id}/share`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Share className="w-4 h-4 mr-2" />
                            <span>Chia sẻ</span>
                          </Link>
                          <button
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => handleDeleteTrip(trip.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Create trip modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Tạo lịch trình mới</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={resetForm}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateTrip}>
                <div className="space-y-4">
                  {/* AI Toggle */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="font-medium text-gray-800">Tạo lịch trình bằng AI</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useAI}
                          onChange={(e) => setUseAI(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    {useAI && (
                      <p className="text-sm text-gray-600 mt-2">
                        AI sẽ tự động tạo lịch trình chi tiết với các địa điểm, thời gian và đánh giá cho bạn
                      </p>
                    )}
                  </div>
                  
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!useAI && (
                      <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Tên lịch trình
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={newTrip.name}
                          onChange={handleInputChange}
                          placeholder="Ví dụ: Khám phá Hà Nội"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                        Điểm đến <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={newTrip.destination}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Hà Nội, Đà Nẵng, Phú Quốc..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="travelCompanions" className="block text-sm font-medium text-gray-700 mb-1">
                        Số người đi cùng
                      </label>
                      <select
                        id="travelCompanions"
                        name="travelCompanions"
                        value={newTrip.travelCompanions}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">Đi một mình</option>
                        <option value="2">2 người</option>
                        <option value="3">3 người</option>
                        <option value="4">4 người</option>
                        <option value="5">5+ người</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={newTrip.startDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={newTrip.endDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={newTrip.startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="estimatedBudget" className="block text-sm font-medium text-gray-700 mb-1">
                        Ngân sách dự kiến
                      </label>
                      <input
                        type="number"
                        id="estimatedBudget"
                        name="estimatedBudget"
                        value={newTrip.estimatedBudget}
                        onChange={handleInputChange}
                        placeholder="VND"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thể loại chuyến đi
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {useAI ? (
                    <div>
                      <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1">
                        Sở thích & Yêu cầu đặc biệt
                      </label>
                      <textarea
                        id="preferences"
                        value={aiPreferences}
                        onChange={(e) => setAiPreferences(e.target.value)}
                        placeholder="Ví dụ: Thích ẩm thực địa phương, muốn tham quan bảo tàng, tránh leo núi, phù hợp cho trẻ em..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={newTrip.description}
                        onChange={handleInputChange}
                        placeholder="Mô tả ngắn về chuyến đi của bạn"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      disabled={isGenerating}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span>Đang tạo...</span>
                        </>
                      ) : (
                        <>
                          {useAI && <Sparkles className="w-4 h-4 mr-2" />}
                          <span>{useAI ? 'Tạo với AI' : 'Tạo lịch trình'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Xác nhận xóa</h2>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa lịch trình này? Hành động này không thể hoàn tác.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleting(false);
                  setTripToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      
      
    </div>
    </SharedLayout>

  );
}