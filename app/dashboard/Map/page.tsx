'use client';

import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Import component bản đồ động để tránh lỗi SSR
const MapContainer = dynamic(
  () => import('./components/MapContainer'),
  {
    loading: () => <div className="w-full h-[calc(100vh-180px)] bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

export default function MapPage() {
  return (
    <>     
     <style>{`
      .leaflet-popup-content {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .leaflet-popup-content-wrapper {
        padding: 0 !important;
        overflow: hidden;
        border-radius: 8px !important;
      }
      
      .leaflet-popup-close-button {
        color: #3b82f6 !important;
        font-size: 18px !important;
        padding: 6px 6px 0 0 !important;
      }
    `}</style>
     <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-100px)]">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">Bản đồ sạt lở đất</h1>
          <p className="text-gray-600">Xem bản đồ và phát hiện các điểm sạt lở tiềm ẩn.</p>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Container chính chứa bản đồ */}
          <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
            <Suspense fallback={<div className="w-full h-full bg-gray-100 animate-pulse" />}>
              <MapContainer />
            </Suspense>
          </div>
          
          {/* Sidebar - không cố định kích thước để responsive trên mobile */}
          <div className="w-80 ml-4 space-y-4 overflow-y-auto hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-medium mb-3">Phát hiện sạt lở</h2>
              <p className="text-sm text-gray-600 mb-4">
                Nhấp vào bản đồ để chọn vị trí và phân tích nguy cơ sạt lở đất trong khu vực đó.
              </p>
              <Link 
                href="/dashboard/Map/fullscreen"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded"
              >
                Xem bản đồ toàn màn hình
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-medium mb-3">Hướng dẫn sử dụng</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                  <span>Chọn kiểu bản đồ phù hợp (thường/vệ tinh)</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                  <span>Bật chế độ phát hiện sạt lở</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                  <span>Nhấp vào vị trí cần phân tích trên bản đồ</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                  <span>Đợi kết quả phân tích (có thể mất 1-2 phút)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-medium mb-3">Lịch sử phân tích</h2>
              <div className="space-y-3">
                <div className="border-l-4 border-red-500 pl-2 py-1">
                  <div className="text-sm font-medium">Đèo Ô Quý Hồ</div>
                  <div className="text-xs text-gray-500">31/03/2025 - Phát hiện sạt lở</div>
                </div>
                
                <div className="border-l-4 border-green-500 pl-2 py-1">
                  <div className="text-sm font-medium">Thung lũng Mai Châu</div>
                  <div className="text-xs text-gray-500">15/03/2025 - Không phát hiện</div>
                </div>
                
                <div className="text-center mt-2">
                  <button className="text-blue-600 hover:text-blue-800 text-xs">
                    Xem tất cả lịch sử
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </>
  );
}