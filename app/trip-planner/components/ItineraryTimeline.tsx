// app/trip-planner/components/ItineraryTimeline.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Clock, MapPin, Star, Calendar, Navigation, Download, Link as LinkIcon
} from 'lucide-react';

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  image: string;
  startTime?: string;
  endTime?: string;
  duration?: number; // in minutes
  notes?: string;
  openingHours?: string;
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
  days: Day[];
}

interface ItineraryTimelineProps {
  trip: Trip;
  showDetailed?: boolean;
  onPrint?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Format time
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours} giờ ` : ''}${mins > 0 ? `${mins} phút` : ''}`;
};

// Get place type icon
const getPlaceTypeIcon = (type: string) => {
  switch (type) {
    case 'tourist_attraction':
      return '🏛️';
    case 'restaurant':
      return '🍽️';
    case 'cafe':
      return '☕';
    case 'hotel':
      return '🏨';
    default:
      return '📍';
  }
};

// Get place type color
const getPlaceTypeColor = (type: string) => {
  switch (type) {
    case 'tourist_attraction':
      return 'bg-green-100 text-green-800';
    case 'restaurant':
      return 'bg-red-100 text-red-800';
    case 'cafe':
      return 'bg-yellow-100 text-yellow-800';
    case 'hotel':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-purple-100 text-purple-800';
  }
};

// Get place type text
const getPlaceTypeText = (type: string) => {
  switch (type) {
    case 'tourist_attraction':
      return 'Địa điểm du lịch';
    case 'restaurant':
      return 'Nhà hàng';
    case 'cafe':
      return 'Quán cà phê';
    case 'hotel':
      return 'Khách sạn';
    default:
      return type;
  }
};

const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ 
  trip, 
  showDetailed = true,
  onPrint,
  onShare,
  onDownload
}) => {
  // Calculate total places
  const totalPlaces = trip.days.reduce((sum, day) => sum + day.places.length, 0);
  
  // Calculate total duration in minutes
  const totalDuration = trip.days.reduce((sum, day) => 
    sum + day.places.reduce((daySum, place) => daySum + (place.duration || 0), 0), 0);
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">{trip.name}</h1>
          <p className="text-blue-100 mb-4">{trip.destination}</p>
          
          <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              <span>{trip.days.length} ngày</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5" />
              <span>{totalPlaces} địa điểm</span>
            </div>
            {totalDuration > 0 && (
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1.5" />
                <span>Tổng thời gian: {formatTime(totalDuration)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="bg-gray-50 px-6 py-2 border-b">
        <div className="max-w-4xl mx-auto flex justify-end space-x-2">
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 py-1.5 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>In</span>
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 py-1.5 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
          )}
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 py-1.5 px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Timeline content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {trip.days.map((day, dayIndex) => (
            <div key={day.dayNumber} className="mb-10 last:mb-0">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {day.dayNumber}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-800">Ngày {day.dayNumber}</h2>
                  <p className="text-gray-600">{formatDate(day.date)}</p>
                </div>
              </div>
              
              {day.places.length === 0 ? (
                <div className="ml-5 pl-10 text-gray-500 italic">
                  Chưa có địa điểm nào cho ngày này
                </div>
              ) : (
                <div className="ml-5 relative">
                  {/* Timeline line */}
                  <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gray-200" />
                  
                  {/* Timeline items */}
                  {day.places.map((place, placeIndex) => (
                    <div 
                      key={place.id} 
                      className={`relative pl-10 pb-8 ${placeIndex === day.places.length - 1 ? '' : ''}`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-0 transform -translate-x-1/2 w-5 h-5 rounded-full border-4 border-white bg-blue-600" />
                      
                      <div className={`bg-white rounded-lg border ${showDetailed ? 'shadow-sm overflow-hidden' : ''}`}>
                        {showDetailed ? (
                          <div className="flex">
                            <div className="relative h-36 w-36 flex-shrink-0">
                              <Image
                                src={place.image}
                                alt={place.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-4 flex-grow">
                              <div className="flex items-start gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlaceTypeColor(place.type)}`}>
                                  {getPlaceTypeIcon(place.type)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-800">{place.name}</h3>
                                  <p className="text-sm text-gray-500 mb-2">{place.address}</p>
                                  
                                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                    {(place.startTime || place.endTime) && (
                                      <div className="flex items-center">
                                        <Clock className="w-4 h-4 text-gray-500 mr-1" />
                                        <span>
                                          {place.startTime || '??:??'} - {place.endTime || '??:??'}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {place.duration && (
                                      <div className="flex items-center">
                                        <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{formatTime(place.duration)}</span>
                                      </div>
                                    )}
                                    
                                    {place.openingHours && (
                                      <div className="flex items-center">
                                        <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>Mở cửa: {place.openingHours}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {place.notes && (
                                    <div className="mt-3 text-sm bg-gray-50 p-2 rounded">
                                      {place.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlaceTypeColor(place.type)}`}>
                                {getPlaceTypeIcon(place.type)}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-800">{place.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                                  {place.startTime && (
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {place.startTime}
                                    </span>
                                  )}
                                  {place.duration && (
                                    <span>
                                      {formatTime(place.duration)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Transportation line (if not the last place in the day) */}
                      {placeIndex < day.places.length - 1 && (
                        <div className="relative h-8">
                          <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-gray-200 dashed-line" />
                          <div className="absolute left-0 top-3 transform -translate-x-1/2 bg-gray-100 rounded-full p-1">
                            <Navigation className="w-3 h-3 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer with disclaimer */}
      <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
        Lịch trình này được tạo bởi ứng dụng TravelSense. Thời gian và giờ mở cửa có thể thay đổi.
        <br />
        Luôn kiểm tra thông tin mới nhất từ các địa điểm trước khi ghé thăm.
      </div>
    </div>
  );
};

export default ItineraryTimeline;