'use client';

import React from 'react';

const STATUS_COLORS = {
  'high_risk': '#EF4444', // Đỏ
  'active': '#F97316',    // Cam
  'monitored': '#3B82F6',  // Xanh dương
  'stabilized': '#10B981', // Xanh lá
  'remediated': '#6B7280'  // Xám
};

const STATUS_LABELS = {
  'high_risk': 'Nguy cơ cao',
  'active': 'Đang hoạt động',
  'monitored': 'Đang theo dõi',
  'stabilized': 'Đã ổn định',
  'remediated': 'Đã xử lý'
};

export function StatusDistributionChart({ data }) {
  // Tính tổng số lượng để tính phần trăm
  const totalCount = data.reduce((acc, item) => acc + item.count, 0);
  
  return (
    <div className="w-full h-72 flex flex-col items-center justify-center">
      {/* Biểu đồ cột ngang */}
      <div className="w-full max-w-md space-y-4">
        {data.map((item) => (
          <div key={item.status} className="w-full">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                {STATUS_LABELS[item.status] || item.status}
              </span>
              <span className="text-sm text-gray-500">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-5">
              <div 
                className="h-5 rounded-full flex items-center pl-2 text-xs text-white font-medium" 
                style={{ 
                  width: `${Math.max(item.percentage, 5)}%`, // Ít nhất 5% để hiển thị
                  backgroundColor: STATUS_COLORS[item.status] || '#777' 
                }}
              >
                {item.percentage > 10 ? `${item.percentage}%` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Chú thích màu */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {data.map((item) => (
          <div key={item.status} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: STATUS_COLORS[item.status] || '#777' }}
            />
            <span className="text-sm">{STATUS_LABELS[item.status] || item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Thêm export default cho trường hợp import mặc định
export default StatusDistributionChart;