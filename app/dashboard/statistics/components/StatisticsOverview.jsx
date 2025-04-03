'use client';

import React from 'react';
import { Card, CardBody } from '@/app/components/ui/Card';

export function StatisticsOverview({ landslides, statusDistribution }) {
  // Tính toán số liệu tổng hợp
  const totalLandslides = landslides.length;
  
  // Lọc các trạng thái cần quan tâm
  const highRiskCount = landslides.filter(item => item.status === 'high_risk').length;
  const activeCount = landslides.filter(item => item.status === 'active').length;
  const monitoredCount = landslides.filter(item => item.status === 'monitored').length;
  const stabilizedCount = landslides.filter(item => item.status === 'stabilized').length;
  
  // Tìm điểm sạt lở gần đây nhất
  const sortedByDate = [...landslides].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );
  const mostRecentLandslide = sortedByDate.length > 0 ? sortedByDate[0] : null;
  
  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Biểu đồ mini với thanh ngang
  const MiniBarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.count));
    
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
    
    return (
      <div className="space-y-3 mt-2">
        {data.map((item) => (
          <div key={item.status}>
            <div className="flex justify-between text-xs mb-1">
              <span>{STATUS_LABELS[item.status] || item.status}</span>
              <span>{item.count} ({item.percentage}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${(item.count / maxValue) * 100}%`,
                  backgroundColor: STATUS_COLORS[item.status] || '#777' 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tổng số điểm sạt lở */}
      <Card>
        <CardBody className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Tổng số điểm sạt lở</h3>
          <div className="mt-1 text-3xl font-semibold">{totalLandslides}</div>
          <div className="mt-4 text-xs text-gray-500">
            Phát hiện mới nhất: {mostRecentLandslide ? formatDate(mostRecentLandslide.detectedAt) : 'N/A'}
          </div>
        </CardBody>
      </Card>
      
      {/* Nguy cơ cao */}
      <Card>
        <CardBody className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Nguy cơ cao</h3>
          <div className="mt-1 text-3xl font-semibold text-red-600">{highRiskCount}</div>
          <div className="mt-4">
            <div className="flex justify-between text-xs">
              <span>Tỷ lệ</span>
              <span>{totalLandslides ? Math.round((highRiskCount / totalLandslides) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${totalLandslides ? (highRiskCount / totalLandslides) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Đang hoạt động */}
      <Card>
        <CardBody className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Đang hoạt động</h3>
          <div className="mt-1 text-3xl font-semibold text-orange-500">{activeCount}</div>
          <div className="mt-4">
            <div className="flex justify-between text-xs">
              <span>Tỷ lệ</span>
              <span>{totalLandslides ? Math.round((activeCount / totalLandslides) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${totalLandslides ? (activeCount / totalLandslides) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Phân bố trạng thái */}
      <Card>
        <CardBody className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Phân bố trạng thái</h3>
          <MiniBarChart data={statusDistribution} />
        </CardBody>
      </Card>
    </div>
  );
}

// Thêm export default cho trường hợp import mặc định
export default StatisticsOverview;