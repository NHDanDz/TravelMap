// app/trip-planner/[id]/print/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, Download, Printer, QrCode, Share, 
  Calendar, Clock, MapPin, ArrowLeft,  
  Star,  Globe, DollarSign, Cloud, Sun, CloudRain,
  Coffee, Utensils, Building, Landmark, Zap,  
  Activity, Info, AlertCircle,   RefreshCw
} from 'lucide-react';

// Enhanced interfaces with database fields
interface Photo {
  id: number;
  url: string;
  caption?: string;
  isPrimary: boolean;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  visitDate: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

interface Category {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

interface City {
  id: number;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

interface WeatherData {
  id: number;
  date: string;
  temperatureHigh: number;
  temperatureLow: number;
  condition: string;
  precipitationChance: number;
}

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
  notes?: string;
  openingHours?: string;
  rating?: number;
  category?: Category;
  city?: City;
  photos?: Photo[];
  reviews?: Review[];
  website?: string;
  contactInfo?: string;
  priceLevel?: number;
  avgDurationMinutes?: number;
  description?: string;
}

interface Day {
  dayNumber: number;
  date: string;
  places: Place[];
  weather?: WeatherData;
  notes?: string;
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
  city?: City;
  user?: {
    id: number;
    username: string;
    fullName?: string;
  };
  tags?: string[];
  estimatedBudget?: number;
  travelCompanions?: number;
}

// Weather icon mapping
const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
    case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />;
    case 'rain': return <CloudRain className="w-5 h-5 text-blue-500" />;
    default: return <Sun className="w-5 h-5 text-yellow-500" />;
  }
};

// Place type configuration
const placeTypeConfig = {
  tourist_attraction: { icon: Landmark, color: 'text-green-600', label: 'Điểm tham quan', emoji: '🏛️' },
  restaurant: { icon: Utensils, color: 'text-red-600', label: 'Nhà hàng', emoji: '🍽️' },
  cafe: { icon: Coffee, color: 'text-amber-600', label: 'Quán cà phê', emoji: '☕' },
  hotel: { icon: Building, color: 'text-blue-600', label: 'Khách sạn', emoji: '🏨' },
  shopping: { icon: Activity, color: 'text-purple-600', label: 'Mua sắm', emoji: '🛍️' }
};

// Enhanced formatting functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
};

