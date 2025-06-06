// app/dashboard/page.tsx
// Đây là một giải pháp đơn giản nhất để import CSS cho Leaflet mà không gây lỗi

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Map as MapIcon } from 'lucide-react';

export default function DashboardPage() {
  // Import CSS cho Leaflet chỉ tại component này
  useEffect(() => {
    // Thêm CSS cho Leaflet
    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCss);

    // Thêm CSS cho Leaflet Routing Machine
    const routingCss = document.createElement('link');
    routingCss.rel = 'stylesheet';
    routingCss.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
    document.head.appendChild(routingCss);

    // Không cần cleanup vì chúng ta muốn giữ CSS này trong toàn bộ ứng dụng
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Chào mừng đến với TravelSense</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Khám phá những địa điểm tuyệt vời</h2>
        <p className="text-gray-600 mb-4">
          Sử dụng TravelSense để tìm kiếm và khám phá những địa điểm thú vị xung quanh bạn. 
          Từ nhà hàng ngon đến các địa điểm du lịch nổi tiếng, chúng tôi giúp bạn tìm thấy 
          những trải nghiệm tuyệt vời nhất.
        </p>
        
        <Link 
          href="/dashboard/Map" 
          className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MapIcon className="w-5 h-5 mr-2" />
          Khám phá bản đồ
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Khám phá</h3>
          <p className="text-gray-600 mb-3">
            Tìm kiếm các địa điểm thú vị gần bạn với bản đồ tương tác.
          </p>
          <Link href="/dashboard/Map" className="text-blue-600 hover:underline">
            Xem bản đồ
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Lên kế hoạch</h3>
          <p className="text-gray-600 mb-3">
            Tạo lịch trình cho chuyến đi của bạn với các địa điểm yêu thích.
          </p>
          <a href="#" className="text-blue-600 hover:underline">
            Tạo lịch trình
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Lưu lại</h3>
          <p className="text-gray-600 mb-3">
            Lưu các địa điểm yêu thích để truy cập nhanh chóng sau này.
          </p>
          <a href="#" className="text-blue-600 hover:underline">
            Xem danh sách đã lưu
          </a>
        </div>
      </div>
    </div>
  );
}