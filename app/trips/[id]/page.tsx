// app/trips/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, ArrowLeft, Calendar, Clock, Star,
  Edit, Share, Heart, Download, Navigation, 
  Coffee, Hotel, Utensils, Landmark, User, AlertCircle
} from 'lucide-react';
import SharedLayout from '../../components/layout/SharedLayout';
import { AuthService } from '@/lib/auth';

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  rating?: number;
  notes?: string;
  openingHours?: string;
  description?: string;
  hasValidCoordinates: boolean;
}

interface Day {
  id: number;
  dayNumber: number;
  date: string;
  notes?: string;
  places: Place[];
  totalPlaces: number;
  placesWithCoordinates: number;
  estimatedDistance?: number;
}

interface City {
  id: number;
  name: string;
  country: string;
}

interface User {
  id: number;
  username: string;
  fullName?: string;
}

interface TripDetail {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  numDays: number;
  status: 'draft' | 'planned' | 'completed';
  description?: string;
  days: Day[];
  tags: string[];
  user?: User;
  city?: City;
  totalPlaces: number;
  placesCount: number;
  placesWithCoordinates: number;
  coordinatesCoverage: number;
  totalDistance?: number;
  averageRating?: number;
}

const getCategoryIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'restaurant':
    case 'nhà hàng':
      return <Utensils className="w-4 h-4" />;
    case 'cafe':
    case 'quán cà phê':
      return <Coffee className="w-4 h-4" />;
    case 'hotel':
    case 'khách sạn':
      return <Hotel className="w-4 h-4" />;
    case 'tourist_attraction':
    case 'du lịch':
      return <Landmark className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
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
      return 'Nháp';
    case 'planned':
      return 'Đã lên kế hoạch';
    case 'completed':
      return 'Đã hoàn thành';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (timeString?: string) => {
  if (!timeString) return '';
  return timeString.slice(0, 5); // HH:MM
};

const TripDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'overview' | 'map'>('itinerary');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    
    if (tripId) {
      fetchTripDetail();
    }
  }, [tripId]);

  const fetchTripDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/trips/${tripId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy lịch trình');
        }
        throw new Error('Không thể tải thông tin lịch trình');
      }
      
      const data = await response.json();
      console.log('Trip data:', data);
      setTrip(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareTrip = () => {
    if (navigator.share && trip) {
      navigator.share({
        title: trip.name,
        text: `Khám phá lịch trình ${trip.name} trên TravelSense`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const updateTripStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setTrip(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      console.error('Error updating trip status:', error);
    }
  };

  if (isLoading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="h-96 bg-gray-300 rounded-xl mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="h-32 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  if (error || !trip) {
    return (
      <SharedLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-4">
              {error || 'Không tìm thấy lịch trình'}
            </div>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const isOwner = user && trip.user && user.id === trip.user.id.toString();

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="relative h-96 overflow-hidden">
          <Image
            src={trip.coverImage}
            alt={trip.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareTrip}
                className="text-white bg-black/30 backdrop-blur-sm p-2 rounded-lg hover:bg-black/50 transition-colors"
              >
                <Share className="w-5 h-5" />
              </button>
              <button className="text-white bg-black/30 backdrop-blur-sm p-2 rounded-lg hover:bg-black/50 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              {isOwner && (
                <Link
                  href={`/trips/${trip.id}/edit`}
                  className="text-white bg-black/30 backdrop-blur-sm p-2 rounded-lg hover:bg-black/50 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {trip.name}
                  </h1>
                  <div className="flex items-center text-white/90 text-lg mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center text-white/90 text-lg">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                    {getStatusText(trip.status)}
                  </span>
                  {trip.user && (
                    <div className="mt-2 text-white/90 text-sm">
                      Tạo bởi {trip.user.username}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{trip.numDays}</div>
                <div className="text-sm text-gray-600">Ngày</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">{trip.totalPlaces}</div>
                <div className="text-sm text-gray-600">Địa điểm</div>
              </div>
              {trip.totalDistance && (
                <div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{trip.totalDistance}km</div>
                  <div className="text-sm text-gray-600">Quãng đường</div>
                </div>
              )}
              <div>
                <div className="text-2xl font-bold text-orange-600 mb-1">{trip.coordinatesCoverage}%</div>
                <div className="text-sm text-gray-600">Định vị</div>
              </div>
              {trip.averageRating && (
                <div>
                  <div className="flex items-center justify-center text-2xl font-bold text-yellow-600 mb-1">
                    {trip.averageRating}
                    <Star className="w-5 h-5 ml-1 fill-current" />
                  </div>
                  <div className="text-sm text-gray-600">Đánh giá TB</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Update for Owner */}
        {isOwner && (
          <div className="bg-blue-50 border-b">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  Cập nhật trạng thái lịch trình:
                </div>
                <div className="flex gap-2">
                  {['draft', 'planned', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateTripStatus(status)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        trip.status === status
                          ? getStatusColor(status)
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6">
            <div className="flex border-b">
              {[
                { key: 'itinerary', label: 'Lịch trình chi tiết' },
                { key: 'overview', label: 'Tổng quan' },
                { key: 'map', label: 'Bản đồ' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          {activeTab === 'itinerary' && (
            <div className="space-y-8">
              {trip.days.map(day => (
                <div key={day.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          Ngày {day.dayNumber}
                        </h2>
                        <div className="text-blue-100">
                          {formatDate(day.date)}
                        </div>
                      </div>
                      <div className="text-right text-blue-100">
                        <div>{day.totalPlaces} địa điểm</div>
                        {day.estimatedDistance && (
                          <div>{day.estimatedDistance}km</div>
                        )}
                      </div>
                    </div>
                    {day.notes && (
                      <div className="mt-3 text-blue-100">
                        {day.notes}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {day.places.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Chưa có địa điểm nào trong ngày này
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {day.places.map((place, index) => (
                          <div key={place.id} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                                {index + 1}
                              </div>
                            </div>
                            
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={place.imageUrl || '/images/default-place.jpg'}
                                alt={place.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-1">
                                    {place.name}
                                  </h3>
                                  <div className="flex items-center text-gray-600 text-sm mb-1">
                                    {getCategoryIcon(place.type)}
                                    <span className="ml-1">{place.type}</span>
                                  </div>
                                  {place.address && (
                                    <div className="flex items-center text-gray-600 text-sm mb-2">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      <span className="line-clamp-1">{place.address}</span>
                                    </div>
                                  )}
                                  {place.notes && (
                                    <div className="text-gray-600 text-sm">
                                      {place.notes}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right text-sm">
                                  {place.startTime && place.endTime && (
                                    <div className="flex items-center text-gray-600 mb-1">
                                      <Clock className="w-3 h-3 mr-1" />
                                      <span>{formatTime(place.startTime)} - {formatTime(place.endTime)}</span>
                                    </div>
                                  )}
                                  {place.duration && (
                                    <div className="text-gray-500">
                                      ~{Math.round(place.duration / 60)}h
                                    </div>
                                  )}
                                  {place.rating && (
                                    <div className="flex items-center text-yellow-500 mt-1">
                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                      <span>{place.rating}</span>
                                    </div>
                                  )}
                                  {!place.hasValidCoordinates && (
                                    <div className="flex items-center text-orange-500 mt-1">
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      <span className="text-xs">Chưa định vị</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {trip.description && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Mô tả chuyến đi</h2>
                    <p className="text-gray-600 leading-relaxed">{trip.description}</p>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Thống kê lịch trình</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {trip.days.length}
                      </div>
                      <div className="text-gray-600">Ngày</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {trip.totalPlaces}
                      </div>
                      <div className="text-gray-600">Địa điểm</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {trip.placesWithCoordinates}
                      </div>
                      <div className="text-gray-600">Đã định vị</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {trip.coordinatesCoverage}%
                      </div>
                      <div className="text-gray-600">Tỷ lệ định vị</div>
                    </div>
                  </div>
                </div>

                {trip.tags.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Thẻ tag</h2>
                    <div className="flex flex-wrap gap-2">
                      {trip.tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {trip.city && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Thông tin điểm đến</h2>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Thành phố:</span>
                        <span className="ml-2">{trip.city.name}</span>
                      </div>
                      <div>
                        <span className="font-medium">Quốc gia:</span>
                        <span className="ml-2">{trip.city.country}</span>
                      </div>
                    </div>
                    <Link
                      href={`/cities/${trip.city.id}`}
                      className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700"
                    >
                      Xem thông tin thành phố
                      <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                    </Link>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Hành động</h2>
                  <div className="space-y-3">
                    <button
                      onClick={handleShareTrip}
                      className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Chia sẻ lịch trình
                    </button>
                    
                    <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4 mr-2" />
                      Tải xuống PDF
                    </button>
                    
                    {isOwner && (
                      <Link
                        href={`/trips/${trip.id}/edit`}
                        className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa lịch trình
                      </Link>
                    )}
                  </div>
                </div>

                {trip.coordinatesCoverage < 100 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-orange-800 mb-1">
                          Thông báo định vị
                        </h3>
                        <p className="text-orange-700 text-sm">
                          {trip.totalPlaces - trip.placesWithCoordinates} địa điểm chưa được định vị chính xác. 
                          Điều này có thể ảnh hưởng đến tính năng chỉ đường.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Bản đồ lịch trình</h2>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Navigation className="w-12 h-12 mx-auto mb-2" />
                  <div>Bản đồ sẽ hiển thị tại đây</div>
                  <div className="text-sm mt-1">
                    Hiển thị {trip.placesWithCoordinates}/{trip.totalPlaces} địa điểm đã định vị
                  </div>
                </div>
              </div>
              {trip.totalDistance && (
                <div className="mt-4 text-center text-gray-600">
                  Tổng quãng đường ước tính: <span className="font-semibold">{trip.totalDistance} km</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
};

export default TripDetailPage;