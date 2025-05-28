// app/trip-planner/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { 
  Calendar, Clock, MapPin, ChevronLeft, Share, Trash2, Edit, 
  Plus, Download, Printer, ArrowLeft, ArrowRight, MoreHorizontal,
  Save, Compass
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TripService } from '@/services/tripService';

// Type definitions
interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: string;
  longitude: string;
  image: string;
  duration?: number; // thời gian dự kiến ở địa điểm (phút)
  notes?: string;
  openingHours?: string;
  startTime?: string;
  endTime?: string;
}

interface Day {
  dayNumber: number;
  date: string;
  places: Place[];
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  numDays: number;
  days: Day[];
  status: 'draft' | 'planned' | 'completed';
  description?: string;
}

// Dummy place data (to simulate saved places)
const savedPlaces: Place[] = [
  {
    id: 'place1',
    name: 'Hồ Hoàn Kiếm',
    type: 'tourist_attraction',
    address: 'Phố Đinh Tiên Hoàng, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0278',
    longitude: '105.8523',
    image: '/images/place-3.jpg',
    openingHours: '6:00 - 20:00',
    duration: 90
  },
  {
    id: 'place2',
    name: 'Văn Miếu - Quốc Tử Giám',
    type: 'tourist_attraction',
    address: '58 Phố Quốc Tử Giám, Quận Đống Đa, Hà Nội',
    latitude: '21.0274',
    longitude: '105.8354',
    image: '/images/place-1.jpg',
    openingHours: '8:00 - 17:00',
    duration: 120
  },
  {
    id: 'place3',
    name: 'Chùa Trấn Quốc',
    type: 'tourist_attraction',
    address: 'Thanh Niên, Quận Tây Hồ, Hà Nội',
    latitude: '21.0492',
    longitude: '105.8350',
    image: '/images/pagoda-1.jpg',
    openingHours: '7:30 - 18:00',
    duration: 60
  },
  {
    id: 'place4',
    name: 'Nhà hàng Chả Cá Lã Vọng',
    type: 'restaurant',
    address: '14 Chả Cá, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0323',
    longitude: '105.8508',
    image: '/images/restaurant-1.jpg',
    openingHours: '10:00 - 22:00',
    duration: 90
  },
  {
    id: 'place5',
    name: 'Lăng Chủ tịch Hồ Chí Minh',
    type: 'tourist_attraction',
    address: '2 Hùng Vương, Điện Bàn, Ba Đình, Hà Nội',
    latitude: '21.0369',
    longitude: '105.8353',
    image: '/images/place-2.jpg',
    openingHours: '7:30 - 10:30, 14:00 - 16:00',
    duration: 60
  },
  {
    id: 'place6',
    name: 'Phố cổ Hà Nội',
    type: 'tourist_attraction',
    address: 'Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0340',
    longitude: '105.8500',
    image: '/images/place-4.jpg',
    openingHours: '24/7',
    duration: 180
  },
  {
    id: 'place7',
    name: 'Bảo tàng Lịch sử Quốc gia',
    type: 'tourist_attraction',
    address: '1 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0243',
    longitude: '105.8583',
    image: '/images/museum-1.jpg',
    openingHours: '8:00 - 17:00',
    duration: 120
  },
  {
    id: 'place8',
    name: 'Highlands Coffee - Nhà hát Lớn',
    type: 'cafe',
    address: '1 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0244',
    longitude: '105.8573',
    image: '/images/cafe-1.jpg',
    openingHours: '7:00 - 22:00',
    duration: 60
  }
];

// Sample trip data
const sampleTrip: Trip = {
  id: 'trip1',
  name: 'Khám phá Hà Nội',
  destination: 'Hà Nội',
  startDate: '2025-04-20',
  endDate: '2025-04-23',
  coverImage: '/images/ha-noi.jpg',
  numDays: 4,
  status: 'planned',
  description: 'Khám phá các địa điểm nổi tiếng và ẩm thực đặc sắc của thủ đô nghìn năm văn hiến.',
  days: [
    {
      dayNumber: 1,
      date: '2025-04-20',
      places: [savedPlaces[0], savedPlaces[3]]
    },
    {
      dayNumber: 2,
      date: '2025-04-21',
      places: [savedPlaces[1], savedPlaces[7]]
    },
    {
      dayNumber: 3,
      date: '2025-04-22',
      places: [savedPlaces[4], savedPlaces[2]]
    },
    {
      dayNumber: 4,
      date: '2025-04-23',
      places: [savedPlaces[5]]
    }
  ]
};

