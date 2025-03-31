// app/dashboard/map/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';

// Import động cho component bản đồ để tránh lỗi SSR
const MapContainer = dynamic(
  () => import('./components/MapContainer'),
  {
    loading: () => <div className="w-full h-[calc(100vh-180px)] bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

export default function MapPage() {
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('normal');
  const [detectionMode, setDetectionMode] = useState<boolean>(false);
  
  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2">Bản đồ sạt lở đất</h1>
        <p className="text-gray-600">Xem bản đồ và phát hiện các điểm sạt lở tiềm ẩn.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-180px)]">
            <CardHeader className="p-2 border-b">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Kiểu bản đồ:</span>
                  <div className="flex border rounded overflow-hidden">
                    <button
                      className={`px-3 py-1 text-sm ${mapType === 'normal' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                      onClick={() => setMapType('normal')}
                    >
                      Thường
                    </button>
                    <button
                      className={`px-3 py-1 text-sm ${mapType === 'satellite' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                      onClick={() => setMapType('satellite')}
                    >
                      Vệ tinh
                    </button>
                  </div>
                </div>
                
                <Button
                  variant={detectionMode ? "success" : "primary"}
                  onClick={() => setDetectionMode(!detectionMode)}
                  size="sm"
                >
                  {detectionMode ? "Đang trong chế độ phát hiện" : "Bật chế độ phát hiện"}
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <MapContainer mapType={mapType} detectionMode={detectionMode} />
            </CardBody>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Phát hiện sạt lở</h2>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 mb-4">
                Nhấp vào bản đồ để chọn vị trí và phân tích nguy cơ sạt lở đất trong khu vực đó.
              </p>
              <Button variant="primary" className="w-full" onClick={() => setDetectionMode(true)}>
                Bật chế độ phát hiện
              </Button>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Hướng dẫn sử dụng</h2>
            </CardHeader>
            <CardBody>
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
                  <span>Đợi kết quả phân tích (có thể mất 30-60 giây)</span>
                </li>
              </ul>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Lịch sử phân tích</h2>
            </CardHeader>
            <CardBody>
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
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
