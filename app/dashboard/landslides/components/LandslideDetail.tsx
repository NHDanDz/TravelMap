// app/dashboard/landslides/components/LandslideDetail.tsx
import { LandslidePoint } from '@/app/lib/types/landslide';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { Button } from '@/app/components/ui/Button';
import { useState, useEffect } from 'react';

interface LandslideDetailProps {
  landslide: LandslidePoint;
  onClose: () => void;
  onAddToMonitoring: (landslide: LandslidePoint) => void;
}

// Helper function to format date
function formatDate(dateString: string, locale: string = 'vi-VN'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Function to generate satellite image URL
function getSatelliteImageUrl(lat: number, lng: number, width: number = 640, height: number = 320): string {
  try {
    // Tạo buffer zone xung quanh tọa độ (+-0.01 độ)
    const buffer = 0.01;
    
    // Tạo URL cho Esri World Imagery Static Map
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lng-buffer},${lat-buffer},${lng+buffer},${lat+buffer}&size=${width},${height}&format=png&f=image&bboxSR=4326&imageSR=4326`;
  } catch (error) {
    console.error("Lỗi khi tạo URL ảnh vệ tinh:", error);
    return `/images/satellite-placeholder.jpg`;
  }
}

export default function LandslideDetail({ landslide, onClose, onAddToMonitoring }: LandslideDetailProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Reset loading states when landslide changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [landslide.id]);
  
  // Generate the satellite image URL
  const satelliteImageUrl = getSatelliteImageUrl(
    landslide.coordinates.lat, 
    landslide.coordinates.lng
  );
  
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            {landslide.name}
            <span className="ml-3"><StatusBadge status={landslide.status} /></span>
          </h2>
          <button 
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-lg overflow-hidden bg-gray-100 h-64 relative">
              {/* Hiển thị placeholder khi đang tải hoặc có lỗi */}
              {(!imageLoaded || imageError) && (
                <div className="absolute inset-0 flex items-center justify-center text-center text-gray-500 bg-gray-100">
                  <div>
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2">
                      {imageError ? 'Không thể tải ảnh vệ tinh' : 'Đang tải ảnh vệ tinh...'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Hình ảnh vệ tinh */}
              <img 
                src={satelliteImageUrl}
                alt={`Ảnh vệ tinh khu vực ${landslide.name}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              
              {/* Hiển thị tọa độ trên ảnh */}
              {imageLoaded && !imageError && (
                <div className="absolute bottom-2 right-2 bg-white bg-opacity-75 px-2 py-1 rounded text-sm">
                  {landslide.coordinates.lat.toFixed(6)}, {landslide.coordinates.lng.toFixed(6)}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Lịch sử hoạt động</h3>
              <div className="space-y-4">
                {landslide.history.map((event, index) => (
                  <div key={index} className="relative pl-8">
                    <div className="absolute left-0 top-0 h-full">
                      <div className="w-1 h-full bg-gray-200"></div>
                    </div>
                    <div className="absolute left-0 top-1 w-2 h-2 rounded-full bg-blue-500 border-4 border-white"></div>
                    <div>
                      <p className="text-sm text-gray-500">{event.date}</p>
                      <p className="font-medium">{getStatusLabel(event.status)}</p>
                      <p className="text-sm text-gray-600">{event.note}</p>
                    </div>
                  </div>
                ))}
                
                {landslide.history.length === 0 && (
                  <p className="text-gray-500 text-sm">Chưa có dữ liệu lịch sử.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin chi tiết</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-medium">{landslide.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phát hiện lúc</p>
                  <p className="font-medium">{formatDate(landslide.detectedAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vị trí</p>
                  <p className="font-medium">
                    {landslide.coordinates.lat.toFixed(6)}, {landslide.coordinates.lng.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Diện tích khu vực</p>
                  <p className="font-medium">{landslide.details.affectedArea}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tác động tiềm tàng</p>
                  <p className="font-medium">{landslide.details.potentialImpact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cập nhật gần nhất</p>
                  <p className="font-medium">{formatDate(landslide.details.lastUpdate)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Hành động</h3>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => onAddToMonitoring(landslide)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Thêm vào danh sách theo dõi
                </Button>
                
                <Button
                  variant="secondary"
                  className="w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Gửi cảnh báo
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Chỉnh sửa thông tin
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get status label
function getStatusLabel(status: string): string {
  switch(status) {
    case 'detected': return 'Phát hiện ban đầu';
    case 'field_verified': return 'Xác minh tại hiện trường';
    case 'monitored': return 'Đang theo dõi';
    default: return status;
  }
}