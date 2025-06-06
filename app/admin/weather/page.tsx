// app/admin/weather/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CloudRain, Search, Plus, Edit, Trash2, Download,
  Sun, Cloud, CloudSnow, Thermometer, Droplets, Wind,
  Calendar, MapPin, RefreshCw, AlertCircle, X,  
  TrendingUp, TrendingDown, Activity, ChevronLeft, ChevronRight
} from 'lucide-react';

interface WeatherData {
  id: number;
  cityId: number;
  date: string;
  temperatureHigh?: number;
  temperatureLow?: number;
  condition?: string;
  precipitationChance?: number;
  humidity?: number;
  windSpeed?: number;
  createdAt: string;
  updatedAt?: string;
  city: {
    id: number;
    name: string;
    country: string;
  };
}

interface WeatherStats {
  totalRecords: number;
  citiesWithData: number;
  latestUpdate: string;
  avgTemperature: number;
  recordsThisMonth: number;
}

interface WeatherFormData {
  cityId: string;
  date: string;
  temperatureHigh: string;
  temperatureLow: string;
  condition: string;
  precipitationChance: string;
  humidity: string;
  windSpeed: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const AdminWeatherPage = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [cities, setCities] = useState<{id: number; name: string; country: string}[]>([]);
  const [stats, setStats] = useState<WeatherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('week');
  const [sortBy, setSortBy] = useState<string>('date');
  
