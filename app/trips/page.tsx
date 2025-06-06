// app/trips/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPin, Search, Grid, List, Calendar, Users, 
  Clock, Plus, Eye, Edit, Trash2, MoreVertical
} from 'lucide-react';
import SharedLayout from '../components/layout/SharedLayout';
import { AuthService } from '@/lib/auth';

interface City {
  id: number;
  name: string;
  country: string;
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  numDays: number;
  placesCount: number;
  status: 'draft' | 'planned' | 'completed';
  description?: string;
  createdBy: 'manual' | 'ai';
  tags?: string[];
  estimatedBudget?: number;
  travelCompanions?: number;
  city?: City;
}

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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const calculateDaysBetween = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
};

const TripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUserTripsOnly, setShowUserTripsOnly] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    fetchTrips();
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, showUserTripsOnly, user]);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (showUserTripsOnly && user) params.append('userId', user.id);

      const response = await fetch(`/api/trips?${params}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách lịch trình');
      }
      
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = !searchTerm || 
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setShowUserTripsOnly(false);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) return;
    
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTrips(trips.filter(trip => trip.id !== tripId));
      } else {
        throw new Error('Không thể xóa lịch trình');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa lịch trình');
    }
  };

  if (error) {
    return (
      <SharedLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium">{error}</div>
            <button
              onClick={fetchTrips}
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Lịch trình du lịch
                </h1>
                <p className="text-xl text-gray-600">
                  Khám phá và lên kế hoạch cho những chuyến đi tuyệt vời
                </p>
              </div>
              
              {user && (
                <Link
                  href="/trip-planner"
                  className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo lịch trình mới
                </Link>
              )}
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm lịch trình..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 px-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="draft">Nháp</option>
                  <option value="planned">Đã lên kế hoạch</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>

                {user && (
                  <label className="flex items-center py-3 px-4 border border-gray-300 rounded-lg bg-white">
                    <input
                      type="checkbox"
                      checked={showUserTripsOnly}
                      onChange={(e) => setShowUserTripsOnly(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Lịch trình của tôi</span>
                  </label>
                )}

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
              Tìm thấy <span className="font-semibold">{filteredTrips.length}</span> lịch trình
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
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {searchTerm || statusFilter || showUserTripsOnly ? 'Không tìm thấy lịch trình nào phù hợp' : 'Chưa có lịch trình nào'}
              </div>
              {user && !showUserTripsOnly && (
                <Link
                  href="/trip-planner"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo lịch trình đầu tiên
                </Link>
              )}
              {(searchTerm || statusFilter || showUserTripsOnly) && (
                <button
                  onClick={resetFilters}
                  className="ml-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group">
                  <Link href={`/trips/${trip.id}`} className="block">
                    <div className="relative h-48">
                      <Image
                        src={trip.coverImage}
                        alt={trip.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {getStatusText(trip.status)}
                        </span>
                        {trip.createdBy === 'ai' && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                            AI
                          </span>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="relative group/menu">
                          <button className="text-white bg-black/30 backdrop-blur-sm p-1 rounded hover:bg-black/50 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {/* Dropdown menu would go here */}
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <Link href={`/trips/${trip.id}`}>
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-1 hover:text-blue-600">
                        {trip.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">{trip.destination}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm mb-4">
                      <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{trip.numDays} ngày</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{trip.placesCount} địa điểm</span>
                      </div>
                    </div>
                    
                    {trip.tags && trip.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {trip.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {trip.tags.length > 3 && (
                          <span className="text-gray-500 text-xs">+{trip.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrips.map(trip => (
                <div key={trip.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow group flex items-center gap-6">
                  <Link href={`/trips/${trip.id}`} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={trip.coverImage}
                      alt={trip.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link href={`/trips/${trip.id}`}>
                            <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600">
                              {trip.name}
                            </h3>
                          </Link>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                            {getStatusText(trip.status)}
                          </span>
                          {trip.createdBy === 'ai' && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              AI
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{trip.destination}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                        </div>
                        
                        {trip.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {trip.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{trip.numDays} ngày</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{trip.placesCount} địa điểm</span>
                          </div>
                          {trip.travelCompanions && (
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              <span>{trip.travelCompanions} người</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {user && (
                          <>
                            <Link
                              href={`/trips/${trip.id}/edit`}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteTrip(trip.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {!isLoading && filteredTrips.length > 0 && (
          <div className="bg-white">
            <div className="container mx-auto px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {filteredTrips.length}
                  </div>
                  <div className="text-gray-600">Lịch trình</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {filteredTrips.reduce((total, trip) => total + trip.placesCount, 0)}
                  </div>
                  <div className="text-gray-600">Địa điểm</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {filteredTrips.reduce((total, trip) => total + trip.numDays, 0)}
                  </div>
                  <div className="text-gray-600">Tổng ngày</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {new Set(filteredTrips.map(trip => trip.destination)).size}
                  </div>
                  <div className="text-gray-600">Điểm đến</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
};

export default TripsPage;