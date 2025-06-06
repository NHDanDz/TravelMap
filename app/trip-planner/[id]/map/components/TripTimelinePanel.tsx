// app/trip-planner/[id]/map/components/TripTimelinePanel.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {  
   Clock, MapPin, Star, Route,  
  ChevronDown, ChevronUp,  
  Utensils, Coffee, Building, Landmark, ShoppingBag,  Timer
} from 'lucide-react';

// Types
interface Place {
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
  category?: {
    name: string;
    icon?: string;
  };
}

interface Day {
  dayNumber: number;
  date: string;
  places: Place[];
  weather?: any;
  notes?: string;
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  days: Day[];
  status: 'draft' | 'planned' | 'completed';
  estimatedBudget?: number;
  travelCompanions?: number;
}

interface MapViewState {
  activeDay: number;
  showRoute: boolean;
  showAllDays: boolean;
  followRoute: boolean;
  mapStyle: string;
  showTimeline: boolean;
  fullScreen: boolean;
}

interface TripTimelinePanelProps {
  trip: Trip;
  activeDay: number;
  onDayChange: (dayNumber: number) => void;
  mapViewState: MapViewState;
  onMapViewStateChange: (updates: Partial<MapViewState>) => void;
}

// Place type configuration
const placeTypeConfig = {
  restaurant: { icon: Utensils, color: 'text-red-600 bg-red-100', label: 'Nhà hàng' },
  cafe: { icon: Coffee, color: 'text-amber-600 bg-amber-100', label: 'Quán café' },
  hotel: { icon: Building, color: 'text-blue-600 bg-blue-100', label: 'Khách sạn' },
  tourist_attraction: { icon: Landmark, color: 'text-green-600 bg-green-100', label: 'Địa điểm tham quan' },
  shopping: { icon: ShoppingBag, color: 'text-purple-600 bg-purple-100', label: 'Mua sắm' },
  default: { icon: MapPin, color: 'text-gray-600 bg-gray-100', label: 'Địa điểm' }
};

const getPlaceTypeInfo = (place: Place) => {
  const type = place.type.toLowerCase() as keyof typeof placeTypeConfig;
  return placeTypeConfig[type] || placeTypeConfig.default;
};

// Day colors
const dayColors = [
  'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500',
  'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-pink-500', 'bg-indigo-500'
];

const getDayColor = (dayNumber: number) => {
  return dayColors[(dayNumber - 1) % dayColors.length];
};

