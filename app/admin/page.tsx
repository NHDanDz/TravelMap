// app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, Building2, Star, Users, Calendar, TrendingUp,
  Activity, AlertCircle, CheckCircle, Clock, Eye, MessageSquare
} from 'lucide-react';

interface Stats {
  totalPlaces: number;
  totalCities: number;
  totalUsers: number;
  totalTrips: number;
  totalReviews: number;
  avgRating: number;
  newUsersThisMonth: number;
  newPlacesThisMonth: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: 'user_registered' | 'place_added' | 'review_added' | 'trip_created';
  description: string;
  timestamp: string;
  user?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
      // Mock data for development
      setStats({
        totalPlaces: 1247,
        totalCities: 63,
        totalUsers: 3892,
        totalTrips: 756,
        totalReviews: 2341,
        avgRating: 4.2,
        newUsersThisMonth: 234,
        newPlacesThisMonth: 89,
        recentActivities: [
          {
            id: '1',
            type: 'user_registered',
            description: 'Người dùng mới đăng ký: nguyenvana@email.com',
            timestamp: '2024-01-15T10:30:00Z',
            user: 'Nguyễn Văn A'
          },
          {
            id: '2',
            type: 'place_added',
            description: 'Địa điểm mới được thêm: Quán Cà Phê Rooftop',
            timestamp: '2024-01-15T09:15:00Z'
          },
          {
            id: '3',
            type: 'review_added',
            description: 'Đánh giá mới cho Nhà hàng Hồng Kông',
            timestamp: '2024-01-15T08:45:00Z',
            user: 'Trần Thị B'
          },
          {
            id: '4',
            type: 'trip_created',
            description: 'Chuyến đi mới: Du lịch Hà Nội 3 ngày',
            timestamp: '2024-01-14T16:20:00Z',
            user: 'Lê Văn C'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'user_registered':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'place_added':
        return <MapPin className="h-4 w-4 text-blue-600" />;
      case 'review_added':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'trip_created':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
            <div className="mt-2 text-sm text-red-700">
              {error || 'Không thể tải thống kê'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng địa điểm
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalPlaces.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">+{stats.newPlacesThisMonth}</span>
              <span className="text-gray-500"> tháng này</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Thành phố
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalCities}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/admin/cities" className="text-indigo-600 hover:text-indigo-700">
                Quản lý thành phố
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Người dùng
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalUsers.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">+{stats.newUsersThisMonth}</span>
              <span className="text-gray-500"> tháng này</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Đánh giá trung bình
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.avgRating.toFixed(1)} ★
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-gray-600">{stats.totalReviews.toLocaleString()} đánh giá</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Thống kê chuyến đi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalTrips}
                </div>
                <div className="text-sm text-gray-600">Tổng chuyến đi</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(stats.totalTrips / stats.totalUsers * 100)}%
                </div>
                <div className="text-sm text-gray-600">Tỷ lệ tạo chuyến đi</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Trạng thái hệ thống
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kết nối Database</span>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Hoạt động</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Server</span>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Hoạt động</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cập nhật cuối</span>
                <span className="text-sm text-gray-500">
                  {formatDate(new Date().toISOString())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Hoạt động gần đây
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="flow-root">
            <ul className="-mb-8">
              {stats.recentActivities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== stats.recentActivities.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                            {activity.user && (
                              <span className="font-medium text-gray-900"> bởi {activity.user}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={activity.timestamp}>
                            {formatDate(activity.timestamp)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Thao tác nhanh
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/places"
              className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <MapPin className="h-6 w-6 text-blue-600 mb-2" />
              <div className="text-sm font-medium text-blue-900">Quản lý địa điểm</div>
              <div className="text-xs text-blue-700">Thêm, sửa, xóa địa điểm</div>
            </Link>
            
            <Link
              href="/admin/users"
              className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <div className="text-sm font-medium text-green-900">Quản lý người dùng</div>
              <div className="text-xs text-green-700">Xem thông tin người dùng</div>
            </Link>
            
            <Link
              href="/admin/reviews"
              className="bg-yellow-50 p-4 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Star className="h-6 w-6 text-yellow-600 mb-2" />
              <div className="text-sm font-medium text-yellow-900">Quản lý đánh giá</div>
              <div className="text-xs text-yellow-700">Kiểm duyệt đánh giá</div>
            </Link>
            
            <Link
              href="/admin/reports"
              className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Activity className="h-6 w-6 text-purple-600 mb-2" />
              <div className="text-sm font-medium text-purple-900">Xem báo cáo</div>
              <div className="text-xs text-purple-700">Thống kê chi tiết</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;