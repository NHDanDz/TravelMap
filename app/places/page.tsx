// app/places/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, Search, Grid, List, Star, 
  Coffee, Hotel, Utensils, Landmark, Clock
} from 'lucide-react';
import SharedLayout from '../components/layout/SharedLayout';

interface Category {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  _count: {
    places: number;
  };
}

interface City {
  id: number;
  name: string;
  country: string;
}

interface Place {
  id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating?: number;
  priceLevel?: string;
  openingHours?: string;
  avgDurationMinutes?: number;
  category?: Category;
  city?: City;
  photos?: {
    url: string;
    isPrimary: boolean;
  }[];
}

interface PlacesResponse {
  places: Place[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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

const getPriceIcon = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'cheap':
      return '$';
    case 'moderate':
      return '$$';
    case 'expensive':
      return '$$$';
    default:
      return '';
  }
};

const PlacesPage = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [searchTerm, selectedCategory, selectedCity, currentPage]);

  const fetchInitialData = async () => {
    try {
      // Fetch categories and cities
      const [categoriesRes, citiesRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/cities')
      ]);
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }
      
      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(citiesData);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchPlaces = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedCity) params.append('city', selectedCity);

      const response = await fetch(`/api/places?${params}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách địa điểm');
      }
      
      const data: PlacesResponse = await response.json();
      setPlaces(data.places);
      setPagination(data.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCity('');
    setCurrentPage(1);
  };

  if (error) {
    return (
      <SharedLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium">{error}</div>
            <button
              onClick={fetchPlaces}
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
                Khám phá địa điểm
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tìm kiếm và khám phá những nhà hàng, quán cà phê, khách sạn và địa điểm du lịch hấp dẫn
              </p>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm địa điểm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 px-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name} ({category._count.places})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả thành phố</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.name}>
                      {city.name}, {city.country}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Đặt lại
                  </button>
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
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-600">
              Tìm thấy <span className="font-semibold">{pagination.total}</span> địa điểm
            </div>
            <div className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages}
            </div>
          </div>

          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className={viewMode === 'grid' ? 'bg-white rounded-xl overflow-hidden shadow-md animate-pulse' : 'bg-white rounded-xl p-6 shadow-md animate-pulse flex items-center gap-6'}>
                  <div className={viewMode === 'grid' ? 'h-48 bg-gray-300' : 'w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0'}></div>
                  <div className={viewMode === 'grid' ? 'p-6' : 'flex-1'}>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {searchTerm || selectedCategory || selectedCity ? 'Không tìm thấy địa điểm nào phù hợp' : 'Chưa có địa điểm nào'}
              </div>
              {(searchTerm || selectedCategory || selectedCity) && (
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map(place => (
                <Link
                  key={place.id}
                  href={`/places/${place.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
                >
                  <div className="relative h-48">
                    <Image
                      src={place.photos?.[0]?.url || place.imageUrl || '/images/default-place.jpg'}
                      alt={place.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {place.category && (
                        <div className="bg-white/90 backdrop-blur-sm py-1 px-3 rounded-full flex items-center">
                          {getCategoryIcon(place.category.name)}
                          <span className="ml-1 text-xs">{place.category.name}</span>
                        </div>
                      )}
                      {place.priceLevel && (
                        <div className="bg-white/90 backdrop-blur-sm py-1 px-2 rounded-full text-xs font-medium">
                          {getPriceIcon(place.priceLevel)}
                        </div>
                      )}
                    </div>
                    {place.rating && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm py-1 px-2 rounded-full flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="ml-1 text-xs">{place.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{place.name}</h3>
                    {place.address && (
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{place.address}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        {place.city && (
                          <span>{place.city.name}</span>
                        )}
                      </div>
                      {place.avgDurationMinutes && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{Math.round(place.avgDurationMinutes / 60)}h</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {places.map(place => (
                <Link
                  key={place.id}
                  href={`/places/${place.id}`}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group flex items-center gap-6"
                >
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={place.photos?.[0]?.url || place.imageUrl || '/images/default-place.jpg'}
                      alt={place.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{place.name}</h3>
                        {place.address && (
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{place.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {place.category && (
                            <div className="flex items-center">
                              {getCategoryIcon(place.category.name)}
                              <span className="ml-1">{place.category.name}</span>
                            </div>
                          )}
                          {place.city && (
                            <span>{place.city.name}</span>
                          )}
                          {place.avgDurationMinutes && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{Math.round(place.avgDurationMinutes / 60)}h</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {place.rating && (
                          <div className="flex items-center mb-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 font-medium">{place.rating}</span>
                          </div>
                        )}
                        {place.priceLevel && (
                          <div className="text-sm font-medium">
                            {getPriceIcon(place.priceLevel)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (page > pagination.totalPages) return null;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`py-2 px-4 border rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
};

export default PlacesPage;