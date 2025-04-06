// app/account/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    User, Edit, MapPin, Heart, Clock, Settings, LogOut, Lock, 
    Camera, Award, Shield, Bell, Compass, UserCheck, Star, Calendar, 
    ThumbsUp, Trash, Map
  } from 'lucide-react';
// Dummy user data
const userData = {
  name: 'Nguyễn Hải Đăng',
  email: 'nhdandz@gmail.com',
  avatar: '/images/human-4.jpg',
  joinDate: 'Tháng 10, 2003',
  savedPlaces: 24,
  completedTrips: 8,
  reviewsCount: 15
};

type TabType = 'profile' | 'saved' | 'trips' | 'reviews' | 'settings';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Saved places mock data
  const savedPlaces = [
    {
      id: 1,
      name: 'Nhà hàng Sài Gòn Xưa',
      type: 'restaurant',
      address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      rating: 4.7,
      image: '/images/place-1.jpg'
    },
    {
      id: 2,
      name: 'Khách sạn Continental',
      type: 'hotel',
      address: '132-134 Đồng Khởi, Quận 1, TP.HCM',
      rating: 4.9,
      image: '/images/place-2.jpg'
    },
    {
      id: 3,
      name: 'Bảo tàng Lịch sử quân sự Việt Nam',
      type: 'museum',
      address: 'Đại lộ Thăng Long, Tây Mỗ, Đại Mỗ, Nam Từ Liêm, Hà Nội',
      rating: 4.5,
      image: '/images/place-3.jpg'
    },
    {
      id: 4,
      name: 'The Coffee House',
      type: 'cafe',
      address: '92 Lê Lợi, Quận 1, TP.HCM',
      rating: 4.3,
      image: '/images/place-4.jpg'
    }
  ];

  // Trips mock data
  const trips = [
    {
      id: 1,
      name: 'Khám phá Sài Gòn',
      startDate: '12/05/2023',
      endDate: '15/05/2023',
      placesCount: 8,
      status: 'completed',
      coverImage: '/images/sai-gon.jpg'
    },
    {
      id: 2,
      name: 'Chuyến đi Đà Lạt',
      startDate: '20/06/2023',
      endDate: '25/06/2023',
      placesCount: 12,
      status: 'completed',
      coverImage: '/images/da-lat.jpg'
    },
    {
      id: 3,
      name: 'Khám phá Hà Nội',
      startDate: '10/07/2023',
      endDate: '15/07/2023',
      placesCount: 10,
      status: 'planned',
      coverImage: '/images/ha-noi.jpg'
    }
  ];

  // Reviews mock data
  const reviews = [
    {
      id: 1,
      placeName: 'Nhà hàng Sài Gòn Xưa',
      placeType: 'restaurant',
      rating: 5,
      content: 'Món ăn ngon, không gian thoáng mát và dịch vụ rất tốt. Nhất định sẽ quay lại lần sau!',
      date: '20/05/2023',
      likes: 12
    },
    {
      id: 2,
      placeName: 'Khách sạn Continental',
      placeType: 'hotel',
      rating: 4,
      content: 'Khách sạn có vị trí thuận lợi, phòng rộng rãi và sạch sẽ. Nhân viên thân thiện và nhiệt tình.',
      date: '25/06/2023',
      likes: 8
    },
    {
      id: 3,
      placeName: 'Bảo tàng Lịch sử quân sự Việt Nam',
      placeType: 'museum',
      rating: 5,
      content: 'Một nơi tuyệt vời để tìm hiểu về lịch sử Việt Nam. Nhiều hiện vật quý giá và thông tin hữu ích.',
      date: '15/07/2023',
      likes: 15
    }
  ];

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
                      <div className="text-sm text-gray-500 mt-1">Chuyến đi đã hoàn thành</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-bold text-xl text-gray-800">{userData.reviewsCount}</div>
                      <div className="text-sm text-gray-500 mt-1">Đánh giá</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cá nhân</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Họ và tên</div>
                    <div className="font-medium mt-1">{userData.name}</div>
                  </div>
                  <button className="mt-2 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4 mr-1" />
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium mt-1">{userData.email}</div>
                  </div>
                  <button className="mt-2 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-700">
                    <Edit className="w-4 h-4 mr-1" />
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Số điện thoại</div>
                    <div className="font-medium mt-1">+84 90 123 4567</div>
                  </div>
                  <button className="mt-2 md:mt-0 inline-flex items-center text-blue-600 hover:text-blue-700">
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
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thành tựu</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium mt-2">Nhà khám phá</h3>
                  <p className="text-xs text-gray-500 mt-1">Đã khám phá 20+ địa điểm</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center opacity-50">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium mt-2 text-gray-500">Chuyên gia đánh giá</h3>
                  <p className="text-xs text-gray-500 mt-1">Đánh giá 50+ địa điểm</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Compass className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-medium mt-2">Lữ khách</h3>
                  <p className="text-xs text-gray-500 mt-1">Hoàn thành 5+ chuyến đi</p>
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
                <div className="relative">
                  <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500">
                    <option>Tất cả</option>
                    <option>Nhà hàng</option>
                    <option>Khách sạn</option>
                    <option>Địa điểm du lịch</option>
                    <option>Quán cà phê</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  </div>
                </div>
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
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                  Xem thêm
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'trips':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Chuyến đi của tôi</h2>
                <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                  + Tạo chuyến đi mới
                </button>
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
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {trip.status === 'completed' ? 'Đã hoàn thành' : 'Đã lên kế hoạch'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800">{trip.name}</h3>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{trip.startDate} - {trip.endDate}</span>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{trip.placesCount} địa điểm</span>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Xem chi tiết
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                        {review.date}
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
                      <button className="ml-4 inline-flex items-center text-gray-500 hover:text-gray-700">
                        <Trash className="w-4 h-4 mr-1" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default AccountPage;