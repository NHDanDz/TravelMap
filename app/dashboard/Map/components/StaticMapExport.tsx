// app/dashboard/Map/components/StaticMapExport.tsx
'use client';

import React, { useState } from 'react';
import { Camera, Download, Share, Copy } from 'lucide-react';

interface StaticMapExportProps {
  center: [number, number];
  zoom: number;
  markers: Array<{
    longitude: number;
    latitude: number;
    label?: string;
  }>;
}

const StaticMapExport = ({ center, zoom, markers }: StaticMapExportProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 600, height: 400 });
  const [format, setFormat] = useState('png');
  const [style, setStyle] = useState('streets-v12');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  const generateStaticMap = () => {
    setIsLoading(true);
    
    // Tạo URL cho Static Images API
    let url = `https://api.mapbox.com/styles/v1/mapbox/${style}/static`;
    
    // Thêm markers nếu có
    if (markers && markers.length > 0) {
      const markerString = markers.map(marker => {
        const label = marker.label ? `,${encodeURIComponent(marker.label)}` : '';
        return `pin-s+f74e4e(${marker.longitude},${marker.latitude})${label}`;
      }).join(',');
      
      url += `/${markerString}`;
    }
    
    // Thêm center và zoom
    url += `/${center[0]},${center[1]},${zoom}`;
    
    // Thêm kích thước
    url += `/${mapSize.width}x${mapSize.height}`;
    
    // Định dạng và token
    url += `?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
    
    // Hiển thị preview
    setImageUrl(url);
    setIsLoading(false);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(imageUrl);
    // Hiển thị thông báo đã copy
  };
  
  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `travelsense-map-${new Date().toISOString().slice(0, 10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-md"
      >
        <Camera className="w-5 h-5 text-blue-600" />
        <span>Tạo ảnh bản đồ</span>
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-lg p-4 w-[calc(100%-2rem)] max-w-2xl max-h-[calc(100vh-2rem)] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tạo ảnh bản đồ tĩnh</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kiểu bản đồ</label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="streets-v12">Đường phố</option>
                  <option value="outdoors-v12">Ngoài trời</option>
                  <option value="light-v11">Sáng</option>
                  <option value="dark-v11">Tối</option>
                  <option value="satellite-v9">Vệ tinh</option>
                  <option value="satellite-streets-v12">Vệ tinh với đường</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Định dạng</label>
                <select 
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chiều rộng (px)</label>
                <input 
                  type="number"
                  value={mapSize.width}
                  onChange={(e) => setMapSize({...mapSize, width: parseInt(e.target.value)})}
                  min="200"
                  max="1280"
                  className="w-full border rounded-md p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao (px)</label>
                <input 
                  type="number"
                  value={mapSize.height}
                  onChange={(e) => setMapSize({...mapSize, height: parseInt(e.target.value)})}
                  min="200"
                  max="1280"
                  className="w-full border rounded-md p-2"
                />
              </div>
            </div>
            
            <button
              onClick={generateStaticMap}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md mb-4"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo ảnh bản đồ'}
            </button>
            
            {imageUrl && (
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <img src={imageUrl} alt="Static Map" className="w-full" />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={downloadImage}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 rounded-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải xuống</span>
                  </button>
                  
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-md"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Sao chép URL</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'TravelSense Map',
                          text: 'Xem bản đồ du lịch của tôi',
                          url: imageUrl
                        });
                      } else {
                        copyToClipboard();
                      }
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 rounded-md"
                  >
                    <Share className="w-4 h-4" />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StaticMapExport;