// Place card component
const PlaceTimelineCard = ({ place, dayNumber, isActive }: { 
  place: Place; 
  dayNumber: number; 
  isActive: boolean; 
}) => {
  const typeInfo = getPlaceTypeInfo(place);
  const TypeIcon = typeInfo.icon;

  return (
    <div className={`
      bg-white rounded-lg border p-3 transition-all duration-200 hover:shadow-md
      ${isActive ? 'border-blue-300 shadow-sm' : 'border-gray-200'}
    `}>
      <div className="flex items-start space-x-3">
        {/* Place Image */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          {place.image ? (
            <Image
              src={place.image}
              alt={place.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className={`w-full h-full ${typeInfo.color} flex items-center justify-center`}>
              <TypeIcon className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Place Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{place.name}</h4>
          <p className="text-xs text-gray-500 line-clamp-1 mt-1">{place.address}</p>
          
          {/* Metadata */}
          <div className="flex items-center space-x-2 mt-2">
            {place.startTime && (
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                <span>{place.startTime}</span>
              </div>
            )}
            {place.rating && (
              <div className="flex items-center text-xs text-gray-600">
                <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                <span>{place.rating.toFixed(1)}</span>
              </div>
            )}
            {place.duration && (
              <div className="flex items-center text-xs text-gray-600">
                <Timer className="w-3 h-3 mr-1" />
                <span>{Math.floor(place.duration / 60)}h{place.duration % 60 > 0 ? ` ${place.duration % 60}m` : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {place.notes && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
          {place.notes}
        </div>
      )}
    </div>
  );
};

export default function TripTimelinePanel({
  trip,
  activeDay,
  onDayChange,
  mapViewState,
  onMapViewStateChange
}: TripTimelinePanelProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(activeDay);
  const [showSettings, setShowSettings] = useState(false);

  // Calculate trip statistics
  const tripStats = React.useMemo(() => {
    const totalPlaces = trip.days.reduce((sum, day) => sum + day.places.length, 0);
    const daysWithPlaces = trip.days.filter(day => day.places.length > 0).length;
    const avgPlacesPerDay = daysWithPlaces > 0 ? (totalPlaces / daysWithPlaces).toFixed(1) : '0';
    
    return {
      totalPlaces,
      daysWithPlaces,
      avgPlacesPerDay,
      totalDays: trip.days.length
    };
  }, [trip.days]);

  // Handle day selection
  const handleDaySelect = (dayNumber: number) => {
    onDayChange(dayNumber);
    setExpandedDay(dayNumber);
  };

  // Toggle day expansion
  const toggleDayExpansion = (dayNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  const currentDay = trip.days.find(day => day.dayNumber === activeDay);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Route className="w-5 h-5 mr-2 text-blue-600" />
            Lịch trình chi tiết
          </h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {/* <target className="w-4 h-4 text-gray-600" /> */}
          </button>
        </div>

        {/* Trip Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{tripStats.totalPlaces}</div>
            <div className="text-xs text-blue-700">Tổng địa điểm</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{tripStats.avgPlacesPerDay}</div>
            <div className="text-xs text-green-700">Trung bình/ngày</div>
          </div>
        </div>

        {/* View Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Hiển thị tuyến đường</span>
            <button
              onClick={() => onMapViewStateChange({ showRoute: !mapViewState.showRoute })}
              className={`
                w-10 h-6 rounded-full relative transition-colors duration-200
                ${mapViewState.showRoute ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            >
              <div className={`
                w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200
                ${mapViewState.showRoute ? 'translate-x-5' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Xem tất cả ngày</span>
            <button
              onClick={() => onMapViewStateChange({ showAllDays: !mapViewState.showAllDays })}
              className={`
                w-10 h-6 rounded-full relative transition-colors duration-200
                ${mapViewState.showAllDays ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            >
              <div className={`
                w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200
                ${mapViewState.showAllDays ? 'translate-x-5' : 'translate-x-1'}
              `} />
            </button>
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {trip.days.map(day => {
            const isActiveDay = day.dayNumber === activeDay;
            const isExpanded = expandedDay === day.dayNumber;
            const dayColorClass = getDayColor(day.dayNumber);

            return (
              <div key={day.dayNumber} className="space-y-2">
                {/* Day Header - FIXED: Restructured to avoid nested buttons */}
                <div className={`
                  w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActiveDay 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }
                `}>
                  {/* Main clickable area for day selection */}
                  <div 
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => handleDaySelect(day.dayNumber)}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${isActiveDay ? 'bg-white/20 text-white' : `${dayColorClass} text-white`}
                    `}>
                      {day.dayNumber}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">
                        Ngày {day.dayNumber}
                      </div>
                      <div className={`text-xs ${isActiveDay ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(day.date).toLocaleDateString('vi-VN', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Separate area for controls */}
                  <div className="flex items-center space-x-2">
                    <span className={`
                      text-xs px-2 py-1 rounded-full font-medium
                      ${isActiveDay 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {day.places.length}
                    </span>
                    {/* Separate button for expansion - NOT nested */}
                    <div
                      onClick={(e) => toggleDayExpansion(day.dayNumber, e)}
                      className={`p-1 rounded cursor-pointer ${isActiveDay ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Day Places - Show expanded or when active */}
                {(isExpanded || isActiveDay) && day.places.length > 0 && (
                  <div className="ml-4 space-y-2">
                    {day.places.map((place, index) => (
                      <div key={place.id} className="relative">
                        {/* Connection Line */}
                        {index < day.places.length - 1 && (
                          <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200"></div>
                        )}
                        
                        <div className="flex items-start space-x-2">
                          {/* Order Number */}
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-2
                            ${isActiveDay ? 'bg-blue-600 text-white' : `${dayColorClass} text-white`}
                          `}>
                            {index + 1}
                          </div>
                          
                          {/* Place Card */}
                          <div className="flex-1">
                            <PlaceTimelineCard 
                              place={place} 
                              dayNumber={day.dayNumber}
                              isActive={isActiveDay}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty day state */}
                {(isExpanded || isActiveDay) && day.places.length === 0 && (
                  <div className="ml-4 p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                    <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Chưa có địa điểm nào</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with Current Day Info */}
      {currentDay && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Ngày {activeDay}</h3>
            <span className="text-sm text-gray-600">
              {currentDay.places.length} địa điểm
            </span>
          </div>
          
          {currentDay.places.length > 0 && (
            <div className="text-xs text-gray-600">
              {currentDay.places[0].startTime && (
                <span>Bắt đầu: {currentDay.places[0].startTime}</span>
              )}
              {currentDay.places[currentDay.places.length - 1].endTime && (
                <span className="ml-3">
                  Kết thúc: {currentDay.places[currentDay.places.length - 1].endTime}
                </span>
              )}
            </div>
          )}

          {currentDay.notes && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
              {currentDay.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}