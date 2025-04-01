// app/dashboard/landslides/components/LandslideList.tsx
import { useState } from 'react';
import LandslideCard from './LandslideCard';
import { LandslidePoint } from '@/app/lib/types/landslide';

interface LandslideListProps {
  landslides: LandslidePoint[];
  onSelectLandslide: (landslide: LandslidePoint) => void;
  selectedLandslide: LandslidePoint | null;
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

export default function LandslideList({ 
  landslides, 
  onSelectLandslide, 
  selectedLandslide,
  filterStatus,
  onFilterChange
}: LandslideListProps) {
  // Filter landslides based on status
  const filteredLandslides = filterStatus === 'all' 
    ? landslides 
    : landslides.filter(loc => loc.status === filterStatus);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <h2 className="text-lg font-medium text-gray-900">Các khu vực sạt lở đã phát hiện</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            {landslides.length} khu vực
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div>
            <select 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="high_risk">Nguy cơ cao</option>
              <option value="active">Đang hoạt động</option>
              <option value="stabilized">Đã ổn định</option>
            </select>
          </div>
          <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium rounded-lg text-sm px-4 py-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Thêm mới
          </button>
          <button className="bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium rounded-lg text-sm px-4 py-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            Lọc nâng cao
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLandslides.map((landslide) => (
          <LandslideCard 
            key={landslide.id} 
            landslide={landslide} 
            onClick={onSelectLandslide}
            isSelected={selectedLandslide?.id === landslide.id}
          />
        ))}
      </div>

      {filteredLandslides.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy dữ liệu</h3>
          <p className="mt-1 text-sm text-gray-500">Không có điểm sạt lở nào phù hợp với bộ lọc.</p>
        </div>
      )}
    </div>
  );
}