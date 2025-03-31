// app/dashboard/landslides/components/LandslideCard.tsx
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { formatDate } from '@/app/lib/utils';
import { LandslidePoint } from '@/app/lib/types/landslide';

interface LandslideCardProps {
  landslide: LandslidePoint;
  onClick: (landslide: LandslidePoint) => void;
  isSelected: boolean;
}

export default function LandslideCard({ landslide, onClick, isSelected }: LandslideCardProps) {
  return (
    <div 
      className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow transition cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onClick(landslide)}
    >
      <div className="relative h-36 bg-gray-200">
        {/* Simulated satellite image */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-80"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-lg font-semibold">Ảnh vệ tinh</p>
            <p className="text-sm">Khu vực {landslide.name}</p>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <StatusBadge status={landslide.status} />
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
            <span className="text-gray-500">Diện tích:</span> {landslide.details.affectedArea}
          </div>
          <div>
            <span className="text-gray-500">Cập nhật:</span> {formatDate(landslide.details.lastUpdate)}
          </div>
        </div>
      </div>
    </div>
  );
}