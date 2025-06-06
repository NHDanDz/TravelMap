// app/admin/places/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Edit, Trash2, MapPin, Star, ExternalLink, Image as ImageIcon,
  AlertCircle, X, ChevronLeft, ChevronRight
} from 'lucide-react';

interface Place {
  id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating?: number;
  openingHours?: string;
  contactInfo?: string;
  website?: string;
  avgDurationMinutes?: number;
  priceLevel?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: {
    id: number;
    name: string;
  };
  city?: {
    id: number;
    name: string;
  };
  _count?: {
    reviews: number;
    savedBy: number;
  };
}

interface Category {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface PlaceFormData {
  name: string;
  categoryId: string | number;
  cityId: string | number;
  address: string;
  description: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  openingHours: string;
  contactInfo: string;
  website: string;
  avgDurationMinutes: string;
  priceLevel: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminPlacesPage = () => {
  // State for data
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters and search (sẽ gửi lên server)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('rating'); // Sort ở server
  
  // State for pagination
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<PlaceFormData>({
    name: '',
    categoryId: '',
    cityId: '',
    address: '',
    description: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
    openingHours: '',
    contactInfo: '',
    website: '',
    avgDurationMinutes: '',
    priceLevel: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Debounced search để tránh gọi API quá nhiều
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch data function với server-side pagination
  const fetchData = useCallback(async (
    page: number = pagination.page,
    limit: number = pagination.limit,
    search: string = searchTerm,
    category: string = selectedCategory,
    city: string = selectedCity,
    sort: string = sortBy
  ) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching data with params:', { page, limit, search, category, city, sort });
      
      // Build query parameters for places API
      const placesParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      // Add filters if they exist
      if (search.trim()) {
        placesParams.set('search', search.trim());
      }
      if (category) {
        // Gửi categoryId trực tiếp
        placesParams.set('categoryId', category);
        console.log('🏷️ Adding categoryId filter:', category);
      }
      if (city) {
        // Gửi cityId trực tiếp
        placesParams.set('cityId', city);
        console.log('🏙️ Adding cityId filter:', city);
      }
      
      console.log('🔗 Final API URL:', `/api/admin/places?${placesParams.toString()}`);
      
      const [placesRes, categoriesRes, citiesRes] = await Promise.all([
        fetch(`/api/admin/places?${placesParams.toString()}`),
        categories.length === 0 ? fetch('/api/categories') : Promise.resolve(null),
        cities.length === 0 ? fetch('/api/cities') : Promise.resolve(null)
      ]);

      console.log('📡 Response status:', {
        places: placesRes.status,
        categories: categoriesRes?.status || 'cached',
        cities: citiesRes?.status || 'cached'
      });

      if (!placesRes.ok) {
        throw new Error(`Failed to fetch places - Status: ${placesRes.status}`);
      }

      const placesData = await placesRes.json();
      console.log('📦 Places API response:', placesData);

      // Chỉ fetch categories và cities lần đầu
      if (categoriesRes && !categoriesRes.ok) {
        throw new Error(`Failed to fetch categories - Status: ${categoriesRes.status}`);
      }
      if (citiesRes && !citiesRes.ok) {
        throw new Error(`Failed to fetch cities - Status: ${citiesRes.status}`);
      }

      const [categoriesData, citiesData] = await Promise.all([
        categoriesRes ? categoriesRes.json() : categories,
        citiesRes ? citiesRes.json() : cities
      ]);

      // Update state
      setPlaces(placesData.places || []);
      if (categoriesRes) setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      if (citiesRes) setCities(Array.isArray(citiesData) ? citiesData : []);
      
      // Update pagination với data từ server
      setPagination({
        total: placesData.pagination?.total || 0,
        page: placesData.pagination?.page || 1,
        limit: placesData.pagination?.limit || limit,
        totalPages: placesData.pagination?.totalPages || 0
      });

      console.log('✅ Data updated:', {
        places: placesData.places?.length || 0,
        total: placesData.pagination?.total || 0,
        currentPage: placesData.pagination?.page || 1,
        totalPages: placesData.pagination?.totalPages || 0
      });
      
    } catch (err) {
      console.error('❌ Error in fetchData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, selectedCategory, selectedCity, sortBy]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Handle search với debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      fetchData(1, pagination.limit, value, selectedCategory, selectedCity, sortBy);
    }, 500); // Delay 500ms
    
    setSearchDebounceTimer(timer);
  }, [searchDebounceTimer, pagination.limit, selectedCategory, selectedCity, sortBy]);

  // Handle filter changes
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    // Reset về trang 1 khi thay đổi filter
    fetchData(1, pagination.limit, searchTerm, category, selectedCity, sortBy);
  }, [pagination.limit, searchTerm, selectedCity, sortBy]);

  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
    // Reset về trang 1 khi thay đổi filter
    fetchData(1, pagination.limit, searchTerm, selectedCategory, city, sortBy);
  }, [pagination.limit, searchTerm, selectedCategory, sortBy]);

  const handleSortChange = useCallback((sort: string) => {
    setSortBy(sort);
    // Giữ nguyên trang hiện tại khi sort
    fetchData(pagination.page, pagination.limit, searchTerm, selectedCategory, selectedCity, sort);
  }, [pagination.page, pagination.limit, searchTerm, selectedCategory, selectedCity]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchData(page, pagination.limit, searchTerm, selectedCategory, selectedCity, sortBy);
    }
  }, [pagination.totalPages, pagination.limit, searchTerm, selectedCategory, selectedCity, sortBy]);

  const handleLimitChange = useCallback((limit: number) => {
    fetchData(1, limit, searchTerm, selectedCategory, selectedCity, sortBy);
  }, [searchTerm, selectedCategory, selectedCity, sortBy]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      cityId: '',
      address: '',
      description: '',
      latitude: '',
      longitude: '',
      imageUrl: '',
      openingHours: '',
      contactInfo: '',
      website: '',
      avgDurationMinutes: '',
      priceLevel: ''
    });
  };

  const handleAdd = () => {
    resetForm();
    setSelectedPlace(null);
    setShowAddModal(true);
  };
  
  const handleEdit = (place: Place) => {
    setFormData({
      name: place.name,
      categoryId: place.category?.id || '',
      cityId: place.city?.id || '',
      address: place.address || '',
      description: '',
      latitude: place.latitude.toString(),
      longitude: place.longitude.toString(),
      imageUrl: place.imageUrl || '',
      openingHours: place.openingHours || '',
      contactInfo: place.contactInfo || '',
      website: place.website || '',
      avgDurationMinutes: place.avgDurationMinutes?.toString() || '',
      priceLevel: place.priceLevel || ''
    });
    setSelectedPlace(place);
    setShowEditModal(true);
  };

  const handleDelete = (place: Place) => {
    setSelectedPlace(place);
    setShowDeleteModal(true);
  };

  const submitForm = async (isEdit: boolean) => {
    try {
      setFormLoading(true);
      
      const payload = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId.toString()) : null,
        cityId: formData.cityId ? parseInt(formData.cityId.toString()) : null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        avgDurationMinutes: formData.avgDurationMinutes ? parseInt(formData.avgDurationMinutes) : null
      };

      const url = isEdit ? `/api/admin/places/${selectedPlace?.id}` : '/api/admin/places';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save place');
      }

      // Refresh current page data
      await fetchData();
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      setSelectedPlace(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save place');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPlace) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/admin/places/${selectedPlace.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete place');
      }

      // Refresh current page data
      await fetchData();
      setShowDeleteModal(false);
      setSelectedPlace(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete place');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPriceLevelText = (level?: string) => {
    switch (level) {
      case 'budget': return 'Bình dân';
      case 'mid': return 'Trung bình';
      case 'high': return 'Cao cấp';
      case 'luxury': return 'Sang trọng';
      default: return 'Chưa xác định';
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { page: currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading && places.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý địa điểm</h1>
          <p className="text-gray-600">Quản lý tất cả địa điểm trong hệ thống</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Thêm địa điểm
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {loading && searchTerm && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => {
              console.log('🔄 Category changed:', e.target.value);
              handleCategoryChange(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedCity}
            onChange={(e) => {
              console.log('🔄 City changed:', e.target.value);
              handleCityChange(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả thành phố</option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => {
              console.log('🔄 Sort changed:', e.target.value);
              handleSortChange(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Sắp xếp theo đánh giá</option>
            <option value="name">Sắp xếp theo tên</option>
            <option value="createdAt">Sắp xếp theo ngày tạo</option>
          </select>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total} địa điểm
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600">mục/trang</span>
          </div>
        </div>
      </div>

      {/* Places Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thành phố
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mức giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {places.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {place.imageUrl ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={place.imageUrl}
                            alt={place.name}
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {place.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {place.address || 'Chưa có địa chỉ'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {place.category?.name || 'Chưa phân loại'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {place.city?.name || 'Chưa xác định'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-900">
                        {place.rating ? parseFloat(place.rating.toString()).toFixed(1) : 'N/A'}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">
                        ({place._count?.reviews || 0})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getPriceLevelText(place.priceLevel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(place.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900"
                          title="Xem website"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(place)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(place)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {places.length === 0 && !loading && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy địa điểm</h3>
            <p className="mt-1 text-sm text-gray-500">
              Thử thay đổi bộ lọc hoặc thêm địa điểm mới.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            {/* Mobile pagination */}
            <div className="flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-gray-700 flex items-center">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            
            {/* Desktop pagination */}
            <div className="hidden sm:flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> trong{' '}
                  <span className="font-medium">{pagination.total}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((pageNum, index) => {
                    if (pageNum === '...') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    const isCurrentPage = pageNum === pagination.page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum as number)}
                        disabled={loading}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } disabled:opacity-50`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || loading}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {showAddModal ? 'Thêm địa điểm mới' : 'Chỉnh sửa địa điểm'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên địa điểm *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập tên địa điểm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Danh mục
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thành phố
                      </label>
                      <select
                        value={formData.cityId}
                        onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn thành phố</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mức giá
                      </label>
                      <select
                        value={formData.priceLevel}
                        onChange={(e) => setFormData({...formData, priceLevel: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chọn mức giá</option>
                        <option value="budget">Bình dân</option>
                        <option value="mid">Trung bình</option>
                        <option value="high">Cao cấp</option>
                        <option value="luxury">Sang trọng</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vĩ độ *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10.762622"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kinh độ *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="106.660172"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL hình ảnh
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ mở cửa
                      </label>
                      <input
                        type="text"
                        value={formData.openingHours}
                        onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8:00 - 22:00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thời gian tham quan (phút)
                      </label>
                      <input
                        type="number"
                        value={formData.avgDurationMinutes}
                        onChange={(e) => setFormData({...formData, avgDurationMinutes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="60"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thông tin liên hệ
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo}
                        onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0123 456 789"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => submitForm(showEditModal)}
                  disabled={formLoading || !formData.name || !formData.latitude || !formData.longitude}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Đang lưu...' : (showAddModal ? 'Thêm địa điểm' : 'Cập nhật')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPlace && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Xóa địa điểm
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa địa điểm "{selectedPlace.name}"? 
                        Thao tác này không thể hoàn tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={formLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {formLoading ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPlace(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlacesPage;