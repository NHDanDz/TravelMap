'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Search, Filter, MapPin, Clock, Star, 
  Plus, Coffee, Utensils, Hotel, Landmark
} from 'lucide-react';

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  image: string;
  latitude: string;
  longitude: string;
  rating?: number;
  duration?: number;
  openingHours?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
}

interface PlaceSearchProps {
  onAddPlace: (place: Place, dayNumber: number) => void;
  currentDayNumber: number;
  allDays: number[];
  savedPlaces?: Place[];
}

// Dummy place data
const dummyPlaces: Place[] = [
  {
    id: 'place1',
    name: 'Hồ Hoàn Kiếm',
    type: 'tourist_attraction',
    address: 'Phố Đinh Tiên Hoàng, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0278',
    longitude: '105.8523',
    image: '/images/place-3.jpg',
    rating: 4.7,
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
    rating: 4.8,
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
    rating: 4.6,
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
    rating: 4.5,
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
    rating: 4.9,
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
    rating: 4.7,
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
    rating: 4.5,
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
    rating: 4.3,
    openingHours: '7:00 - 22:00',
    duration: 60
  },
  {
    id: 'place9',
    name: 'Hàng Gai Shopping Street',
    type: 'shopping',
    address: 'Phố Hàng Gai, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0315',
    longitude: '105.8510',
    image: '/images/place-2.jpg',
    rating: 4.2,
    openingHours: '9:00 - 21:00',
    duration: 120
  },
  {
    id: 'place10',
    name: 'Nhà hàng Quán Ăn Ngon',
    type: 'restaurant',
    address: '18 Phan Bội Châu, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0242',
    longitude: '105.8520',
    image: '/images/restaurant-2.jpg',
    rating: 4.4,
    openingHours: '7:00 - 22:00',
    duration: 75
  }
];

// Get place type icon
const getPlaceTypeIcon = (type: string) => {
  switch (type) {
    case 'tourist_attraction':
      return <Landmark className="w-5 h-5" />;
    case 'restaurant':
      return <Utensils className="w-5 h-5" />;
    case 'cafe':
      return <Coffee className="w-5 h-5" />;
    case 'hotel':
      return <Hotel className="w-5 h-5" />;
    default:
      return <MapPin className="w-5 h-5" />;
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

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours} giờ ` : ''}${mins > 0 ? `${mins} phút` : ''}`;
};

const PlaceSearchPanel: React.FC<PlaceSearchProps> = ({ 
  onAddPlace,
  currentDayNumber,
  allDays,
  savedPlaces = dummyPlaces
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(currentDayNumber);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [placeTimingSuggestions, setPlaceTimingSuggestions] = useState<Record<string, { startTime: string, endTime: string }>>({});
  
  // Filter places based on search and filters
  const filteredPlaces = savedPlaces.filter(place => {
    const matchesSearch = 
      searchQuery === '' || 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === null || place.type === selectedType;
    
    const matchesDuration = selectedDuration === null || 
      (place.duration && place.duration <= selectedDuration);
    
    return matchesSearch && matchesType && matchesDuration;
  });
  
  // Generate time suggestions for places
  useEffect(() => {
    if (filteredPlaces.length > 0) {
      const suggestions: Record<string, { startTime: string, endTime: string }> = {};
      
      // Simple algorithm - start at 9:00 AM and allocate sequentially
      let currentTimeMinutes = 9 * 60; // 9:00 AM in minutes
      
      filteredPlaces.forEach(place => {
        if (place.duration) {
          const startHour = Math.floor(currentTimeMinutes / 60);
          const startMinute = currentTimeMinutes % 60;
          
          const endTimeMinutes = currentTimeMinutes + place.duration;
          const endHour = Math.floor(endTimeMinutes / 60);
          const endMinute = endTimeMinutes % 60;
          
          suggestions[place.id] = {
            startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
            endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
          };
          
          // Add 30 minutes travel time between places
          currentTimeMinutes = endTimeMinutes + 30;
        }
      });
      
      setPlaceTimingSuggestions(suggestions);
    }
  }, [filteredPlaces]);
  
  // Handle add place with timing suggestion
  const handleAddPlace = (place: Place) => {
    // Create a properly typed object with all fields
    const placeWithTiming: Place = { 
      ...place,
      startTime: undefined,
      endTime: undefined
    };
    
    // Add suggested timing if available
    if (placeTimingSuggestions[place.id]) {
      placeWithTiming.startTime = placeTimingSuggestions[place.id].startTime;
      placeWithTiming.endTime = placeTimingSuggestions[place.id].endTime;
    }
    
    onAddPlace(placeWithTiming, selectedDay);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg text-gray-800 mb-4">Thêm địa điểm</h2>
        
        {/* Search input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm địa điểm..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${showFilters ? 'text-blue-500' : ''}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
        
        {/* Filter options */}
        {showFilters && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại địa điểm
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    selectedType === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedType(null)}
                >
                  Tất cả
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                    selectedType === 'tourist_attraction'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedType(selectedType === 'tourist_attraction' ? null : 'tourist_attraction')}
                >
                  <Landmark className="w-3 h-3" />
                  <span>Địa điểm du lịch</span>
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                    selectedType === 'restaurant'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedType(selectedType === 'restaurant' ? null : 'restaurant')}
                >
                  <Utensils className="w-3 h-3" />
                  <span>Nhà hàng</span>
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                    selectedType === 'cafe'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedType(selectedType === 'cafe' ? null : 'cafe')}
                >
                  <Coffee className="w-3 h-3" />
                  <span>Quán cà phê</span>
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời lượng tối đa
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    selectedDuration === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedDuration(null)}
                >
                  Tất cả
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    selectedDuration === 60
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedDuration(selectedDuration === 60 ? null : 60)}
                >
                  ≤ 1 giờ
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    selectedDuration === 120
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedDuration(selectedDuration === 120 ? null : 120)}
                >
                  ≤ 2 giờ
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    selectedDuration === 180
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedDuration(selectedDuration === 180 ? null : 180)}
                >
                  ≤ 3 giờ
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thêm vào ngày
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {allDays.map(day => (
                  <option key={day} value={day}>
                    Ngày {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Place list */}
      <div className="flex-grow overflow-y-auto">
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-1">Không tìm thấy địa điểm nào</p>
            <p className="text-sm text-gray-400">Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredPlaces.map(place => (
              <div 
                key={place.id} 
                className="flex p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={place.image}
                    alt={place.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-3 flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{place.name}</h3>
                      <div className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full mt-1 ${getPlaceTypeColor(place.type)}`}>
                        {getPlaceTypeIcon(place.type)}
                        <span className="ml-1">
                          {place.type === 'tourist_attraction' ? 'Địa điểm du lịch' :
                           place.type === 'restaurant' ? 'Nhà hàng' :
                           place.type === 'cafe' ? 'Quán cà phê' :
                           place.type === 'hotel' ? 'Khách sạn' : place.type}
                        </span>
                      </div>
                    </div>
                    {place.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm ml-1 text-gray-600">{place.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{place.address}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 mt-1.5">
                    {place.openingHours && (
                      <div className="flex items-center mr-3">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{place.openingHours}</span>
                      </div>
                    )}
                    {place.duration && (
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDuration(place.duration)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Add timing suggestion */}
                  {placeTimingSuggestions[place.id] && (
                    <div className="mt-1.5 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Đề xuất: {placeTimingSuggestions[place.id].startTime} - {placeTimingSuggestions[place.id].endTime}</span>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <button
                      className="flex items-center text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                      onClick={() => handleAddPlace(place)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      <span>Thêm vào Ngày {selectedDay}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceSearchPanel;