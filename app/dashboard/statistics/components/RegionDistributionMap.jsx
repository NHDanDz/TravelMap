'use client';

import React, { useEffect, useRef, useState } from 'react';

// Status mapping for Vietnamese labels and colors
const STATUS_LABELS = {
  'high_risk': 'Nguy cơ cao',
  'active': 'Đang hoạt động',
  'monitored': 'Đang theo dõi',
  'stabilized': 'Đã ổn định',
  'remediated': 'Đã xử lý'
};

const STATUS_COLORS = {
  'high_risk': '#EF4444', // Đỏ
  'active': '#F97316',    // Cam
  'monitored': '#3B82F6',  // Xanh dương
  'stabilized': '#10B981', // Xanh lá
  'remediated': '#6B7280'  // Xám
};

export function RegionDistributionMap({ landslides }) {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [selectedLandslide, setSelectedLandslide] = useState(null);
  
  // Hàm trợ giúp để định dạng ngày tháng
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Tải và khởi tạo bản đồ
  useEffect(() => {
    // Nếu đã tải bản đồ rồi thì không tải lại
    if (mapLoaded) return;
    
    // Giả lập việc tải bản đồ (trong thực tế, bạn sẽ tải thư viện bản đồ như Leaflet hoặc Google Maps)
    const loadMap = () => {
      // Đánh dấu bản đồ đã tải
      setMapLoaded(true);
      
      // Thực tế nên khởi tạo bản đồ ở đây
      // Ví dụ: const mapInstance = L.map(mapContainerRef.current).setView([16, 106], 5);
      // setMap(mapInstance);
    };
    
    loadMap();
    
    // Dọn dẹp khi component unmount
    return () => {
      if (map) {
        // Xóa bản đồ nếu cần
        // map.remove();
      }
    };
  }, [mapLoaded]);

  // Cập nhật các điểm trên bản đồ khi dữ liệu hoặc bản đồ thay đổi
  useEffect(() => {
    if (!mapLoaded || !landslides.length) return;
    
    // Thực tế, bạn sẽ thêm các marker cho từng điểm sạt lở
    // Ví dụ:
    // landslides.forEach(landslide => {
    //   L.marker([landslide.coordinates.lat, landslide.coordinates.lng])
    //     .addTo(map)
    //     .bindPopup(`<b>${landslide.name}</b><br>Trạng thái: ${STATUS_LABELS[landslide.status]}`)
    //     .on('click', () => setSelectedLandslide(landslide));
    // });
    
  }, [landslides, mapLoaded, map]);

  return (
    <div className="relative w-full h-full">
      {/* Container cho bản đồ */}
      <div 
        ref={mapContainerRef}
        className="w-full h-full bg-gray-100 rounded-lg overflow-hidden"
      >
        {/* Hiển thị giả lập bản đồ (trong ứng dụng thực tế, thư viện bản đồ sẽ render vào đây) */}
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-lg font-medium text-gray-600">Bản đồ phân bố sạt lở</p>
            <p className="text-sm text-gray-500">
              (Thư viện bản đồ sẽ hiển thị ở đây - {landslides.length} điểm sạt lở)
            </p>
            
            {/* Danh sách các điểm (thay thế bằng các marker trên bản đồ thực tế) */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-4">
              {landslides.map((landslide) => (
                <div 
                  key={landslide.id}
                  className="bg-white p-2 rounded shadow-sm text-xs cursor-pointer hover:shadow-md"
                  onClick={() => setSelectedLandslide(landslide)}
                >
                  <div className="font-medium truncate">{landslide.name}</div>
                  <div 
                    className="mt-1 px-1 py-0.5 rounded-full text-center text-xs"
                    style={{
                      backgroundColor: `${STATUS_COLORS[landslide.status]}20`,
                      color: STATUS_COLORS[landslide.status]
                    }}
                  >
                    {STATUS_LABELS[landslide.status] || landslide.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Popup thông tin chi tiết khi chọn một điểm */}
      {selectedLandslide && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">{selectedLandslide.name}</h3>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedLandslide(null)}
            >
              ✕
            </button>
          </div>
          
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">ID:</span>
              <span>{selectedLandslide.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vị trí:</span>
              <span>
                {selectedLandslide.coordinates.lat.toFixed(4)}, {selectedLandslide.coordinates.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phát hiện:</span>
              <span>{formatDate(selectedLandslide.detectedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trạng thái:</span>
              <span 
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${STATUS_COLORS[selectedLandslide.status]}20`,
                  color: STATUS_COLORS[selectedLandslide.status]
                }}
              >
                {STATUS_LABELS[selectedLandslide.status] || selectedLandslide.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Diện tích ảnh hưởng:</span>
              <span>{selectedLandslide.details.affectedArea}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ảnh hưởng tiềm tàng:</span>
              <span>{selectedLandslide.details.potentialImpact}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cập nhật cuối:</span>
              <span>{formatDate(selectedLandslide.details.lastUpdate)}</span>
            </div>
          </div>
          
          {/* Lịch sử trạng thái */}
          {selectedLandslide.history && selectedLandslide.history.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Lịch sử trạng thái</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedLandslide.history.map((item, index) => (
                  <div key={index} className="text-xs border-l-2 border-blue-400 pl-2 py-1">
                    <div className="font-medium">{formatDate(item.date)}</div>
                    <div className="text-gray-600">{item.status} - {item.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Chú thích màu cho các trạng thái */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg shadow p-2 z-10">
        <h4 className="text-xs font-medium mb-1">Trạng thái</h4>
        <div className="grid grid-cols-1 gap-1">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Thêm export default cho trường hợp import mặc định
export default RegionDistributionMap;