// app/dashboard/landslides/components/LandslideCard.tsx
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { LandslidePoint } from '@/app/lib/types/landslide';
import { useState, useEffect } from 'react';

interface LandslideCardProps {
  landslide: LandslidePoint;
  onClick: (landslide: LandslidePoint) => void;
  isSelected: boolean;
}

// Helper function to format date if the imported one isn't available
function formatDate(dateString: string, locale: string = 'vi-VN'): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error("Lỗi khi định dạng ngày:", error);
    return dateString || 'N/A';
  }
}

// Function to generate satellite image URL
function getSatelliteImageUrl(lat: number, lng: number, width: number = 400, height: number = 200): string {
  try {
    // Tạo buffer zone xung quanh tọa độ (+-0.01 độ)
    const buffer = 0.01;
    
    // Tạo URL cho Esri World Imagery Static Map
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lng-buffer},${lat-buffer},${lng+buffer},${lat+buffer}&size=${width},${height}&format=png&f=image&bboxSR=4326&imageSR=4326`;
  } catch (error) {
    console.error("Lỗi khi tạo URL ảnh vệ tinh:", error);
    return '';
  }
}

export default function LandslideCard({ landslide, onClick, isSelected }: LandslideCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Reset loading states when landslide changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [landslide.id]);
  
  // Kiểm tra và đảm bảo dữ liệu hợp lệ
  const affectedArea = landslide.details?.affectedArea || 'N/A';
  const lastUpdate = landslide.details?.lastUpdate || landslide.detectedAt || new Date().toISOString();
  
  // Generate the satellite image URL
  const satelliteImageUrl = getSatelliteImageUrl(
    landslide.coordinates.lat, 
    landslide.coordinates.lng
  );
  
  return (
    <div 
      className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow transition cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onClick(landslide)}
    >
      <div className="relative h-36 bg-gray-200">
        {/* Fallback gradient background if image fails to load */}
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-80"></div>
        )}
        
        {/* Actual satellite image */}
        {satelliteImageUrl && (
          <img 
            src={satelliteImageUrl}
            alt={`Ảnh vệ tinh khu vực ${landslide.name}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Semi-transparent overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Card content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center z-10">
            <p className="text-lg font-semibold">Ảnh vệ tinh</p>
            <p className="text-sm">Khu vực {landslide.name}</p>
          </div>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-2 right-2 z-20">
          <StatusBadge status={landslide.status} />
        </div>
        
        {/* Coordinates overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {landslide.coordinates.lat.toFixed(4)}, {landslide.coordinates.lng.toFixed(4)}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">{landslide.name}</h3>
          <span className="text-xs text-gray-500">ID: {landslide.id}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Phát hiện: {formatDate(landslide.detectedAt)}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Vĩ độ:</span> {landslide.coordinates.lat.toFixed(4)}
          </div>
          <div>
            <span className="text-gray-500">Kinh độ:</span> {landslide.coordinates.lng.toFixed(4)}
          </div>
          <div>
            <span className="text-gray-500">Diện tích:</span> {affectedArea}
          </div>
          <div>
            <span className="text-gray-500">Cập nhật:</span> {formatDate(lastUpdate)}
          </div>
        </div>
      </div>
    </div>
  );
}