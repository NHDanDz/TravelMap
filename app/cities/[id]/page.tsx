// app/cities/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, Calendar,  Star, ArrowLeft, Thermometer,
  User, Coffee, Hotel, Utensils, Landmark,  Search
} from 'lucide-react';
import SharedLayout from '../../components/layout/SharedLayout';

interface Place {
  id: number;
  name: string;
  address?: string;
  rating?: number;
  category?: {
    name: string;
    icon?: string;
  };
  photos?: {
    url: string;
    isPrimary: boolean;
  }[];
  imageUrl?: string;
}

interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  user: {
    username: string;
  };
}

interface WeatherData {
  date: string;
  temperatureHigh: number;
  temperatureLow: number;
  condition: string;
}

interface CityDetail {
  id: number;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  places: Place[];
  trips: Trip[];
  weatherData: WeatherData[];
  _count: {
    places: number;
    trips: number;
    weatherData: number;
  };
}

const getCategoryIcon = (categoryName?: string) => {
  switch (categoryName?.toLowerCase()) {
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

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return '☀️';
    case 'cloudy':
    case 'partly_cloudy':
      return '⛅';
    case 'rain':
    case 'light_rain':
      return '🌧️';
    case 'thunderstorm':
      return '⛈️';
    case 'snow':
      return '❄️';
    case 'fog':
      return '🌫️';
    default:
      return '☁️';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit'
  });
};

const CityDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const cityId = params.id as string;

  const [city, setCity] = useState<CityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'places' | 'trips' | 'weather'>('places');
  const [placeFilter, setPlaceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (cityId) {
      fetchCityDetail();
    }
  }, [cityId]);

  const fetchCityDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cities/${cityId}`);
       if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy thành phố');
        }
        throw new Error('Không thể tải thông tin thành phố');
      }
      
      const data = await response.json();
      setCity(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultImage = (cityName: string) => {
    const imageMap: Record<string, string> = {
      'Hà Nội': '/images/ha-noi.jpg',
      'TP. Hồ Chí Minh': '/images/sai-gon.jpg',
      'Đà Nẵng': '/images/da-nang.jpg',
      'Huế': '/images/hue.jpg',
      'Nha Trang': '/images/nha-trang.jpg',
      'Đà Lạt': '/images/da-lat.jpg'
    };
    return imageMap[cityName] || '/images/default-city.jpg';
  };

  const filteredPlaces = city?.places.filter(place => {
    const matchesName = place.name.toLowerCase().includes(placeFilter.toLowerCase());
    const matchesCategory = categoryFilter === '' || place.category?.name === categoryFilter;
    return matchesName && matchesCategory;
  }) || [];

  const categories = [...new Set(city?.places.map(place => place.category?.name).filter(Boolean))];

  if (isLoading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gray-300 rounded-xl mb-8"></div>
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

  if (error || !city) {
    return (
      <SharedLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-4">
              {error || 'Không tìm thấy thành phố'}
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

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="relative h-96 overflow-hidden">
          <Image
            src={city.imageUrl || getDefaultImage(city.name)}
            alt={city.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          <div className="absolute top-6 left-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {city.name}
              </h1>
              <div className="flex items-center text-white/90 text-lg mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{city.country}</span>
                {city.latitude && city.longitude && (
                  <span className="ml-4 text-sm">
                    {Number(city.latitude).toFixed(2)}, {Number(city.longitude).toFixed(2)}
                  </span>
                )}
              </div>
              {city.description && (
                <p className="text-white/90 text-lg max-w-3xl">
                  {city.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {city._count.places}
                </div>
                <div className="text-gray-600">Địa điểm</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {city._count.trips}
                </div>
                <div className="text-gray-600">Lịch trình</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {city._count.weatherData}
                </div>
                <div className="text-gray-600">Dữ liệu thời tiết</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('places')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'places'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Địa điểm ({city.places.length})
              </button>
              <button
                onClick={() => setActiveTab('trips')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'trips'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Lịch trình ({city.trips.length})
              </button>
              <button
                onClick={() => setActiveTab('weather')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'weather'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Thời tiết ({city.weatherData.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          {activeTab === 'places' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm kiếm địa điểm..."
                        value={placeFilter}
                        onChange={(e) => setPlaceFilter(e.target.value)}
                        className="w-full py-2 px-4 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Places Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaces.map(place => (
                  <Link
                    key={place.id}
                    href={`/places/${place.id}`}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="relative h-48">
                      <Image
                        src={place.imageUrl || '/images/default-place.jpg'}
                        alt={place.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {place.category && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                          {getCategoryIcon(place.category.name)}
                          <span className="ml-1 text-xs">{place.category.name}</span>
                        </div>
                      )}
                      {place.rating && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="ml-1 text-xs">{place.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{place.name}</h3>
                      {place.address && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{place.address}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {filteredPlaces.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    {placeFilter || categoryFilter ? 'Không tìm thấy địa điểm nào phù hợp' : 'Chưa có địa điểm nào'}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'trips' && (
            <div className="space-y-4">
              {city.trips.map(trip => (
                <Link
                  key={trip.id}
                  href={`/trip-planner/${trip.id}`}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600">
                        {trip.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{trip.destination}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-gray-600 text-sm">
                        <User className="w-4 h-4 mr-1" />
                        <span>{trip.user.username}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {city.trips.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">Chưa có lịch trình nào cho thành phố này</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {city.weatherData.map((weather, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{getWeatherIcon(weather.condition)}</div>
                    <div className="font-semibold text-gray-800 mb-1">
                      {formatDate(weather.date)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {weather.condition}
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Thermometer className="w-4 h-4 mr-1" />
                      <span>{weather.temperatureHigh}°/{weather.temperatureLow}°</span>
                    </div>
                  </div>
                </div>
              ))}

              {city.weatherData.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500">Chưa có dữ liệu thời tiết</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
};

export default CityDetailPage;