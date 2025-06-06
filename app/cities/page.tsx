// app/cities/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search, Grid, List } from 'lucide-react';
import SharedLayout from '../components/layout/SharedLayout';

interface City {
  id: number;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  _count: {
    places: number;
  };
}

const CitiesPage = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    // Filter cities based on search term
    const filtered = cities.filter(city =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [cities, searchTerm]);

  const fetchCities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cities');
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách thành phố');
      }
      
      const data = await response.json();
      setCities(data);
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

  if (error) {
    return (
      <SharedLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium">{error}</div>
            <button
              onClick={fetchCities}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
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
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Khám phá các thành phố
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tìm hiểu về các thành phố và khám phá những địa điểm thú vị tại mỗi nơi
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Tìm kiếm thành phố..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 px-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {searchTerm ? 'Không tìm thấy thành phố nào phù hợp' : 'Chưa có thành phố nào'}
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map(city => (
                <Link
                  key={city.id}
                  href={`/cities/${city.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
                >
                  <div className="relative h-48">
                    <Image
                      src={city.imageUrl || getDefaultImage(city.name)}
                      alt={city.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{city.name}</h3>
                      <p className="text-sm opacity-90">{city.country}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {city.description || `Khám phá ${city.name} và những địa điểm thú vị tại đây.`}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{city._count.places} địa điểm</span>
                      </div>
                      {city.latitude && city.longitude && (
                        <div className="text-xs">
                          {Number(city.latitude).toFixed(2)}, {Number(city.longitude).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCities.map(city => (
                <Link
                  key={city.id}
                  href={`/cities/${city.id}`}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group flex items-center gap-6"
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={city.imageUrl || getDefaultImage(city.name)}
                      alt={city.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{city.name}</h3>
                        <p className="text-gray-600 mb-2">{city.country}</p>
                        <p className="text-gray-600 line-clamp-2">
                          {city.description || `Khám phá ${city.name} và những địa điểm thú vị tại đây.`}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{city._count.places} địa điểm</span>
                        </div>
                        {city.latitude && city.longitude && (
                          <div className="text-xs mt-1">
                            {Number(city.latitude).toFixed(2)}, {Number(city.longitude).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {!isLoading && filteredCities.length > 0 && (
          <div className="bg-white">
            <div className="container mx-auto px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {filteredCities.length}
                  </div>
                  <div className="text-gray-600">Thành phố</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {filteredCities.reduce((total, city) => total + city._count.places, 0)}
                  </div>
                  <div className="text-gray-600">Tổng địa điểm</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {new Set(filteredCities.map(city => city.country)).size}
                  </div>
                  <div className="text-gray-600">Quốc gia</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
};

export default CitiesPage;