'use client';

import React from 'react';

export function MonthlyDetectionChart({ data }) {
  // Tìm giá trị lớn nhất để tỷ lệ hóa các cột
  const maxCount = Math.max(...data.map(item => item.count));
  
  return (
    <div className="w-full h-72 flex flex-col">
      <div className="flex-1 flex items-end">
        {data.map((item, index) => {
          // Tính chiều cao của cột dựa vào giá trị và giá trị lớn nhất
          const heightPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          
          return (
            <div 
              key={index} 
              className="flex-1 flex flex-col items-center"
            >
              {/* Giá trị số trên đầu cột */}
              <div className="text-xs font-medium mb-1">{item.count}</div>
              
              {/* Cột biểu đồ */}
              <div 
                className="w-full mx-1 bg-blue-500 rounded-t-sm" 
                style={{ 
                  height: `${heightPercent}%`,
                  minHeight: item.count > 0 ? '4px' : '0'
                }}
              />
            </div>
          );
        })}
      </div>
      
      {/* Trục x */}
      <div className="flex mt-2">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex-1 text-center"
          >
            <div 
              className="text-xs transform -rotate-45 origin-top-left translate-y-2 translate-x-2 whitespace-nowrap"
            >
              {item.month}
            </div>
          </div>
        ))}
      </div>
      
      {/* Chú thích bổ sung */}
      <div className="mt-10 text-center text-xs text-gray-500">
        Số lượng sạt lở phát hiện theo tháng
      </div>
    </div>
  );
}

// Thêm export default cho trường hợp import mặc định
export default MonthlyDetectionChart;