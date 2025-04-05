'use client';

import { useState } from 'react';
import { PlaceType } from '../dashboard/Map/types';

export default function TestFoursquare() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const testFoursquareAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Kiểm tra xem API key có tồn tại không (không hiển thị đầy đủ vì lý do bảo mật)
      const response = await fetch('/api/test-key');
      const keyData = await response.json();
      setApiKey(keyData.exists ? 'API key tồn tại' : 'API key không tồn tại');
      
      if (!keyData.exists) {
        throw new Error('API key không được cấu hình');
      }

      // Gọi API để lấy dữ liệu từ Foursquare
      const params = new URLSearchParams({
        lat: '21.0285',  // Tọa độ Hà Nội
        lng: '105.8542',
        type: 'restaurant' as PlaceType,
        radius: '1000'
      });
  
      const placesResponse = await fetch(`/api/places?${params.toString()}`);
      
      if (!placesResponse.ok) {
        const errData = await placesResponse.json();
        throw new Error(`API error: ${errData.error || placesResponse.status}`);
      }
  
      const data = await placesResponse.json();
      setResults(data.slice(0, 5)); // Hiển thị 5 kết quả đầu tiên
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Kiểm tra Foursquare API</h1>
      
      <button 
        onClick={testFoursquareAPI}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        disabled={loading}
      >
        {loading ? 'Đang kiểm tra...' : 'Kiểm tra API'}
      </button>
      
      {apiKey && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">API Key:</h2>
          <div className="p-2 bg-gray-100 rounded">{apiKey}</div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded">
          <h2 className="text-lg font-semibold text-red-700">Lỗi:</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Kết quả từ Foursquare:</h2>
          <div className="bg-gray-100 p-4 rounded">
            {results.map((place, index) => (
              <div key={index} className="mb-4 p-2 bg-white rounded shadow">
                <h3 className="font-bold">{place.name}</h3>
                <p>Loại: {place.type}</p>
                <p>Vị trí: {place.latitude}, {place.longitude}</p>
                <p>Đánh giá: {place.rating}</p>
                {place.details && (
                  <div className="mt-2">
                    <p>Địa chỉ: {place.details.address || 'Không có'}</p>
                    <p>Điện thoại: {place.details.phone || 'Không có'}</p>
                    {place.details.website && (
                      <p>Website: <a href={place.details.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{place.details.website}</a></p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Hướng dẫn khắc phục lỗi:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Kiểm tra file <code>.env.local</code> có chứa <code>NEXT_PUBLIC_FOURSQUARE_API_KEY=your_key_here</code></li>
          <li>Kiểm tra xem API key có hợp lệ và còn hoạt động không</li>
          <li>Kiểm tra xem ứng dụng đã được khởi động lại sau khi thêm API key</li>
          <li>Kiểm tra console để xem có lỗi nào khác không</li>
        </ul>
      </div>
    </div>
  );
}