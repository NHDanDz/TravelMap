// app/saved-places/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, Compass, Search, Star, Heart, Trash2, 
  Coffee, Hotel, Utensils, Landmark, Map, ChevronDown
} from 'lucide-react';

// Type definitions
interface Place {
  id: string;
  name: string;
  type: 'restaurant' | 'cafe' | 'hotel' | 'tourist_attraction';
  address: string;
  city: string;
  image: string;
  rating: number;
  savedAt: string;
  notes?: string;
}

// Sample data for saved places
const savedPlacesData: Place[] = [
  {
    id: 'p1',
    name: 'Nhà hàng Sơn Hải',
    type: 'restaurant',
    address: '25 Phạm Ngọc Thạch, Quận 1',
    city: 'TP. Hồ Chí Minh',
    image: '/images/restaurant-1.jpg',
    rating: 4.7,
    savedAt: '2025-03-15',
    notes: 'Nhà hàng hải sản ngon, nên thử món ghẹ rang muối.'
  },
  {
    id: 'p2',
    name: 'The Coffee House',
    type: 'cafe',
    address: '92 Lê Lợi, Quận 1',
    city: 'TP. Hồ Chí Minh',
    image: '/images/cafe-1.jpg',
    rating: 4.3,
    savedAt: '2025-03-14'
  },
  {
    id: 'p3',
    name: 'Khách sạn Continental',
    type: 'hotel',
    address: '132-134 Đồng Khởi, Quận 1',
    city: 'TP. Hồ Chí Minh',
    image: '/images/hotel-1.jpg',
    rating: 4.9,
    savedAt: '2025-03-12',
    notes: 'Khách sạn lịch sử, view đẹp nhìn ra nhà hát lớn.'
  },
  {
    id: 'p4',
    name: 'Bảo tàng Lịch sử Việt Nam',
    type: 'tourist_attraction',
    address: '2 Nguyễn Bỉnh Khiêm, Quận 1',
    city: 'TP. Hồ Chí Minh',
    image: '/images/museum-1.jpg',
    rating: 4.5,
    savedAt: '2025-03-10'
  },
  {
    id: 'p5',
    name: 'Phở Hòa',
    type: 'restaurant',
    address: '260C Pasteur, Quận 3',
    city: 'TP. Hồ Chí Minh',
    image: '/images/restaurant-2.jpg',
    rating: 4.6,
    savedAt: '2025-03-09',
    notes: 'Phở bò nổi tiếng, đông khách vào buổi sáng.'
  },
  {
    id: 'p6',
    name: 'Du Miên Cafe',
    type: 'cafe',
    address: '48/9A Hồ Biểu Chánh, Phú Nhuận',
    city: 'TP. Hồ Chí Minh',
    image: '/images/cafe-2.jpg',
    rating: 4.4,
    savedAt: '2025-03-08'
  },
  {
    id: 'p7',
    name: 'Chùa Ngọc Hoàng',
    type: 'tourist_attraction',
    address: '73 Mai Thị Lựu, Quận 1',
    city: 'TP. Hồ Chí Minh',
    image: '/images/pagoda-1.jpg',
    rating: 4.5,
    savedAt: '2025-03-07'
  },
  {
    id: 'p8',
    name: 'Little Saigon Boutique Hotel',
    type: 'hotel',
    address: '36 Phạm Ngũ Lão, Quận 1',
    city: 'TP. Hồ Chí Minh',
    image: '/images/hotel-2.jpg',
    rating: 4.2,
    savedAt: '2025-03-06'
  }
];

// Get type icon component
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'restaurant':
      return <Utensils className="w-4 h-4" />;
    case 'cafe':
      return <Coffee className="w-4 h-4" />;
    case 'hotel':
      return <Hotel className="w-4 h-4" />;
    case 'tourist_attraction':
      return <Landmark className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

// Get type label
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'restaurant':
      return 'Nhà hàng';
    case 'cafe':
      return 'Quán cà phê';
    case 'hotel':
      return 'Khách sạn';
    case 'tourist_attraction':
      return 'Địa điểm du lịch';
    default:
      return type;
  }
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  }).format(date);
};