// Price level indicator
const getPriceLevelIndicator = (level?: number) => {
  if (!level) return null;
  return (
    <div className="flex items-center">
      {Array.from({ length: 4 }, (_, i) => (
        <DollarSign
          key={i}
          className={`w-3 h-3 ${i < level ? 'text-green-600' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

export default function EnhancedTripPrintPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'detailed' | 'timeline' | 'compact' | 'table'>('detailed');
  const [showQrCode, setShowQrCode] = useState(false);
  const [includeWeather, setIncludeWeather] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeReviews, setIncludeReviews] = useState(false);
  const [includeMap, setIncludeMap] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const printRef = useRef<HTMLDivElement>(null);
  
  // Load trip data
  useEffect(() => {
    const loadTripData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trips/${tripId}`);
        if (!response.ok) throw new Error('Failed to fetch trip');
        
        const tripData = await response.json();
        
        // Load weather data for each day
        const daysWithWeather = await Promise.all(
          tripData.days.map(async (day: Day) => {
            try {
              if (tripData.city?.id) {
                const weatherResponse = await fetch(
                  `/api/cities/${tripData.city.id}/weather?date=${day.date}`
                );
                if (weatherResponse.ok) {
                  const weatherData = await weatherResponse.json();
                  return { ...day, weather: weatherData };
                }
              }
              return day;
            } catch (error) {
              console.error('Failed to load weather for day:', day.dayNumber);
              return day;
            }
          })
        );
        
        setTrip({ ...tripData, days: daysWithWeather });
      } catch (error) {
        console.error('Error loading trip:', error);
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (tripId) {
      loadTripData();
    }
  }, [tripId]);
  
  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  // Handle download as PDF
  const handleDownload = () => {
    // In a real application, you would implement PDF generation here
    alert('Tính năng đang phát triển. Bạn có thể sử dụng chức năng in và lưu dưới dạng PDF.');
  };
  
  // Calculate trip statistics
  const calculateTripStats = () => {
    if (!trip) return null;
    
    const totalPlaces = trip.days.reduce((sum, day) => sum + day.places.length, 0);
    const avgRating = trip.days
      .flatMap(day => day.places)
      .filter(place => place.rating)
      .reduce((sum, place, _, arr) => sum + (place.rating || 0) / arr.length, 0);
    
    const totalDuration = trip.days
      .flatMap(day => day.places)
      .reduce((sum, place) => sum + (place.duration || place.avgDurationMinutes || 0), 0);
    
    const placesByType = trip.days
      .flatMap(day => day.places)
      .reduce((acc, place) => {
        acc[place.type] = (acc[place.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return {
      totalPlaces,
      avgRating: avgRating || 0,
      totalDuration,
      placesByType,
      daysWithWeather: trip.days.filter(day => day.weather).length
    };
  };
  
  const stats = calculateTripStats();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 border-4 border-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
      {/* Header (hidden when printing) */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <Link href={`/trip-planner/${tripId}`} className="mr-4">
                <ChevronLeft className="h-6 w-6 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Xuất lịch trình</h1>
                <p className="text-gray-600">{trip.name} - {trip.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Mode Selection */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    viewMode === 'detailed' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Chi tiết
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    viewMode === 'timeline' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    viewMode === 'compact' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Gọn
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    viewMode === 'table' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Bảng
                </button>
              </div>
              
              {/* Print Options */}
              <button
                onClick={() => setShowQrCode(!showQrCode)}
                className="flex items-center py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <QrCode className="w-5 h-5 mr-2" />
                <span>QR Code</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-5 h-5 mr-2" />
                <span>In</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                <span>Tải PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Print Options Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 print:hidden">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Tùy chọn in</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeWeather}
                onChange={(e) => setIncludeWeather(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Thời tiết</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Hình ảnh</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeReviews}
                onChange={(e) => setIncludeReviews(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Đánh giá</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeMap}
                onChange={(e) => setIncludeMap(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Bản đồ</span>
            </label>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Cỡ chữ:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="small">Nhỏ</option>
                <option value="medium">Vừa</option>
                <option value="large">Lớn</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">QR Code lịch trình</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowQrCode(false)}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-56 h-56 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <div className="w-48 h-48 bg-white p-4">
                  <div className="w-full h-full border-8 border-gray-800 rounded-xl relative">
                    <div className="absolute inset-4 border-4 border-gray-800 rounded"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Quét mã QR để xem lịch trình trên thiết bị di động
              </p>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Đã sao chép liên kết!');
                }}
                className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share className="w-5 h-5 mr-2" />
                <span>Sao chép liên kết</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Printable Content */}
      <div 
        ref={printRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 print:p-0 print:max-w-none ${
          fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'
        }`}
      >
        {/* Print Header */}
        <div className="hidden print:block mb-8">
          <div className="text-center border-b border-gray-300 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
            <p className="text-xl text-gray-600 mb-4">{trip.destination}</p>
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{trip.numDays} ngày</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{stats?.totalPlaces} địa điểm</span>
              </div>
              {trip.estimatedBudget && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>{trip.estimatedBudget.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Trip Summary (Print Only) */}
        <div className="hidden print:block mb-8">
          {trip.description && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Mô tả chuyến đi</h2>
              <p className="text-gray-700">{trip.description}</p>
            </div>
          )}
          
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPlaces}</div>
                <div className="text-sm text-gray-600">Tổng địa điểm</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.avgRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Đánh giá TB</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatDuration(stats.totalDuration)}</div>
                <div className="text-sm text-gray-600">Tổng thời gian</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.daysWithWeather}</div>
                <div className="text-sm text-gray-600">Ngày có dự báo</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Detailed View */}
        {viewMode === 'detailed' && (
          <div className="space-y-8">
            {trip.days.map((day) => (
              <div key={day.dayNumber} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Day Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Ngày {day.dayNumber}</h2>
                      <p className="text-blue-100">{formatDate(day.date)}</p>
                    </div>
                    <div className="text-right">
                      {includeWeather && day.weather && (
                        <div className="flex items-center space-x-2 mb-2">
                          {getWeatherIcon(day.weather.condition)}
                          <span className="text-lg font-semibold">
                            {day.weather.temperatureHigh}°/{day.weather.temperatureLow}°
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-blue-100">
                        {day.places.length} địa điểm
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Places */}
                <div className="p-6 space-y-6">
                  {day.places.map((place, index) => {
                    const typeConfig = placeTypeConfig[place.type as keyof typeof placeTypeConfig] || placeTypeConfig.tourist_attraction;
                    const TypeIcon = typeConfig.icon;
                    
                    return (
                      <div key={place.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex">
                          {includePhotos && (
                            <div className="relative h-32 w-32 flex-shrink-0">
                              <Image
                                src={place.photos?.[0]?.url || place.image}
                                alt={place.name}
                                fill
                                className="object-cover"
                              />
                              {place.rating && (
                                <div className="absolute top-2 left-2 bg-white/95 rounded-full px-2 py-1 flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="text-xs font-semibold">{place.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex-grow p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className={`p-1 rounded ${typeConfig.color}`}>
                                    <TypeIcon className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-medium text-gray-600">
                                    {typeConfig.label}
                                  </span>
                                  {place.priceLevel && getPriceLevelIndicator(place.priceLevel)}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{place.name}</h3>
                                <p className="text-gray-600">{place.address}</p>
                              </div>
                              
                              <div className="text-right text-sm">
                                <div className="font-semibold text-blue-600">#{index + 1}</div>
                                {place.startTime && place.endTime && (
                                  <div className="text-gray-600 mt-1">
                                    {place.startTime} - {place.endTime}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              {place.openingHours && (
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>{place.openingHours}</span>
                                </div>
                              )}
                              
                              {place.duration && (
                                <div className="flex items-center">
                                  <Zap className="w-4 h-4 mr-1" />
                                  <span>{formatDuration(place.duration)}</span>
                                </div>
                              )}
                              
                              {place.website && (
                                <div className="flex items-center">
                                  <Globe className="w-4 h-4 mr-1" />
                                  <span className="truncate">{place.website}</span>
                                </div>
                              )}
                              
                              {place.contactInfo && (
                                <div className="flex items-center">
                                  <Info className="w-4 h-4 mr-1" />
                                  <span>{place.contactInfo}</span>
                                </div>
                              )}
                            </div>
                            
                            {place.description && (
                              <p className="text-gray-700 text-sm mb-3">{place.description}</p>
                            )}
                            
                            {place.notes && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <h4 className="font-medium text-blue-900 mb-1">Ghi chú:</h4>
                                <p className="text-blue-800 text-sm">{place.notes}</p>
                              </div>
                            )}
                            
                            {/* Reviews */}
                            {includeReviews && place.reviews && place.reviews.length > 0 && (
                              <div className="border-t border-gray-200 pt-3">
                                <h4 className="font-medium text-gray-900 mb-2">Đánh giá nổi bật:</h4>
                                <div className="space-y-2">
                                  {place.reviews.slice(0, 2).map(review => (
                                    <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm">{review.user.username}</span>
                                        <div className="flex items-center">
                                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                          <span className="text-xs ml-1">{review.rating}</span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-700">{review.comment}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            {trip.days.map((day) => (
              <div key={day.dayNumber} className="relative">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Ngày {day.dayNumber} - {formatDate(day.date)}
                      </h2>
                      <p className="text-gray-600">{day.places.length} địa điểm</p>
                    </div>
                    {includeWeather && day.weather && (
                      <div className="flex items-center space-x-2">
                        {getWeatherIcon(day.weather.condition)}
                        <span className="font-semibold">
                          {day.weather.temperatureHigh}°/{day.weather.temperatureLow}°
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-6">
                      {day.places.map((place, index) => {
                        const typeConfig = placeTypeConfig[place.type as keyof typeof placeTypeConfig] || placeTypeConfig.tourist_attraction;
                        
                        return (
                          <div key={place.id} className="relative flex items-start space-x-4">
                            <div className="relative z-10 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {index + 1}
                            </div>
                            
                            <div className="flex-grow bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-grow">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-lg font-semibold text-gray-900">{place.name}</span>
                                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                                      {typeConfig.emoji} {typeConfig.label}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 text-sm mb-2">{place.address}</p>
                                  
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    {place.startTime && place.endTime && (
                                      <span>⏰ {place.startTime} - {place.endTime}</span>
                                    )}
                                    {place.duration && (
                                      <span>⏱️ {formatDuration(place.duration)}</span>
                                    )}
                                    {place.rating && (
                                      <span>⭐ {place.rating.toFixed(1)}</span>
                                    )}
                                  </div>
                                </div>
                                
                                {includePhotos && (
                                  <div className="relative h-16 w-16 ml-4 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                      src={place.photos?.[0]?.url || place.image}
                                      alt={place.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                              
                              {place.notes && (
                                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                  <strong>Ghi chú:</strong> {place.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Compact View */}
        {viewMode === 'compact' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h1 className="text-2xl font-bold">{trip.name}</h1>
              <p className="text-blue-100">{trip.destination}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>{formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  <span>{trip.numDays} ngày</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  <span>{stats?.totalPlaces} địa điểm</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {trip.days.map((day) => (
                <div key={day.dayNumber} className="mb-8 last:mb-0">
                  <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mr-3">
                      {day.dayNumber}
                    </div>
                    <div className="flex-grow">
                      <h2 className="font-bold text-gray-800">Ngày {day.dayNumber}</h2>
                      <p className="text-sm text-gray-600">{formatDate(day.date)}</p>
                    </div>
                    {includeWeather && day.weather && (
                      <div className="flex items-center space-x-2">
                        {getWeatherIcon(day.weather.condition)}
                        <span className="text-sm font-medium">
                          {day.weather.temperatureHigh}°/{day.weather.temperatureLow}°
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {day.places.length === 0 ? (
                    <p className="text-gray-500 italic">Chưa có địa điểm nào cho ngày này</p>
                  ) : (
                    <div className="space-y-3">
                      {day.places.map((place, index) => {
                        const typeConfig = placeTypeConfig[place.type as keyof typeof placeTypeConfig] || placeTypeConfig.tourist_attraction;
                        
                        return (
                          <div key={place.id} className="flex items-start">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium mr-3 mt-1 text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium text-gray-800">{place.name}</h3>
                                <span className="text-xs">{typeConfig.emoji}</span>
                                {place.rating && (
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs ml-0.5">{place.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mb-1">{place.address}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                {place.startTime && place.endTime && (
                                  <span>⏰ {place.startTime} - {place.endTime}</span>
                                )}
                                {place.duration && (
                                  <span>⏱️ {formatDuration(place.duration)}</span>
                                )}
                                {place.openingHours && (
                                  <span>🕒 Mở cửa: {place.openingHours}</span>
                                )}
                              </div>
                              {place.notes && (
                                <p className="text-xs italic mt-1 text-blue-700 bg-blue-50 p-1 rounded">
                                  {place.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h1 className="text-2xl font-bold">{trip.name}</h1>
              <p className="text-blue-100">{trip.destination}</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Địa điểm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời lượng
                    </th>
                    {includeWeather && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời tiết
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trip.days.flatMap((day) =>
                    day.places.length === 0 ? (
                      <tr key={`${day.dayNumber}-empty`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">Ngày {day.dayNumber}</div>
                          <div className="text-sm text-gray-500">{formatShortDate(day.date)}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 italic" colSpan={includeWeather ? 6 : 5}>
                          Chưa có địa điểm nào
                        </td>
                      </tr>
                    ) : (
                      day.places.map((place, placeIndex) => {
                        const typeConfig = placeTypeConfig[place.type as keyof typeof placeTypeConfig] || placeTypeConfig.tourist_attraction;
                        
                        return (
                          <tr key={place.id}>
                            {placeIndex === 0 && (
                              <td className="px-6 py-4 whitespace-nowrap" rowSpan={day.places.length}>
                                <div className="font-medium text-gray-900">Ngày {day.dayNumber}</div>
                                <div className="text-sm text-gray-500">{formatShortDate(day.date)}</div>
                              </td>
                            )}
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{place.name}</div>
                              <div className="text-sm text-gray-500">{place.address}</div>
                              {place.rating && (
                                <div className="flex items-center mt-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                                  <span className="text-xs">{place.rating.toFixed(1)}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center text-xs">
                                {typeConfig.emoji} {typeConfig.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {place.startTime && place.endTime ? (
                                `${place.startTime} - ${place.endTime}`
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {place.duration ? (
                                formatDuration(place.duration)
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            {includeWeather && placeIndex === 0 && (
                              <td className="px-6 py-4 whitespace-nowrap" rowSpan={day.places.length}>
                                {day.weather ? (
                                  <div className="flex items-center space-x-2">
                                    {getWeatherIcon(day.weather.condition)}
                                    <span className="text-sm">
                                      {day.weather.temperatureHigh}°/{day.weather.temperatureLow}°
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {place.notes || <span className="text-gray-400">—</span>}
                            </td>
                          </tr>
                        );
                      })
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Lịch trình này được tạo bởi TravelSense AI</p>
          <p className="mt-1">Thời gian và giờ mở cửa có thể thay đổi. Luôn kiểm tra thông tin mới nhất trước khi ghé thăm.</p>
          <p className="mt-2 text-xs">In lúc: {new Date().toLocaleString('vi-VN')}</p>
        </div>
      </div>
    </div>
  );
}