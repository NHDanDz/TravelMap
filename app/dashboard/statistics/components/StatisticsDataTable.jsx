'use client';

import React, { useState } from 'react';
import { Card, CardBody } from '@/app/components/ui/Card';

// Status mapping for Vietnamese labels
const STATUS_LABELS = {
  'high_risk': 'Nguy cơ cao',
  'active': 'Đang hoạt động',
  'monitored': 'Đang theo dõi',
  'stabilized': 'Đã ổn định',
  'remediated': 'Đã xử lý'
};

// Status mapping for CSS classes
const STATUS_CLASSES = {
  'high_risk': 'bg-red-100 text-red-800',
  'active': 'bg-orange-100 text-orange-800',
  'monitored': 'bg-blue-100 text-blue-800',
  'stabilized': 'bg-green-100 text-green-800',
  'remediated': 'bg-gray-100 text-gray-800'
};

export function StatisticsDataTable({ landslides }) {
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State cho sắp xếp
  const [sortField, setSortField] = useState('detectedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Hàm trợ giúp để định dạng ngày tháng
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Hàm xử lý sắp xếp dữ liệu
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sắp xếp dữ liệu
  const sortedData = [...landslides].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Xử lý đặc biệt cho trường detectedAt (date)
    if (sortField === 'detectedAt') {
      aValue = new Date(a.detectedAt).getTime();
      bValue = new Date(b.detectedAt).getTime();
    }
    
    // Xử lý đặc biệt cho các trường lồng nhau
    if (sortField.includes('.')) {
      const fields = sortField.split('.');
      aValue = fields.reduce((obj, field) => obj?.[field], a);
      bValue = fields.reduce((obj, field) => obj?.[field], b);
    }
    
    // So sánh và sắp xếp
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Phân trang
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = sortedData.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Component hiển thị mũi tên sắp xếp
  const SortArrow = ({ field }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-300">↕</span>;
    return sortDirection === 'asc' 
      ? <span className="ml-1 text-blue-500">↑</span> 
      : <span className="ml-1 text-blue-500">↓</span>;
  };

  return (
    <Card>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  ID <SortArrow field="id" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Tên <SortArrow field="name" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('detectedAt')}
                >
                  Phát hiện <SortArrow field="detectedAt" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Trạng thái <SortArrow field="status" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('details.affectedArea')}
                >
                  Diện tích ảnh hưởng <SortArrow field="details.affectedArea" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('details.potentialImpact')}
                >
                  Ảnh hưởng tiềm tàng <SortArrow field="details.potentialImpact" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('details.lastUpdate')}
                >
                  Cập nhật cuối <SortArrow field="details.lastUpdate" />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((landslide) => (
                <tr key={landslide.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {landslide.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {landslide.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {landslide.coordinates.lat.toFixed(4)}, {landslide.coordinates.lng.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(landslide.detectedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_CLASSES[landslide.status] || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_LABELS[landslide.status] || landslide.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {landslide.details.affectedArea}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {landslide.details.potentialImpact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(landslide.details.lastUpdate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Phân trang */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <select 
              className="border border-gray-300 rounded p-1 text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5 / trang</option>
              <option value="10">10 / trang</option>
              <option value="20">20 / trang</option>
              <option value="50">50 / trang</option>
            </select>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Trước
            </button>
            
            <div className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
              {currentPage} / {totalPages || 1}
            </div>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 rounded text-sm ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Sau
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// Thêm export default cho trường hợp import mặc định
export default StatisticsDataTable;