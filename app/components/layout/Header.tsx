// app/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function Header({ toggleSidebar, sidebarOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <header 
      className={`bg-white border-b border-gray-200 z-20 transition-all duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo and toggle */}
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-3"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            
            <Link href="/dashboard" className="flex items-center">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-lg font-bold text-gray-900">
                <span className="text-blue-600">Quản lý</span> Sạt lở đất
              </div>
            </Link>
          </div>

          {/* Center: Date time */}
          <div className="hidden md:block text-center">
            <div className="text-sm text-gray-500">
              {formatDate(currentTime)}
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Right side: Navigation and profile */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button className="text-gray-500 hover:text-gray-700 p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Notification button */}
            <div className="relative">
              <button 
                className="text-gray-500 hover:text-gray-700 p-2"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </div>
              </button>
              
              {/* Notification dropdown */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700">Thông báo</h3>
                    <button className="text-xs text-blue-600 hover:text-blue-800">Đánh dấu tất cả đã đọc</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="border-l-4 border-red-500 bg-red-50 p-3">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-800">Cảnh báo sạt lở mới</p>
                        <span className="text-xs text-gray-500">10 phút trước</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Phát hiện điểm sạt lở mới tại Đèo Ô Quý Hồ</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-3">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-800">Dự báo thời tiết</p>
                        <span className="text-xs text-gray-500">1 giờ trước</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Dự báo mưa lớn tại khu vực Lào Cai trong 48 giờ tới</p>
                    </div>
                    <div className="border-l-4 border-green-500 bg-green-50 p-3">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-800">Cập nhật trạng thái</p>
                        <span className="text-xs text-gray-500">2 giờ trước</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Điểm sạt lở tại Thác Bạc đã được ổn định</p>
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <Link href="/dashboard/notifications" className="block text-center text-sm text-blue-600 hover:text-blue-800">
                      Xem tất cả thông báo
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-1">
              <Link href="/dashboard/statistics" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Thống kê
              </Link>
              <Link href="/dashboard/settings" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Cài đặt
              </Link>
            </div>
            
            {/* Profile dropdown */}
            <div className="relative ml-3">
              <button 
                className="flex items-center space-x-3"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-800">Admin User</div>
                  <div className="text-xs text-gray-500">Quản trị viên</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                  AU
                </div>
              </button>
              
              {/* Profile dropdown menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-800">Admin User</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Thông tin cá nhân
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Cài đặt
                    </Link>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}