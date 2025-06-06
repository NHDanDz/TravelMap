// app/account/page.tsx - Tích hợp với Database
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    User, Edit, MapPin, Heart, Clock, Settings, LogOut, Lock, 
    Camera, Award,  Compass, UserCheck, Star, Calendar, 
    ThumbsUp, Trash, Map, Loader2
  } from 'lucide-react';
import { useRouter } from 'next/navigation';  
import { AuthService } from '@/lib/auth';


interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentValue: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
  type?: 'text' | 'email';
}

// Interfaces
interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
  avatar: string;
  joinDate: string;
  savedPlaces: number;
  completedTrips: number;
  reviewsCount: number;
}

interface SavedPlace {
  id: number;
  name: string;
  type: string;
  address: string;
  rating: number;
  image: string;
  savedAt: string;
  notes?: string;
}

interface Review {
  id: number;
  placeName: string;
  placeType: string;
  rating: number;
  content: string;
  date: string;
  likes: number;
  visitDate?: string;
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
}

type TabType = 'profile' | 'saved' | 'trips' | 'reviews' | 'settings';


const Notification: React.FC<{
  notification: { type: 'success' | 'error'; message: string } | null;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
        notification.type === 'success' 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        {notification.type === 'success' ? (
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <p className={`text-sm font-medium ${
          notification.type === 'success' ? 'text-green-800' : 'text-red-800'
        }`}>
          {notification.message}
        </p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 rounded-full p-1 hover:bg-opacity-20 ${
            notification.type === 'success' 
              ? 'text-green-400 hover:bg-green-400' 
              : 'text-red-400 hover:bg-red-400'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};


const EditModal: React.FC<EditModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  currentValue, 
  onSave, 
  placeholder,
  type = 'text'
}) => {
  const [value, setValue] = useState(currentValue);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue, isOpen]);

  const handleSave = async () => {
    if (value.trim() === currentValue.trim()) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onSave(value.trim());
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {title}
            </label>
            <input
              type={type}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !value.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
  type: 'success' | 'error';
  message: string;
} | null>(null);
  // Pagination states
  const [savedPlacesPage, setSavedPlacesPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    type: 'name' | 'email' | 'username' | null;
    title: string;
    currentValue: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
    currentValue: ''
  });
  const router = useRouter();   
  
  // Kiểm tra xác thực
useEffect(() => {
  try {
    if (!AuthService.isAuthenticated()) {
      console.warn('User not authenticated, redirecting to login');
      router.push('/auth');
      return;
    }
    const userId = AuthService.getUserId();
    setCurrentUserId(userId);
  } catch (error) {
    console.error('Authentication error:', error);
    router.push('/auth');
  }
}, [router]);
  // Fetch user data
useEffect(() => {
  if (currentUserId) {
    fetchUserData();
  }
}, [currentUserId]);


  // Fetch tab-specific data when tab changes
  useEffect(() => {
    if (!currentUserId) return;
    switch (activeTab) {
      case 'saved':
        fetchSavedPlaces();
        break;
      case 'reviews':
        fetchReviews();
        break;
      case 'trips':
        fetchTrips();
        break;
    }
  }, [activeTab, savedPlacesPage, reviewsPage, selectedCategory, currentUserId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/account?userId=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const data = await response.json();
      setUserData({
        ...data,
        joinDate: new Date(data.joinDate).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long'
        })
      });
    } catch (err) {
      setError('Không thể tải thông tin tài khoản');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };


  
// Hàm mở modal chỉnh sửa
const openEditModal = (type: 'name' | 'email' | 'username', title: string, currentValue: string) => {
  setEditModal({
    isOpen: true,
    type,
    title,
    currentValue
  });
};

