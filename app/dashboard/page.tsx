// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function LandingPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Đang tải hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with time and date */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-800">Hệ thống Quản lý Sạt lở đất</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{formatDate(currentTime)}</p>
              <p className="text-lg font-semibold text-gray-800">{formatTime(currentTime)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Giám sát và quản lý <span className="text-blue-600">sạt lở đất</span> thông minh
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Hệ thống toàn diện giúp phát hiện, theo dõi và cảnh báo sớm các khu vực có nguy cơ sạt lở, bảo vệ cộng đồng và cơ sở hạ tầng.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/dashboard/landslides" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center transition-colors duration-200"
              >
                Truy cập hệ thống
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/dashboard/Map" 
                className="bg-white hover:bg-gray-100 text-blue-600 font-medium px-6 py-3 rounded-lg inline-flex items-center border border-blue-200 transition-colors duration-200"
              >
                Xem bản đồ trực tiếp
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-blue-100 rounded-3xl p-6 relative z-10 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-auto text-sm font-medium text-blue-800">Tổng quan hệ thống</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-blue-600">25</div>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm mt-2">Tổng số điểm sạt lở</div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-red-600">8</div>
                    <div className="bg-red-100 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm mt-2">Điểm nguy cơ cao</div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Điểm sạt lở mới nhất</h3>
                <div className="border-l-4 border-red-500 pl-3 py-2 mb-2">
                  <div className="font-medium">Đèo Ô Quý Hồ</div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>31/03/2025</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Nguy cơ cao</span>
                  </div>
                </div>
                <div className="border-l-4 border-orange-500 pl-3 py-2">
                  <div className="font-medium">Thác Bạc, Sa Pa</div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>10/03/2025</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Đang hoạt động</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow">
                <h3 className="font-medium text-gray-800 mb-3">Dự báo thời tiết</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg font-medium">Hà Nội</div>
                    <div className="text-sm text-gray-500">Hôm nay</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold flex items-center">
                      27°C
                      <svg className="w-8 h-8 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500">Nhiều mây, có mưa rào</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-300 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-12">Tính năng chính của hệ thống</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform hover:scale-105 duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Bản đồ trực tiếp</h3>
              <p className="text-gray-600">Visualize landslides on satellite maps with real-time monitoring of high-risk areas and historical data tracking.</p>
              <Link href="/dashboard/Map" className="mt-4 text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium">
                Xem bản đồ
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform hover:scale-105 duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Theo dõi liên tục</h3>
              <p className="text-gray-600">Continuous monitoring of landslide-prone areas with automated detection systems and daily risk assessment reports.</p>
              <Link href="/dashboard/landslides?tab=monitoring" className="mt-4 text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium">
                Xem thêm
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform hover:scale-105 duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Cảnh báo sớm</h3>
              <p className="text-gray-600">Advanced early warning system with email and SMS notifications to authorities and residents in potentially affected areas.</p>
              <Link href="/dashboard/landslides?tab=notifications" className="mt-4 text-blue-600 hover:text-blue-800 inline-flex items-center text-sm font-medium">
                Xem thông báo
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-blue-600 text-white py-6 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-lg font-semibold">Hệ thống Quản lý Sạt lở đất</h3>
              <p className="text-blue-100 text-sm mt-1">© 2025 Bộ Tài nguyên và Môi trường</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-100 hover:text-white">Trợ giúp</a>
              <a href="#" className="text-blue-100 hover:text-white">Liên hệ</a>
              <a href="#" className="text-blue-100 hover:text-white">Chính sách</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}