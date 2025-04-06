// app/not-found.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, MapPin, ArrowLeft, Home, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          {/* Lost traveler illustration */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-16 h-16 text-blue-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <div className="text-3xl font-bold text-red-500">?</div>
              </div>
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Compass className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>
        
        <h1 className="text-7xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Trang không tìm thấy</h2>
        <p className="text-gray-600 mb-8">
          Có vẻ như bạn đã đi lạc đường. Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/"
            className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <Home className="w-5 h-5 mr-2" />
            Quay về trang chủ
          </Link>
          
          <Link 
            href="/dashboard/Map"
            className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Khám phá bản đồ
          </Link>
          
          <div className="relative mt-6">
            <input
              type="text"
              placeholder="Tìm kiếm địa điểm..."
              className="w-full py-3 px-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
        
        <div className="mt-12">
          <p className="text-gray-500 text-sm">
            Cần trợ giúp? <Link href="/contact" className="text-blue-600 hover:underline">Liên hệ với chúng tôi</Link>
          </p>
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-50 rounded-full opacity-70"></div>
        <div className="absolute top-1/4 -right-20 w-40 h-40 bg-indigo-50 rounded-full opacity-70"></div>
        <div className="absolute bottom-1/3 -left-24 w-48 h-48 bg-teal-50 rounded-full opacity-70"></div>
        <div className="absolute -bottom-20 right-1/4 w-36 h-36 bg-yellow-50 rounded-full opacity-70"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;