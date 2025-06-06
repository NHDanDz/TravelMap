// app/admin/reviews/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Star, Eye, Trash2, CheckCircle, XCircle, Calendar, User, MapPin, MessageSquare, AlertTriangle, X, AlertCircle
} from 'lucide-react';

interface Review {
  id: number;
  rating: number;
  comment?: string;
  visitDate?: string;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: number;
    username: string;
    email?: string;
  };
  place: {
    id: number;
    name: string;
    address?: string;
    city?: {
      name: string;
    };
  };
  status?: 'pending' | 'approved' | 'rejected';
  moderatorNote?: string;
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgRating: number;
  thisMonth: number;
}

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created');
  const [dateRange, setDateRange] = useState<string>('all');
  
  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [moderatorNote, setModeratorNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/reviews/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch review stats:', err);
      // Mock stats for development
      setStats({
        total: reviews.length || 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        avgRating: 4.2,
        thisMonth: 0
      });
    }
  };

const getDateRangeFilter = () => {
  // Tạo ngày hiện tại theo Vietnam timezone (UTC+7)
  const now = new Date();
  const vietnamNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  
  switch (dateRange) {
    case 'today':
      // Ngày hôm nay theo Vietnam timezone
      const today = new Date(vietnamNow.getFullYear(), vietnamNow.getMonth(), vietnamNow.getDate());
      return today;
      
    case 'week':
      // 7 ngày trước theo Vietnam timezone
      const weekAgo = new Date(vietnamNow.getTime() - 7 * 24 * 60 * 60 * 1000);
      return new Date(weekAgo.getFullYear(), weekAgo.getMonth(), weekAgo.getDate());
      
    case 'month':
      // Đầu tháng hiện tại theo Vietnam timezone
      return new Date(vietnamNow.getFullYear(), vietnamNow.getMonth(), 1);
      
    case 'year':
      // Đầu năm hiện tại theo Vietnam timezone
      return new Date(vietnamNow.getFullYear(), 0, 1);
      
    default:
      return null;
  }
};

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || review.status === selectedStatus;
    
    const matchesRating = !selectedRating || review.rating.toString() === selectedRating;
    
    const dateFilter = getDateRangeFilter();
    const matchesDate = !dateFilter || new Date(review.createdAt) >= dateFilter;
    
    return matchesSearch && matchesStatus && matchesRating && matchesDate;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating_high':
        return b.rating - a.rating;
      case 'rating_low':
        return a.rating - b.rating;
      case 'place':
        return a.place.name.localeCompare(b.place.name);
      case 'user':
        return a.user.username.localeCompare(b.user.username);
      case 'created':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setModeratorNote('');
    setShowReviewModal(true);
  };

  const handleDeleteReview = (review: Review) => {
    setSelectedReview(review);
    setShowDeleteModal(true);
  };

  const handleModerationAction = async (action: 'approve' | 'reject') => {
    if (!selectedReview) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/reviews/${selectedReview.id}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          moderatorNote: moderatorNote.trim() || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to moderate review');
      }

      await fetchReviews();
      await fetchStats();
      setShowReviewModal(false);
      setSelectedReview(null);
      setModeratorNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to moderate review');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedReview) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }

      await fetchReviews();
      await fetchStats();
      setShowDeleteModal(false);
      setSelectedReview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            Từ chối
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Chờ duyệt
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Không xác định
          </span>
        );
    }
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
          <p className="text-gray-600">Kiểm duyệt và quản lý đánh giá từ người dùng</p>
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
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng đánh giá</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đã duyệt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Điểm TB</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tháng này</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
          
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
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
            <option value="created">Mới nhất</option>
            <option value="rating_high">Đánh giá cao</option>
            <option value="rating_low">Đánh giá thấp</option>
            <option value="place">Theo địa điểm</option>
            <option value="user">Theo người dùng</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Hiển thị: {filteredReviews.length} / {reviews.length}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm & Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
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
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.place.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {review.place.city?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {review.user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {getRatingStars(review.rating)}
                      </div>
                      <span className="text-sm font-medium">
                        {review.rating}/5
                      </span>
                    </div>
                    {review.visitDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        Thăm: {new Date(review.visitDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {review.comment ? (
                        <p className="text-sm text-gray-900 line-clamp-3">
                          {review.comment}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-500 italic">
                          Không có bình luận
                        </span>
                      )}
                    </div>
                  </td> 
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewReview(review)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review)}
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
        
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy đánh giá</h3>
            <p className="mt-1 text-sm text-gray-500">
              Thử thay đổi bộ lọc để xem thêm đánh giá.
            </p>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Chi tiết đánh giá
                  </h3>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Place Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Địa điểm</h4>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{selectedReview.place.name}</div>
                        <div className="text-sm text-gray-500">
                          {selectedReview.place.address}
                        </div>
                        {selectedReview.place.city && (
                          <div className="text-sm text-gray-500">
                            {selectedReview.place.city.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Người đánh giá</h4>
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{selectedReview.user.username}</div>
                        <div className="text-sm text-gray-500">
                          {selectedReview.user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Đánh giá</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {getRatingStars(selectedReview.rating)}
                      </div>
                      <span className="text-lg font-medium">
                        {selectedReview.rating}/5
                      </span>
                    </div>
                    {selectedReview.visitDate && (
                      <div className="text-sm text-gray-500 mt-1">
                        Ngày thăm: {new Date(selectedReview.visitDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                  
                  {/* Comment */}
                  {selectedReview.comment && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Bình luận</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900">{selectedReview.comment}</p>
                      </div>
                    </div>
                  )}
                   
                  
                  {/* Moderator Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú kiểm duyệt
                    </label>
                    <textarea
                      value={moderatorNote}
                      onChange={(e) => setModeratorNote(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập ghi chú cho quyết định kiểm duyệt..."
                    />
                  </div>
                  
                  {/* Timestamps */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Tạo: {formatDate(selectedReview.createdAt)}</div>
                    {selectedReview.updatedAt && selectedReview.updatedAt !== selectedReview.createdAt && (
                      <div>Cập nhật: {formatDate(selectedReview.updatedAt)}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleModerationAction('approve')}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {actionLoading ? 'Đang xử lý...' : 'Duyệt'}
                </button>
                <button
                  type="button"
                  onClick={() => handleModerationAction('reject')}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedReview && (
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
                      Xóa đánh giá
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa đánh giá này của{' '}
                        <span className="font-medium">{selectedReview.user.username}</span>{' '}
                        cho địa điểm{' '}
                        <span className="font-medium">{selectedReview.place.name}</span>?
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
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedReview(null);
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

export default AdminReviewsPage;