const SavedPlacesPage = () => {
  const [places, setPlaces] = useState<Place[]>(savedPlacesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Get cities from saved places
  const cities = Array.from(new Set(savedPlacesData.map(place => place.city)));
  
  // Filter places based on search, type, and city
  const filteredPlaces = places.filter(place => {
    // Filter by search query
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          place.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by place type
    const matchesType = activeFilter ? place.type === activeFilter : true;
    
    // Filter by city
    const matchesCity = selectedCity ? place.city === selectedCity : true;
    
    return matchesSearch && matchesType && matchesCity;
  });
  
  // Handle remove place
  const handleRemovePlace = (id: string) => {
    setPlaces(prevPlaces => prevPlaces.filter(place => place.id !== id));
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-6">
                <Compass className="h-6 w-6 text-blue-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Địa điểm đã lưu</h1>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <Link 
                href="/dashboard/Map" 
                className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Map className="w-5 h-5 mr-2" />
                <span>Khám phá thêm</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search and filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search input */}
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm địa điểm đã lưu..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            
            {/* City filter */}
            <div className="relative min-w-[180px]">
              <select
                value={selectedCity || ''}
                onChange={(e) => setSelectedCity(e.target.value || null)}
                className="appearance-none w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả thành phố</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
            
            {/* View toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('grid')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('list')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Type filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${
                activeFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter(null)}
            >
              Tất cả
            </button>
            {['restaurant', 'cafe', 'hotel', 'tourist_attraction'].map(type => (
              <button
                key={type}
                className={`flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${
                  activeFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveFilter(activeFilter === type ? null : type)}
              >
                {getTypeIcon(type)}
                <span className="ml-1">{getTypeLabel(type)}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* No results */}
        {filteredPlaces.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy địa điểm nào</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery || activeFilter || selectedCity
                ? 'Không có địa điểm nào phù hợp với điều kiện tìm kiếm của bạn. Hãy thử tìm kiếm khác hoặc bỏ bộ lọc.'
                : 'Bạn chưa lưu địa điểm nào. Hãy khám phá và lưu những địa điểm bạn yêu thích.'}
            </p>
            <Link
              href="/dashboard/Map"
              className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MapPin className="w-5 h-5 mr-2" />
              <span>Khám phá địa điểm</span>
            </Link>
          </div>
        )}
        
        {/* Places grid/list */}
        {filteredPlaces.length > 0 && (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Hiển thị {filteredPlaces.length} địa điểm
                {selectedCity && ` tại ${selectedCity}`}
                {activeFilter && ` - ${getTypeLabel(activeFilter)}`}
              </p>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlaces.map(place => (
                  <div key={place.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <div className="relative h-48 w-full">
                        <Image
                          src={place.image}
                          alt={place.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute top-3 right-3">
                        <button 
                          className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                          onClick={() => handleRemovePlace(place.id)}
                          title="Xóa khỏi danh sách đã lưu"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm py-1 px-3 rounded-full flex items-center">
                        {getTypeIcon(place.type)}
                        <span className="ml-1 text-xs font-medium">
                          {getTypeLabel(place.type)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-1">{place.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{place.rating}</span>
                        </div>
                        <span className="mx-2 text-gray-300">•</span>
                        <div className="text-sm text-gray-500">
                          Đã lưu: {formatDate(place.savedAt)}
                        </div>
                      </div>
                      <div className="flex items-start text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 mr-1" />
                        <span>{place.address}, {place.city}</span>
                      </div>
                      {place.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg mt-2">
                          <p>{place.notes}</p>
                        </div>
                      )}
                      <div className="mt-4 flex space-x-2">
                        <Link
                          href={`/dashboard/Map?place=${place.id}`}
                          className="flex-1 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
                        >
                          Xem chi tiết
                        </Link>
                        <Link
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${place.name} ${place.address} ${place.city}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlaces.map(place => (
                  <div key={place.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-48 h-40 sm:h-auto flex-shrink-0">
                        <Image
                          src={place.image}
                          alt={place.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 right-3 sm:hidden">
                          <button 
                            className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                            onClick={() => handleRemovePlace(place.id)}
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex-grow">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-bold text-gray-800">{place.name}</h3>
                              <div className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center">
                                {getTypeIcon(place.type)}
                                <span className="ml-1">{getTypeLabel(place.type)}</span>
                              </div>
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm text-gray-600">{place.rating}</span>
                              </div>
                              <span className="mx-2 text-gray-300">•</span>
                              <div className="text-sm text-gray-500">
                                Đã lưu: {formatDate(place.savedAt)}
                              </div>
                            </div>
                          </div>
                          <div className="hidden sm:block">
                            <button 
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              onClick={() => handleRemovePlace(place.id)}
                              title="Xóa khỏi danh sách đã lưu"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-start text-sm text-gray-500 mt-2">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 mr-1" />
                          <span>{place.address}, {place.city}</span>
                        </div>
                        {place.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg mt-3">
                            <p>{place.notes}</p>
                          </div>
                        )}
                        <div className="mt-4 flex space-x-2">
                          <Link
                            href={`/dashboard/Map?place=${place.id}`}
                            className="py-1.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Xem chi tiết
                          </Link>
                          <Link
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${place.name} ${place.address} ${place.city}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center py-1.5 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            <span>Chỉ đường</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg z-10 lg:hidden">
        <div className="grid grid-cols-4 h-16">
          <Link
            href="/"
            className="flex flex-col items-center justify-center text-gray-500"
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs mt-1">Trang chủ</span>
          </Link>
          <Link
            href="/dashboard/Map"
            className="flex flex-col items-center justify-center text-gray-500"
          >
            <Map className="h-6 w-6" />
            <span className="text-xs mt-1">Bản đồ</span>
          </Link>
          <Link
            href="/saved-places"
            className="flex flex-col items-center justify-center text-blue-600"
          >
            <Heart className="h-6 w-6 fill-current" />
            <span className="text-xs mt-1">Đã lưu</span>
          </Link>
          <Link
            href="/account"
            className="flex flex-col items-center justify-center text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Tài khoản</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SavedPlacesPage;