  // Pagination
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState<WeatherData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<WeatherFormData>({
    cityId: '',
    date: '',
    temperatureHigh: '',
    temperatureLow: '',
    condition: '',
    precipitationChance: '',
    humidity: '',
    windSpeed: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Weather conditions
  const weatherConditions = [
    'sunny', 'partly_cloudy', 'cloudy', 'overcast',
    'light_rain', 'rain', 'heavy_rain', 'thunderstorm',
    'snow', 'fog', 'windy'
  ];

  const conditionLabels: Record<string, string> = {
    sunny: 'Nắng',
    partly_cloudy: 'Ít mây',
    cloudy: 'Nhiều mây',
    overcast: 'U ám',
    light_rain: 'Mưa nhẹ',
    rain: 'Mưa',
    heavy_rain: 'Mưa to',
    thunderstorm: 'Dông bão',
    snow: 'Tuyết',
    fog: 'Sương mù',
    windy: 'Có gió'
  };

  // Load data when server-side filters or pagination change
  useEffect(() => {
    fetchData();
  }, [pagination.page, selectedCity, selectedCondition, dateRange, sortBy]);

  // Reset to page 1 when server-side filters change (excluding searchTerm)
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    } else {
      fetchData();
    }
  }, [selectedCity, selectedCondition, dateRange]); // Removed searchTerm from dependencies

  // Load cities and stats on mount
  useEffect(() => {
    fetchCitiesAndStats();
  }, []);

  const fetchCitiesAndStats = async () => {
    try {
      const [citiesRes, statsRes] = await Promise.all([
        fetch('/api/cities'),
        fetch('/api/admin/weather/stats')
      ]);

      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(citiesData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching cities and stats:', err);
    }
  };

  const buildApiUrl = () => {
    const params = new URLSearchParams();
    params.set('page', pagination.page.toString());
    params.set('limit', pagination.limit.toString());
    
    if (selectedCity) params.set('cityId', selectedCity);
    if (selectedCondition) params.set('condition', selectedCondition);
    if (dateRange && dateRange !== 'all') params.set('dateRange', dateRange);
    if (sortBy) params.set('sortBy', sortBy);
    
    return `/api/admin/weather?${params.toString()}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl());

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const result = await response.json();
      
      // Handle both array and object response
      if (result.data && result.pagination) {
        setWeatherData(result.data);
        setPagination(result.pagination);
      } else if (Array.isArray(result)) {
        setWeatherData(result);
        setPagination(prev => ({ ...prev, total: result.length, totalPages: 1 }));
      } else {
        setWeatherData([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setWeatherData([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for search term with debouncing effect
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return weatherData;
    
    const searchLower = searchTerm.toLowerCase();
    return weatherData.filter(item => 
      item.city.name.toLowerCase().includes(searchLower) ||
      item.city.country.toLowerCase().includes(searchLower)
    );
  }, [weatherData, searchTerm]);

  // Debounced search term to improve performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Use debounced search term for actual filtering
  const finalFilteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return weatherData;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return weatherData.filter(item => 
      item.city.name.toLowerCase().includes(searchLower) ||
      item.city.country.toLowerCase().includes(searchLower)
    );
  }, [weatherData, debouncedSearchTerm]);

  const resetForm = () => {
    setFormData({
      cityId: '',
      date: '',
      temperatureHigh: '',
      temperatureLow: '',
      condition: '',
      precipitationChance: '',
      humidity: '',
      windSpeed: ''
    });
  };

  const handleAdd = () => {
    resetForm();
    setSelectedWeather(null);
    setShowAddModal(true);
  };

  const handleEdit = (weather: WeatherData) => {
    setFormData({
      cityId: weather.cityId.toString(),
      date: weather.date,
      temperatureHigh: weather.temperatureHigh?.toString() || '',
      temperatureLow: weather.temperatureLow?.toString() || '',
      condition: weather.condition || '',
      precipitationChance: weather.precipitationChance?.toString() || '',
      humidity: weather.humidity?.toString() || '',
      windSpeed: weather.windSpeed?.toString() || ''
    });
    setSelectedWeather(weather);
    setShowEditModal(true);
  };

  const handleDelete = (weather: WeatherData) => {
    setSelectedWeather(weather);
    setShowDeleteModal(true);
  };

  const submitForm = async (isEdit: boolean) => {
    try {
      setFormLoading(true);
      
      const payload = {
        ...formData,
        cityId: parseInt(formData.cityId),
        temperatureHigh: formData.temperatureHigh ? parseFloat(formData.temperatureHigh) : null,
        temperatureLow: formData.temperatureLow ? parseFloat(formData.temperatureLow) : null,
        precipitationChance: formData.precipitationChance ? parseFloat(formData.precipitationChance) : null,
        humidity: formData.humidity ? parseFloat(formData.humidity) : null,
        windSpeed: formData.windSpeed ? parseFloat(formData.windSpeed) : null
      };

      const url = isEdit ? `/api/admin/weather/${selectedWeather?.id}` : '/api/admin/weather';
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
        throw new Error(errorData.error || 'Failed to save weather data');
      }

      await fetchData();
      await fetchCitiesAndStats(); // Refresh stats
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      setSelectedWeather(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save weather data');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedWeather) return;

    try {
      setFormLoading(true);
      const response = await fetch(`/api/admin/weather/${selectedWeather.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete weather data');
      }

      await fetchData();
      await fetchCitiesAndStats(); // Refresh stats
      setShowDeleteModal(false);
      setSelectedWeather(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete weather data');
    } finally {
      setFormLoading(false);
    }
  };

  const syncWeatherData = async () => {
    try {
      setFormLoading(true);
      const response = await fetch('/api/admin/weather/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync weather data');
      }

      await fetchData();
      await fetchCitiesAndStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync weather data');
    } finally {
      setFormLoading(false);
    }
  };

  const exportWeatherData = async () => {
    try {
      const response = await fetch('/api/admin/weather/export');
      if (!response.ok) {
        throw new Error('Failed to export weather data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `weather_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export weather data');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getWeatherIcon = (condition?: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'partly_cloudy':
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-gray-500" />;
      case 'rain':
      case 'light_rain':
      case 'heavy_rain':
      case 'thunderstorm':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="h-5 w-5 text-blue-300" />;
      default:
        return <CloudRain className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTodayDateString = () => {
    const today = new Date();
     return today.toISOString().split('T')[0];
  };

  if (loading && pagination.page === 1) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý dữ liệu thời tiết</h1>
          <p className="text-gray-600">Cập nhật và quản lý thông tin thời tiết cho các thành phố</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={syncWeatherData}
            disabled={formLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${formLoading ? 'animate-spin' : ''}`} />
            Đồng bộ API
          </button>
          <button
            onClick={exportWeatherData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Xuất dữ liệu
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Thêm dữ liệu
          </button>
        </div>
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

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CloudRain className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng bản ghi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Thành phố có dữ liệu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.citiesWithData}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Thermometer className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Nhiệt độ TB</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgTemperature.toFixed(1)}°C</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cập nhật cuối</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatDate(stats.latestUpdate)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tháng này</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recordsThisMonth}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thành phố..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả thành phố</option>
            {cities.map(city => (
              <option key={city.id} value={city.id.toString()}>
                {city.name}, {city.country}
              </option>
            ))}
          </select>
          
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả thời tiết</option>
            {weatherConditions.map(condition => (
              <option key={condition} value={condition}>
                {conditionLabels[condition]}
              </option>
            ))}
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm này</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Theo ngày</option>
            <option value="city">Theo thành phố</option>
            <option value="temp_high">Nhiệt độ cao</option>
            <option value="temp_low">Nhiệt độ thấp</option>
            <option value="condition">Theo thời tiết</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Hiển thị: {finalFilteredData.length} / {pagination.total}
          </div>
        </div>
      </div>

      {/* Weather Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading && pagination.page > 1 && (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thành phố & Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời tiết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhiệt độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chi tiết
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {finalFilteredData.map((weather) => (
                <tr key={weather.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {weather.city.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {weather.city.country}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {formatDate(weather.date)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getWeatherIcon(weather.condition)}
                      <span className="ml-2 text-sm">
                        {conditionLabels[weather.condition || ''] || weather.condition || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {weather.temperatureHigh && (
                        <div className="flex items-center text-red-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">
                            {weather.temperatureHigh}°C
                          </span>
                        </div>
                      )}
                      {weather.temperatureLow && (
                        <div className="flex items-center text-blue-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">
                            {weather.temperatureLow}°C
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 space-y-1">
                      {weather.precipitationChance && (
                        <div className="flex items-center">
                          <Droplets className="h-4 w-4 mr-1" />
                          <span>{weather.precipitationChance}% mưa</span>
                        </div>
                      )}
                      {weather.humidity && (
                        <div className="flex items-center">
                          <Cloud className="h-4 w-4 mr-1" />
                          <span>{weather.humidity}% độ ẩm</span>
                        </div>
                      )}
                      {weather.windSpeed && (
                        <div className="flex items-center">
                          <Wind className="h-4 w-4 mr-1" />
                          <span>{weather.windSpeed} km/h</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(weather)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(weather)}
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
        
        {finalFilteredData.length === 0 && !loading && (
          <div className="text-center py-12">
            <CloudRain className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy dữ liệu thời tiết</h3>
            <p className="mt-1 text-sm text-gray-500">
              Thử thay đổi bộ lọc hoặc thêm dữ liệu mới.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">{pagination.total}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    const isCurrentPage = pageNum === pagination.page;
                    
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            isCurrentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    
                    // Show ellipsis
                    if (
                      (pageNum === pagination.page - 2 && pagination.page > 3) ||
                      (pageNum === pagination.page + 2 && pagination.page < pagination.totalPages - 2)
                    ) {
                      return (
                        <span
                          key={pageNum}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
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
                    {showAddModal ? 'Thêm dữ liệu thời tiết' : 'Chỉnh sửa dữ liệu thời tiết'}
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
                        Thành phố *
                      </label>
                      <select
                        value={formData.cityId}
                        onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Chọn thành phố</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id.toString()}>
                            {city.name}, {city.country}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        max={getTodayDateString()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nhiệt độ cao nhất (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="-50"
                        max="60"
                        value={formData.temperatureHigh}
                        onChange={(e) => setFormData({...formData, temperatureHigh: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="35.0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nhiệt độ thấp nhất (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="-50"
                        max="60"
                        value={formData.temperatureLow}
                        onChange={(e) => setFormData({...formData, temperatureLow: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="25.0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tình trạng thời tiết
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({...formData, condition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn tình trạng</option>
                      {weatherConditions.map(condition => (
                        <option key={condition} value={condition}>
                          {conditionLabels[condition]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Xác suất mưa (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.precipitationChance}
                        onChange={(e) => setFormData({...formData, precipitationChance: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="30"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Độ ẩm (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.humidity}
                        onChange={(e) => setFormData({...formData, humidity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="70"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tốc độ gió (km/h)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.1"
                        value={formData.windSpeed}
                        onChange={(e) => setFormData({...formData, windSpeed: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="15.0"
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => submitForm(showEditModal)}
                  disabled={formLoading || !formData.cityId || !formData.date}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? 'Đang lưu...' : (showAddModal ? 'Thêm dữ liệu' : 'Cập nhật')}
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
      {showDeleteModal && selectedWeather && (
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
                      Xóa dữ liệu thời tiết
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa dữ liệu thời tiết ngày{' '}
                        <span className="font-medium">{formatDate(selectedWeather.date)}</span>{' '}
                        tại{' '}
                        <span className="font-medium">{selectedWeather.city.name}</span>?
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
                    setSelectedWeather(null);
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

export default AdminWeatherPage;