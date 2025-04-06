// app/dashboard/layout.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  Map, 
  Heart, 
  User, 
  Menu, 
  X,
  LogOut
} from 'lucide-react';
// Sửa đường dẫn import - Đường dẫn tuyệt đối thay vì tương đối
import dynamic from 'next/dynamic';

// Import ScriptImports động để tránh lỗi
const ScriptImporter = dynamic(
  () => import('@/app/dashboard/Map/ScriptImports'),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Thêm các script cần thiết cho Leaflet */}
      {typeof window !== 'undefined' && <ScriptImporter />}
      
      {/* Header */}
      <header className="bg-white shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <Compass className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-blue-600">TravelSense</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Trang chủ
            </Link>
            <Link href="/dashboard/Map" className="text-gray-600 hover:text-gray-900">
              Bản đồ
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              Giới thiệu
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Liên hệ
            </Link>
            <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
              <User className="h-5 w-5" />
              <span>Tài khoản</span>
            </button>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3 absolute w-full z-10 shadow-md">
            <Link 
              href="/dashboard" 
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowMobileMenu(false)}
            >
              Trang chủ
            </Link>
            <Link 
              href="/dashboard/Map" 
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowMobileMenu(false)}
            >
              Bản đồ
            </Link>
            <Link 
              href="/about" 
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowMobileMenu(false)}
            >
              Giới thiệu
            </Link>
            <Link 
              href="/contact" 
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowMobileMenu(false)}
            >
              Liên hệ
            </Link>
            <button className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900 w-full">
              <User className="h-5 w-5" />
              <span>Tài khoản</span>
            </button>
            <div className="border-t border-gray-100 pt-2">
              <button className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700 w-full">
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-grow">{children}</div>

      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Compass className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-lg font-semibold text-blue-600">TravelSense</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 md:mb-0">
              <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm">
                Giới thiệu
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                Điều khoản sử dụng
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">
                Liên hệ
              </Link>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} TravelSense. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-20">
        <div className="grid grid-cols-4 h-16">
          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
          >
            <Compass className="h-6 w-6" />
            <span className="text-xs mt-1">Trang chủ</span>
          </Link>
          <Link
            href="/dashboard/Map"
            className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
          >
            <Map className="h-6 w-6" />
            <span className="text-xs mt-1">Bản đồ</span>
          </Link>
          <button
            className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs mt-1">Đã lưu</span>
          </button>
          <button
            className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
}