// Hàm xử lý lưu từ modal
const handleSaveFromModal = async (newValue: string) => {
  if (!editModal.type || !userData) return;
  
  const updateData: Partial<UserData> = {};
  updateData[editModal.type] = newValue;
  
  await handleUpdateProfile(updateData);
};

  const fetchSavedPlaces = async () => {
    try {
      const response = await fetch(
        `/api/account/saved-places?userId=${currentUserId}&page=${savedPlacesPage}&category=${selectedCategory}`
      );
      if (!response.ok) throw new Error('Failed to fetch saved places');
      
      const data = await response.json();
      setSavedPlaces(data.places);
    } catch (err) {
      console.error('Error fetching saved places:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `/api/account/reviews?userId=${currentUserId}&page=${reviewsPage}`
      );
      if (!response.ok) throw new Error('Failed to fetch reviews');
      
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await fetch(`/api/trips?userId=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      
      const data = await response.json();
      setTrips(data);
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<UserData>) => {
    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          ...updatedData
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const result = await response.json();
      if (result.success) {
        await fetchUserData(); // Refresh user data
        // Hiển thị thông báo thành công
        setNotification({
          type: 'success',
          message: 'Cập nhật thông tin thành công!'
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setNotification({
        type: 'error',
        message: 'Không thể cập nhật thông tin'
      });
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      const response = await fetch(`/api/account/reviews?reviewId=${reviewId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete review');
      
      // Refresh reviews
      fetchReviews();
      fetchUserData(); // Update review count
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Không thể xóa đánh giá');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

   if (loading || !currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không thể tải dữ liệu'}</p>
          <button 
            onClick={fetchUserData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-700">
                <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                  <Edit className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              <div className="relative px-6 pb-6">
                <div className="absolute -top-16 left-6">
                  <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                    <Image 
                      src={userData.avatar} 
                      alt={userData.name}
                      fill
                      className="object-cover"
                    />
                    <button className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-full">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="pt-20">
                  <h1 className="text-2xl font-bold text-gray-800">{userData.name}</h1>
                  <p className="text-gray-500 mt-1">@{userData.username}</p>
                  <p className="text-gray-500 mt-1">{userData.email}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1.5" />
                    <span>Tham gia từ {userData.joinDate}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold text-xl text-gray-800">{userData.savedPlaces}</div>
                      <div className="text-sm text-gray-500 mt-1">Địa điểm đã lưu</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold text-xl text-gray-800">{userData.completedTrips}</div>
                      <div className="text-sm text-gray-500 mt-1">Chuyến đi hoàn thành</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold text-xl text-gray-800">{userData.reviewsCount}</div>
                      <div className="text-sm text-gray-500 mt-1">Đánh giá</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cá nhân</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Họ và tên</div>
                    <div className="font-medium mt-1">{userData.name}</div>
                  </div>
                <button 
                  onClick={() => openEditModal('name', 'Chỉnh sửa họ và tên', userData.name)}
                  className="mt-2 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  <span>Chỉnh sửa</span>
                </button>

                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium mt-1">{userData.email}</div>
                  </div>
                  <button 
                    onClick={() => openEditModal('email', 'Chỉnh sửa địa chỉ email', userData.email)}
                    className="mt-2 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Tên người dùng</div>
                    <div className="font-medium mt-1">@{userData.username}</div>
                  </div>
                 <button 
                    onClick={() => openEditModal('username', 'Chỉnh sửa tên người dùng', userData.username)}
                    className="mt-2 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    <span>Chỉnh sửa</span>
                  </button>

                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3">
                  <div>
                    <div className="text-sm text-gray-500">Mật khẩu</div>
                    <div className="font-medium mt-1">••••••••</div>
                  </div>
                  <button className="mt-2 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-700">
                    <Lock className="w-4 h-4 mr-1" />
                    <span>Đổi mật khẩu</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thành tựu</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto ${userData.savedPlaces >= 20 ? 'bg-blue-100' : 'bg-gray-100'} rounded-full flex items-center justify-center ${userData.savedPlaces < 20 ? 'opacity-50' : ''}`}>
                    <Award className={`w-8 h-8 ${userData.savedPlaces >= 20 ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`font-medium mt-2 ${userData.savedPlaces < 20 ? 'text-gray-500' : ''}`}>Nhà khám phá</h3>
                  <p className="text-xs text-gray-500 mt-1">Đã khám phá {userData.savedPlaces}/20+ địa điểm</p>
                </div>
                
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto ${userData.reviewsCount >= 50 ? 'bg-yellow-100' : 'bg-gray-100'} rounded-full flex items-center justify-center ${userData.reviewsCount < 50 ? 'opacity-50' : ''}`}>
                    <Star className={`w-8 h-8 ${userData.reviewsCount >= 50 ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`font-medium mt-2 ${userData.reviewsCount < 50 ? 'text-gray-500' : ''}`}>Chuyên gia đánh giá</h3>
                  <p className="text-xs text-gray-500 mt-1">Đánh giá {userData.reviewsCount}/50+ địa điểm</p>
                </div>
                
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto ${userData.completedTrips >= 5 ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center ${userData.completedTrips < 5 ? 'opacity-50' : ''}`}>
                    <Compass className={`w-8 h-8 ${userData.completedTrips >= 5 ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`font-medium mt-2 ${userData.completedTrips < 5 ? 'text-gray-500' : ''}`}>Lữ khách</h3>
                  <p className="text-xs text-gray-500 mt-1">Hoàn thành {userData.completedTrips}/5+ chuyến đi</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center opacity-50">
                    <UserCheck className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium mt-2 text-gray-500">Thành viên VIP</h3>
                  <p className="text-xs text-gray-500 mt-1">Hoạt động 1+ năm</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'saved':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Địa điểm đã lưu</h2>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500"
                >
                  <option value="Tất cả">Tất cả</option>
                  <option value="restaurant">Nhà hàng</option>
                  <option value="hotel">Khách sạn</option>
                  <option value="tourist_attraction">Địa điểm du lịch</option>
                  <option value="cafe">Quán cà phê</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedPlaces.map(place => (
                  <div key={place.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex hover:shadow-md transition-shadow">
                    <div className="relative h-32 w-32 flex-shrink-0">
                      <Image
                        src={place.image}
                        alt={place.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">{place.name}</h3>
                        <button className="text-red-500 hover:text-red-600">
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <div className="text-sm text-blue-600 mt-1">{place.type}</div>
                      <div className="flex items-start mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{place.address}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(place.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-sm text-gray-600">{place.rating}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Đã lưu: {formatDate(place.savedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {savedPlaces.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Chưa có địa điểm nào được lưu</h3>
                  <p className="text-gray-400">Hãy khám phá và lưu những địa điểm yêu thích của bạn!</p>
                </div>
              )}
              
              {savedPlaces.length > 0 && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setSavedPlacesPage(prev => prev + 1)}
                    className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'trips':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Chuyến đi của tôi</h2>
                <Link href="/dashboard/trips/create">
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                    + Tạo chuyến đi mới
                  </button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trips.map(trip => (
                  <div key={trip.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48 w-full">
                      <Image
                        src={trip.coverImage}
                        alt={trip.name}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute top-3 right-3 text-xs font-medium py-1 px-2 rounded-full ${
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status === 'completed' ? 'Đã hoàn thành' : 
                         trip.status === 'planned' ? 'Đã lên kế hoạch' : 'Nháp'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800">{trip.name}</h3>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{trip.placesCount} địa điểm</span>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <Link href={`/dashboard/trips/${trip.id}`}>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Xem chi tiết
                          </button>
                        </Link>
                        <Link href={`/dashboard/trips/${trip.id}/edit`}>
                          <button className="text-gray-500 hover:text-gray-700">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {trips.length === 0 && (
                <div className="text-center py-8">
                  <Map className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Chưa có chuyến đi nào</h3>
                  <p className="text-gray-400 mb-4">Hãy tạo chuyến đi đầu tiên của bạn!</p>
                  <Link href="/dashboard/trips/create">
                    <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                      Tạo chuyến đi mới
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'reviews':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Đánh giá của tôi</h2>
              
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{review.placeName}</h3>
                        <div className="text-sm text-blue-600 mt-1">{review.placeType}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(review.date)}
                      </div>
                    </div>
                    
                    <div className="flex mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <p className="mt-3 text-gray-600">
                      {review.content}
                    </p>
                    
                    <div className="mt-4 flex items-center">
                      <button className="inline-flex items-center text-gray-500 hover:text-gray-700">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        <span>{review.likes}</span>
                      </button>
                      <button className="ml-4 inline-flex items-center text-gray-500 hover:text-gray-700">
                        <Edit className="w-4 h-4 mr-1" />
                        <span>Chỉnh sửa</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="ml-4 inline-flex items-center text-red-500 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {reviews.length === 0 && (
                <div className="text-center py-8">
                  <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Chưa có đánh giá nào</h3>
                  <p className="text-gray-400">Hãy chia sẻ trải nghiệm của bạn về những địa điểm đã ghé thăm!</p>
                </div>
              )}

              {reviews.length > 0 && (
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setReviewsPage(prev => prev + 1)}
                    className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-800">Thông báo</h3>
                    <p className="text-sm text-gray-500 mt-1">Quản lý cài đặt thông báo</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Quản lý
                  </button>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-800">Bảo mật và đăng nhập</h3>
                    <p className="text-sm text-gray-500 mt-1">Cập nhật mật khẩu và bảo mật tài khoản</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Cập nhật
                  </button>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-800">Quyền riêng tư</h3>
                    <p className="text-sm text-gray-500 mt-1">Quản lý dữ liệu và quyền riêng tư</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Quản lý
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-600">Xóa tài khoản</h3>
                    <p className="text-sm text-gray-500 mt-1">Xóa vĩnh viễn tài khoản và dữ liệu của bạn</p>
                  </div>
                  <button className="text-red-600 hover:text-red-700 font-medium">
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Thanh toán & đăng ký</h2>
              
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Gói Miễn phí</h3>
                    <p className="text-sm text-gray-500 mt-1">Bạn đang sử dụng gói miễn phí</p>
                  </div>
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">
                    Nâng cấp tài khoản
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">So sánh các gói</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tính năng</th>
                        <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miễn phí</th>
                        <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-3 py-3 text-sm text-gray-500">Tìm kiếm địa điểm</td>
                        <td className="px-3 py-3 text-sm text-gray-500">✓</td>
                        <td className="px-3 py-3 text-sm text-gray-500">✓</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-3 text-sm text-gray-500">Lưu địa điểm yêu thích</td>
                        <td className="px-3 py-3 text-sm text-gray-500">Tối đa 20</td>
                        <td className="px-3 py-3 text-sm text-gray-500">Không giới hạn</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-3 text-sm text-gray-500">Tạo lịch trình</td>
                        <td className="px-3 py-3 text-sm text-gray-500">Tối đa 2</td>
                        <td className="px-3 py-3 text-sm text-gray-500">Không giới hạn</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-3 text-sm text-gray-500">Thời gian offline</td>
                        <td className="px-3 py-3 text-sm text-gray-500">✗</td>
                        <td className="px-3 py-3 text-sm text-gray-500">✓</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-3 text-sm text-gray-500">Hỗ trợ ưu tiên</td>
                        <td className="px-3 py-3 text-sm text-gray-500">✗</td>
                        <td className="px-3 py-3 text-sm text-gray-500">✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                    <Image 
                      src={userData.avatar} 
                      alt={userData.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">{userData.name}</h3>
                    <p className="text-sm text-gray-500">Thành viên</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
                        activeTab === 'profile'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('profile')}
                    >
                      <User className="w-5 h-5 mr-3" />
                      Hồ sơ cá nhân
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
                        activeTab === 'saved'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('saved')}
                    >
                      <Heart className="w-5 h-5 mr-3" />
                      Địa điểm đã lưu
                      <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {userData.savedPlaces}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
                        activeTab === 'trips'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('trips')}
                    >
                      <Map className="w-5 h-5 mr-3" />
                      Chuyến đi của tôi
                      <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {trips.length}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
                        activeTab === 'reviews'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      <Star className="w-5 h-5 mr-3" />
                      Đánh giá của tôi
                      <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {userData.reviewsCount}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
                        activeTab === 'settings'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Cài đặt
                    </button>
                  </li>
                </ul>
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50">
                    <LogOut className="w-5 h-5 mr-3" />
                    Đăng xuất
                  </button>
                </div>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {renderTabContent()}
          </div>
        </div>
      </div>
      {/* Edit Modal */}

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ ...editModal, isOpen: false })}
        title={editModal.title}
        currentValue={editModal.currentValue}
        onSave={handleSaveFromModal}
        type={editModal.type === 'email' ? 'email' : 'text'}
        placeholder={
          editModal.type === 'email' ? 'Nhập địa chỉ email mới' :
          editModal.type === 'username' ? 'Nhập tên người dùng mới' :
          'Nhập tên mới'
        }
      />
      {/* Notification */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default AccountPage;