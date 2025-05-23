// app/trip-planner/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, Plus, Search, Clock, MapPin, ChevronRight, 
  MoreHorizontal, Trash2, Edit, Share, Compass, Map, Heart, User
} from 'lucide-react';

// Type definitions
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
}

// Sample data
const sampleTrips: Trip[] = [
  {
    id: 'trip1',
    name: 'Khám phá Hà Nội',
    destination: 'Hà Nội',
    startDate: '2025-04-20',
    endDate: '2025-04-23',
    coverImage: '/images/ha-noi.jpg',
    numDays: 4,
    placesCount: 12,
    status: 'planned',
    description: 'Khám phá các địa điểm nổi tiếng và ẩm thực đặc sắc của thủ đô nghìn năm văn hiến.'
  },
  {
    id: 'trip2',
    name: 'Du lịch Đà Nẵng - Hội An',
    destination: 'Đà Nẵng',
    startDate: '2025-05-10',
    endDate: '2025-05-15',
    coverImage: '/images/da-nang.jpg',
    numDays: 6,
    placesCount: 15,
    status: 'draft',
    description: 'Tham quan các bãi biển đẹp ở Đà Nẵng và khu phố cổ Hội An.'
  },
  {
    id: 'trip3',
    name: 'Khám phá Sài Gòn',
    destination: 'TP. Hồ Chí Minh',
    startDate: '2025-03-05',
    endDate: '2025-03-08',
    coverImage: '/images/sai-gon.jpg',
    numDays: 4,
    placesCount: 10,
    status: 'completed',
    description: 'Tham quan các địa điểm nổi tiếng và thưởng thức ẩm thực đường phố Sài Gòn.'
  },
  {
    id: 'trip4',
    name: 'Nghỉ dưỡng Phú Quốc',
    destination: 'Phú Quốc',
    startDate: '2025-06-15',
    endDate: '2025-06-20',
    coverImage: '/images/phu-quoc.webp',
    numDays: 6,
    placesCount: 8,
    status: 'draft',
    description: 'Nghỉ dưỡng tại các resort sang trọng và khám phá biển đảo Phú Quốc.'
  }
];

// Format date function
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'planned':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get status text
const getStatusText = (status: string) => {
  switch (status) {
    case 'draft':
      return 'Bản nháp';
    case 'planned':
      return 'Đã lên kế hoạch';
    case 'completed':
      return 'Đã hoàn thành';
    default:
      return status;
  }
};

export default function TripPlannerPage() {
  const [trips, setTrips] = useState<Trip[]>(sampleTrips);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  // States for new trip form
  const [newTrip, setNewTrip] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  
  // Filter trips based on search query and status
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus ? trip.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle delete trip
  const handleDeleteTrip = (id: string) => {
    setTripToDelete(id);
    setIsDeleting(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    if (tripToDelete) {
      setTrips(trips.filter(trip => trip.id !== tripToDelete));
      setTripToDelete(null);
      setIsDeleting(false);
    }
  };
  
  // Handle input change for new trip
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTrip({
      ...newTrip,
      [name]: value
    });
  };
  
  // Handle create trip
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!newTrip.name || !newTrip.destination || !newTrip.startDate || !newTrip.endDate) {
      return;
    }
    
    // Calculate number of days
    const start = new Date(newTrip.startDate);
    const end = new Date(newTrip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Create new trip
    const trip: Trip = {
      id: `trip${trips.length + 1}`,
      name: newTrip.name,
      destination: newTrip.destination,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      coverImage: '/images/default-trip.jpg', // Default image
      numDays: diffDays,
      placesCount: 0,
      status: 'draft',
      description: newTrip.description
    };
    
    // Add to trips array
    setTrips([...trips, trip]);
    
    // Reset form and close modal
    setNewTrip({
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      description: ''
    });
    setShowCreateModal(false);
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
              <h1 className="text-2xl font-bold text-gray-800">Lịch trình du lịch</h1>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>Tạo lịch trình mới</span>
              </button>
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
                placeholder="Tìm kiếm lịch trình..."
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
            
            {/* Status filter */}
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  filterStatus === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterStatus(null)}
              >
                Tất cả
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  filterStatus === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterStatus(filterStatus === 'draft' ? null : 'draft')}
              >
                Bản nháp
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  filterStatus === 'planned' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterStatus(filterStatus === 'planned' ? null : 'planned')}
              >
                Đã lên kế hoạch
              </button>
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  filterStatus === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilterStatus(filterStatus === 'completed' ? null : 'completed')}
              >
                Đã hoàn thành
              </button>
            </div>
          </div>
        </div>
        
        {/* No trips message */}
        {filteredTrips.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Không có lịch trình nào</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery || filterStatus
                ? 'Không có lịch trình nào phù hợp với điều kiện tìm kiếm của bạn. Hãy thử tìm kiếm khác hoặc bỏ bộ lọc.'
                : 'Bạn chưa tạo lịch trình du lịch nào. Hãy bắt đầu tạo lịch trình đầu tiên của bạn.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Tạo lịch trình mới</span>
            </button>
          </div>
        )}
        
        {/* Trips grid */}
        {filteredTrips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTrips.map(trip => (
              <div key={trip.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="relative h-48 w-full">
                    <Image
                      src={trip.coverImage}
                      alt={trip.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div 
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}
                  >
                    {getStatusText(trip.status)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{trip.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{trip.destination}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Clock className="w-4 h-4 mr-1.5" />
                    <span>{trip.numDays} ngày</span>
                    <span className="mx-2">•</span>
                    <MapPin className="w-4 h-4 mr-1.5" />
                    <span>{trip.placesCount} địa điểm</span>
                  </div>
                  
                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <Link
                      href={`/trip-planner/${trip.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                    
                    <div className="relative">
                      <button 
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          const dropdown = document.getElementById(`dropdown-${trip.id}`);
                          if (dropdown) {
                            dropdown.classList.toggle('hidden');
                          }
                        }}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      <div 
                        id={`dropdown-${trip.id}`} 
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden"
                      >
                        <div className="py-1">
                          <Link
                            href={`/trip-planner/${trip.id}/edit`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            <span>Chỉnh sửa</span>
                          </Link>
                          <Link
                            href={`/trip-planner/${trip.id}/share`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Share className="w-4 h-4 mr-2" />
                            <span>Chia sẻ</span>
                          </Link>
                          <button
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => handleDeleteTrip(trip.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Create trip modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Tạo lịch trình mới</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCreateModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateTrip}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Tên lịch trình <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newTrip.name}
                      onChange={handleInputChange}
                      placeholder="Nhập tên lịch trình"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                      Điểm đến <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      value={newTrip.destination}
                      onChange={handleInputChange}
                      placeholder="Nhập thành phố/địa điểm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={newTrip.startDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={newTrip.endDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={newTrip.startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={newTrip.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả ngắn về chuyến đi của bạn"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Tạo lịch trình
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Xác nhận xóa</h2>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa lịch trình này? Hành động này không thể hoàn tác.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleting(false);
                  setTripToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg z-10 lg:hidden">
        <div className="grid grid-cols-4 h-16">
          <Link
            href="/dashboard"
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
            className="flex flex-col items-center justify-center text-gray-500"
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs mt-1">Đã lưu</span>
          </Link>
          <Link
            href="/account"
            className="flex flex-col items-center justify-center text-gray-500"
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Tài khoản</span>
          </Link>
        </div>
      </div>
    </div>
  );
}