// Format date function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Format time helper
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours} giờ ` : ''}${mins > 0 ? `${mins} phút` : ''}`;
};

// Get place type icon
const getPlaceTypeIcon = (type: string) => {
  return <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
    type === 'tourist_attraction' ? 'bg-green-100 text-green-600' :
    type === 'restaurant' ? 'bg-red-100 text-red-600' :
    type === 'cafe' ? 'bg-yellow-100 text-yellow-600' :
    type === 'hotel' ? 'bg-blue-100 text-blue-600' :
    'bg-purple-100 text-purple-600'
  }`}>
    {type === 'tourist_attraction' ? '🏛️' :
     type === 'restaurant' ? '🍽️' :
     type === 'cafe' ? '☕' :
     type === 'hotel' ? '🏨' : '📍'}
  </div>;
};

export default function TripDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null);
  
  // Fetch trip data (simulated)
// Thay thế useEffect fetch trip data
useEffect(() => {
  const loadTripData = async () => {
    try {
      const tripData = await TripService.getTripById(tripId);
      setTrip(tripData);
    } catch (error) {
      console.error('Error loading trip:', error);
      // Fallback về sample data hoặc hiển thị error
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };
  
  loadTripData();
}, [tripId]);
  // Filter saved places based on search query
  const filteredPlaces = savedPlaces.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.address.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle drag end
  const handleDragEnd = (result: any) => {
    if (!result.destination || !trip) return;
    
    const { source, destination } = result;
    
    // If the place is being reordered within the same day
    if (source.droppableId === destination.droppableId) {
      const dayIndex = trip.days.findIndex(day => day.dayNumber === parseInt(source.droppableId));
      if (dayIndex === -1) return;
      
      const newPlaces = [...trip.days[dayIndex].places];
      const [removed] = newPlaces.splice(source.index, 1);
      newPlaces.splice(destination.index, 0, removed);
      
      const newDays = [...trip.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        places: newPlaces
      };
      
      setTrip({
        ...trip,
        days: newDays
      });
    } 
    // If the place is being moved to another day
    else {
      const sourceDayIndex = trip.days.findIndex(day => day.dayNumber === parseInt(source.droppableId));
      const destDayIndex = trip.days.findIndex(day => day.dayNumber === parseInt(destination.droppableId));
      
      if (sourceDayIndex === -1 || destDayIndex === -1) return;
      
      const newSourcePlaces = [...trip.days[sourceDayIndex].places];
      const newDestPlaces = [...trip.days[destDayIndex].places];
      
      const [removed] = newSourcePlaces.splice(source.index, 1);
      newDestPlaces.splice(destination.index, 0, removed);
      
      const newDays = [...trip.days];
      newDays[sourceDayIndex] = {
        ...newDays[sourceDayIndex],
        places: newSourcePlaces
      };
      newDays[destDayIndex] = {
        ...newDays[destDayIndex],
        places: newDestPlaces
      };
      
      setTrip({
        ...trip,
        days: newDays
      });
    }
  };
  
  // Handle add place to day
  const handleAddPlaceToDay = (place: Place, dayNumber: number) => {
    if (!trip) return;
    
    const dayIndex = trip.days.findIndex(day => day.dayNumber === dayNumber);
    if (dayIndex === -1) return;
    
    // Check if place already exists in this day
    if (trip.days[dayIndex].places.some(p => p.id === place.id)) {
      alert('Địa điểm này đã có trong lịch trình của ngày!');
      return;
    }
    
    const newDays = [...trip.days];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      places: [...newDays[dayIndex].places, { ...place }]
    };
    
    setTrip({
      ...trip,
      days: newDays
    });
    
    setShowAddPlaceModal(false);
  };
  
  // Handle remove place from day
  const handleRemovePlaceFromDay = (placeId: string, dayNumber: number) => {
    if (!trip) return;
    
    const dayIndex = trip.days.findIndex(day => day.dayNumber === dayNumber);
    if (dayIndex === -1) return;
    
    const newDays = [...trip.days];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      places: newDays[dayIndex].places.filter(p => p.id !== placeId)
    };
    
    setTrip({
      ...trip,
      days: newDays
    });
  };
  
  // Handle update place time
  const handleUpdatePlaceTime = (
    placeId: string, 
    dayNumber: number, 
    field: 'startTime' | 'endTime' | 'duration' | 'notes', 
    value: string | number
  ) => {
    if (!trip) return;
    
    const dayIndex = trip.days.findIndex(day => day.dayNumber === dayNumber);
    if (dayIndex === -1) return;
    
    const placeIndex = trip.days[dayIndex].places.findIndex(p => p.id === placeId);
    if (placeIndex === -1) return;
    
    const newDays = [...trip.days];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      places: newDays[dayIndex].places.map((p, idx) => 
        idx === placeIndex ? { ...p, [field]: value } : p
      )
    };
    
    setTrip({
      ...trip,
      days: newDays
    });
  };
  
  // Calculate total duration for a day
  const calculateDayDuration = (places: Place[]): number => {
    return places.reduce((total, place) => total + (place.duration || 0), 0);
  };
  
  // Handle save itinerary
const handleSaveItinerary = async () => {
  if (!trip) return;
  
  try {
    await TripService.updateTrip(trip.id, trip);
    alert('Lịch trình đã được lưu thành công!');
    setIsEditing(false);
  } catch (error) {
    console.error('Error saving trip:', error);
    alert('Có lỗi xảy ra khi lưu lịch trình');
  }
};
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy lịch trình</h2>
          <p className="text-gray-600 mb-6">Lịch trình bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/trip-planner"
            className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Link href="/trip-planner" className="mr-4">
                <ChevronLeft className="h-6 w-6 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{trip.name}</h1>
                <p className="text-gray-600">{trip.destination}</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                <span>Xuất lịch trình</span>
              </button>
              
              {isEditing ? (
                <button
                  onClick={handleSaveItinerary}
                  className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  <span>Lưu thay đổi</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-5 h-5 mr-2" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Trip info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0 relative h-48 md:h-auto md:w-1/3">
              <Image
                src={trip.coverImage}
                alt={trip.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="w-4 h-4 mr-1.5" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>{trip.numDays} ngày</span>
                <span className="mx-2">•</span>
                <MapPin className="w-4 h-4 mr-1.5" />
                <span>
                  {trip.days.reduce((total, day) => total + day.places.length, 0)} địa điểm
                </span>
              </div>
              
              {trip.description && (
                <div className="text-gray-600 mb-6 max-w-3xl">
                  {trip.description}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                  {trip.status === 'draft' ? 'Bản nháp' : 
                   trip.status === 'planned' ? 'Đã lên kế hoạch' : 'Đã hoàn thành'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Itinerary content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Days tabs sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h2 className="font-bold text-gray-800 mb-4">Lịch trình theo ngày</h2>
              <nav className="space-y-1">
                {trip.days.map(day => (
                  <button
                    key={day.dayNumber}
                    className={`flex items-center justify-between w-full px-4 py-3 text-left text-sm rounded-lg transition-colors ${
                      activeDay === day.dayNumber
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveDay(day.dayNumber)}
                  >
                    <div className="flex flex-col">
                      <span>Ngày {day.dayNumber}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(day.date).split(', ')[0]}
                      </span>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-xs rounded-full py-1 px-2">
                      {day.places.length} địa điểm
                    </span>
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-bold text-gray-800 mb-2">Tổng quan</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <span className="font-medium">Tổng số ngày:</span> {trip.numDays}
                </p>
                <p>
                  <span className="font-medium">Tổng số địa điểm:</span> {trip.days.reduce((total, day) => total + day.places.length, 0)}
                </p>
                <p>
                  <span className="font-medium">Địa điểm/ngày:</span> {(trip.days.reduce((total, day) => total + day.places.length, 0) / trip.numDays).toFixed(1)}
                </p>
                <p>
                  <span className="font-medium">Tổng thời gian:</span> {formatTime(trip.days.reduce((total, day) => total + calculateDayDuration(day.places), 0))}
                </p>
              </div>
            </div>
          </div>
          
          {/* Day content */}
          <div className="flex-grow">
            {trip.days.map(day => (
              <div key={day.dayNumber} className={activeDay === day.dayNumber ? '' : 'hidden'}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                  <div className="bg-blue-600 text-white p-4">
                    <div className="flex justify-between items-center">
                      <h2 className="font-bold text-xl">Ngày {day.dayNumber}: {formatDate(day.date)}</h2>
                      {day.places.length > 0 && (
                        <div className="text-sm bg-white/20 rounded-full px-3 py-1">
                          {calculateDayDuration(day.places) > 0 
                            ? formatTime(calculateDayDuration(day.places)) 
                            : `${day.places.length} địa điểm`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {day.places.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 mb-4">Chưa có địa điểm nào cho ngày này</p>
                        <button
                          onClick={() => setShowAddPlaceModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-5 h-5 mr-1" />
                          <span>Thêm địa điểm</span>
                        </button>
                      </div>
                    ) : (
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId={day.dayNumber.toString()}  isDropDisabled={true} isCombineEnabled={true}  >
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-4"
                            >
                              {day.places.map((place, index) => (
                                <Draggable
                                  key={place.id}
                                  draggableId={place.id}
                                  index={index}
                                  isDragDisabled={!isEditing}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`border rounded-lg overflow-hidden transition-shadow ${isEditing ? 'hover:shadow-md' : ''}`}
                                    >
                                      <div className="flex">
                                        <div className="relative h-32 w-32 flex-shrink-0">
                                          <Image
                                            src={place.image}
                                            alt={place.name}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div className="p-3 flex-grow">
                                          <div className="flex justify-between">
                                            <div className="flex items-start gap-2">
                                              {isEditing && (
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="cursor-move text-gray-400 p-1"
                                                >
                                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                  </svg>
                                                </div>
                                              )}
                                              {getPlaceTypeIcon(place.type)}
                                              <div>
                                                <h3 className="font-medium text-gray-800">{place.name}</h3>
                                                <p className="text-sm text-gray-500">{place.address}</p>
                                              </div>
                                            </div>
                                            {isEditing && (
                                              <button
                                                onClick={() => handleRemovePlaceFromDay(place.id, day.dayNumber)}
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                <Trash2 className="w-5 h-5" />
                                              </button>
                                            )}
                                          </div>
                                          
                                          <div className="mt-3 border-t pt-3">
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                              {/* Time slots */}
                                              <div className="flex items-center gap-1 min-w-[150px]">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                {isEditing ? (
                                                  showTimePicker === `${place.id}-start` ? (
                                                    <input
                                                      type="time"
                                                      value={place.startTime || ''}
                                                      onChange={(e) => handleUpdatePlaceTime(place.id, day.dayNumber, 'startTime', e.target.value)}
                                                      onBlur={() => setShowTimePicker(null)}
                                                      className="border rounded px-2 py-1 w-24"
                                                      autoFocus
                                                    />
                                                  ) : (
                                                    <button
                                                      onClick={() => setShowTimePicker(`${place.id}-start`)}
                                                      className="text-gray-600 hover:text-blue-600"
                                                    >
                                                      {place.startTime || 'Thêm giờ'}
                                                    </button>
                                                  )
                                                ) : (
                                                  place.startTime && <span>{place.startTime}</span>
                                                )}
                                                
                                                {(place.startTime || isEditing) && (
                                                  <span className="mx-1">-</span>
                                                )}
                                                
                                                {isEditing ? (
                                                  showTimePicker === `${place.id}-end` ? (
                                                    <input
                                                      type="time"
                                                      value={place.endTime || ''}
                                                      onChange={(e) => handleUpdatePlaceTime(place.id, day.dayNumber, 'endTime', e.target.value)}
                                                      onBlur={() => setShowTimePicker(null)}
                                                      className="border rounded px-2 py-1 w-24"
                                                      autoFocus
                                                    />
                                                  ) : (
                                                    <button
                                                      onClick={() => setShowTimePicker(`${place.id}-end`)}
                                                      className="text-gray-600 hover:text-blue-600"
                                                    >
                                                      {place.endTime || 'Thêm giờ'}
                                                    </button>
                                                  )
                                                ) : (
                                                  place.endTime && <span>{place.endTime}</span>
                                                )}
                                              </div>
                                              
                                              {/* Duration */}
                                              <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {isEditing ? (
                                                  <div className="flex items-center gap-1">
                                                    <input
                                                      type="number"
                                                      min="15"
                                                      max="480"
                                                      step="15"
                                                      value={place.duration || ''}
                                                      onChange={(e) => handleUpdatePlaceTime(place.id, day.dayNumber, 'duration', parseInt(e.target.value) || 0)}
                                                      className="border rounded px-2 py-1 w-16"
                                                    />
                                                    <span className="text-gray-500">phút</span>
                                                  </div>
                                                ) : (
                                                  <span>
                                                    {place.duration ? formatTime(place.duration) : 'Chưa cập nhật'}
                                                  </span>
                                                )}
                                              </div>
                                              
                                              {/* Opening hours */}
                                              {place.openingHours && (
                                                <div className="flex items-center gap-1">
                                                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                  </svg>
                                                  <span>Mở cửa: {place.openingHours}</span>
                                                </div>
                                              )}
                                            </div>
                                            
                                            {/* Notes */}
                                            {(isEditing || place.notes) && (
                                              <div className="mt-2">
                                                {isEditing ? (
                                                  <textarea
                                                    placeholder="Ghi chú (không bắt buộc)"
                                                    value={place.notes || ''}
                                                    onChange={(e) => handleUpdatePlaceTime(place.id, day.dayNumber, 'notes', e.target.value)}
                                                    className="w-full border rounded px-3 py-2 text-sm"
                                                    rows={2}
                                                  />
                                                ) : place.notes && (
                                                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                    {place.notes}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              
                              {isEditing && (
                                <div className="text-center py-4">
                                  <button
                                    onClick={() => setShowAddPlaceModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    <Plus className="w-5 h-5 mr-1" />
                                    <span>Thêm địa điểm</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add place modal */}
      {showAddPlaceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Thêm địa điểm vào Ngày {activeDay}</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowAddPlaceModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Search input */}
              <div className="relative mt-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm địa điểm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500">Không tìm thấy địa điểm nào phù hợp</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlaces.map(place => (
                    <div 
                      key={place.id} 
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleAddPlaceToDay(place, activeDay)}
                    >
                      <div className="flex">
                        <div className="relative h-24 w-24 flex-shrink-0">
                          <Image
                            src={place.image}
                            alt={place.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3 flex-grow">
                          <div className="flex items-start gap-2">
                            {getPlaceTypeIcon(place.type)}
                            <div>
                              <h3 className="font-medium text-gray-800">{place.name}</h3>
                              <p className="text-xs text-gray-500 line-clamp-2">{place.address}</p>
                              {place.openingHours && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{place.openingHours}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddPlaceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Xuất lịch trình</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowExportModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <button className="flex items-center w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-6 h-6 text-blue-600 mr-4" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800">Tải xuống PDF</h3>
                    <p className="text-sm text-gray-500">Tải lịch trình dưới dạng file PDF</p>
                  </div>
                </button>
                
                <button className="flex items-center w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Share className="w-6 h-6 text-green-600 mr-4" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800">Chia sẻ liên kết</h3>
                    <p className="text-sm text-gray-500">Chia sẻ lịch trình qua liên kết</p>
                  </div>
                </button>
                
                <button className="flex items-center w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Printer className="w-6 h-6 text-purple-600 mr-4" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-800">In lịch trình</h3>
                    <p className="text-sm text-gray-500">In lịch trình để mang theo</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}