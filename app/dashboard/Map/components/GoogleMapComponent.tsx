// app/dashboard/Map/components/GoogleMapComponent.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

interface GoogleMapComponentProps {
  apiKey?: string;
}

export default function GoogleMapComponent({ apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '' }: GoogleMapComponentProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendStatus, setSendStatus] = useState<{
    status: 'idle' | 'sending' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });
  const [landslideResults, setLandslideResults] = useState<{
    id: string;
    status: string;
    landslideDetected?: boolean;
    coordinates?: any;
    processingComplete: boolean;
  } | null>(null);

  // Lấy vị trí hiện tại
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        (error) => {
          console.error('Lỗi khi lấy vị trí:', error);
          // Fallback to Vietnam coordinates
          setCurrentLocation({ lat: 21.0285, lng: 105.8542 });
          setLoading(false);
        }
      );
    } else {
      console.error('Trình duyệt không hỗ trợ geolocation');
      // Fallback to Vietnam coordinates
      setCurrentLocation({ lat: 21.0285, lng: 105.8542 });
      setLoading(false);
    }
  }, []);

  // Hàm theo dõi trạng thái xử lý từ server
  const startPollingStatus = useCallback((landslideId: string) => {
    // Tạo biến để theo dõi số lần kiểm tra
    let pollCount = 0;
    const maxPolls = 30; // Tối đa 30 lần kiểm tra (5 phút nếu mỗi lần 10 giây)
    
    // Tạo biến cho interval để có thể clear sau này
    const intervalId = setInterval(async () => {
      try {
        pollCount++;
        
        // Tạo URL để kiểm tra trạng thái
        const statusUrl = 'https://f6c3-27-72-102-101.ngrok-free.app/api/landslide' + landslideId;
        
        console.log(`Checking status (${pollCount}/${maxPolls}):`, statusUrl);
        
        const response = await fetch(statusUrl, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error when checking status: ${response.status}`);
        }
        
        const statusData = await response.json();
        console.log('Status response:', statusData);
        
        // Cập nhật state với kết quả mới nhất
        setLandslideResults({
          id: landslideId,
          status: statusData.status,
          landslideDetected: statusData.landslide_detected,
          coordinates: statusData.landslide_coordinates,
          processingComplete: statusData.status === 'success' || statusData.status === 'error'
        });
        
        // Nếu đã hoàn thành hoặc lỗi, dừng kiểm tra
        if (statusData.status === 'success' || statusData.status === 'error') {
          clearInterval(intervalId);
          console.log('Processing complete:', statusData);
          
          // Hiển thị thông báo kết quả
          setSendStatus({
            status: statusData.status === 'success' ? 'success' : 'error',
            message: statusData.status === 'success' 
              ? `Xử lý hoàn tất: ${statusData.landslide_detected ? 'Phát hiện lở đất!' : 'Không phát hiện lở đất.'}`
              : `Lỗi khi xử lý: ${statusData.message || 'Không rõ lỗi'}`
          });
          
          // Thông báo tự động biến mất sau 10 giây
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 10000);
        }
        
        // Nếu đã kiểm tra đủ số lần tối đa, dừng lại
        if (pollCount >= maxPolls) {
          clearInterval(intervalId);
          console.log('Reached maximum number of status checks');
          
          setSendStatus({
            status: 'error',
            message: 'Đã hết thời gian chờ xử lý. Vui lòng kiểm tra lại sau.'
          });
          
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 5000);
        }
      } catch (error) {
        console.error('Error checking landslide status:', error);
        
        // Nếu lỗi nhiều lần liên tiếp, có thể dừng kiểm tra
        if (pollCount >= 3) { // Dừng sau 3 lần lỗi
          clearInterval(intervalId);
          
          setSendStatus({
            status: 'error',
            message: error instanceof Error ? error.message : 'Lỗi kiểm tra trạng thái'
          });
          
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 5000);
        }
      }
    }, 10000); // Kiểm tra mỗi 10 giây
    
    // Trả về hàm để clear interval nếu cần
    return () => clearInterval(intervalId);
  }, []);

  const sendCoordinates = async (lat: number, lng: number) => {
    try {
      setSendStatus({ status: 'sending' });
      
      // Tạo payload phù hợp với GEE (X: kinh độ/longitude, Y: vĩ độ/latitude)
      const payload = {
        X: lng,  // Kinh độ (longitude) - GEE expects this first
        Y: lat,  // Vĩ độ (latitude) 
        event_date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        api_key: process.env.NEXT_PUBLIC_API_KEY || "10102003" // Thêm API key từ biến môi trường
      };
      
      console.log('Sending to API:', payload);
      
      // Sử dụng biến môi trường từ Next.js hoặc Ngrok URL từ file .env.local
      const apiUrl = process.env.NEXT_PUBLIC_COORDINATES_SERVER_URL ;
      
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || "10102003"}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Coordinates sent successfully:', data);
      
      // Lưu ID vào state để theo dõi kết quả
      const landslideId = data.id;
      setLandslideResults({
        id: landslideId,
        status: 'processing',
        processingComplete: false
      });
      
      setSendStatus({ 
        status: 'success', 
        message: 'Tọa độ đã được gửi thành công! ID: ' + landslideId 
      });
      
      // Bắt đầu theo dõi trạng thái xử lý
      startPollingStatus(landslideId);
      
      // Thông báo sẽ tự động biến mất sau khi theo dõi trạng thái bắt đầu
      setTimeout(() => {
        setSendStatus({ status: 'idle' });
      }, 5000);
    } catch (error) {
      console.error('Error sending coordinates:', error);
      setSendStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Lỗi khi gửi tọa độ' 
      });
    }
  };

  if (loading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  // Component cho marker và xử lý sự kiện
  const MapContent = () => {
    const map = useMap();
    
    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setSelectedLocation({ lat, lng });
      console.log('Vị trí được chọn:', { lat, lng });
      
      // Gửi tọa độ lên server
      sendCoordinates(lat, lng);
    }, []);
    
    useEffect(() => {
      if (!map) return;
      
      // Đăng ký sự kiện click trên map
      const clickListener = map.addListener('click', handleMapClick);
      
      // Cleanup listener khi component unmount
      return () => {
        google.maps.event.removeListener(clickListener);
      };
    }, [map, handleMapClick]);
    
    return (
      <>
        {currentLocation && (
          <AdvancedMarker position={currentLocation} title="Vị trí của bạn">
            <Pin background={'#4285F4'} glyphColor={'#FFF'} borderColor={'#4285F4'} />
          </AdvancedMarker>
        )}
        
        {selectedLocation && (
          <AdvancedMarker position={selectedLocation} title="Vị trí đã chọn">
            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
          </AdvancedMarker>
        )}
      </>
    );
  };

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={apiKey} onLoad={() => console.log('Maps API đã tải xong')}>
        <Map
          defaultZoom={13}
          defaultCenter={currentLocation || { lat: 21.0285, lng: 105.8542 }}
          mapId="DEMO_MAP_ID" // Thay thế bằng map ID từ Google Cloud Console của bạn
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={true}
        >
          <MapContent />
        </Map>
      </APIProvider>

      {/* Thông báo trạng thái */}
      {sendStatus.status !== 'idle' && (
        <div className={`absolute bottom-4 right-4 p-4 rounded-lg shadow-lg z-[9999] ${
          sendStatus.status === 'sending' ? 'bg-blue-100 text-blue-800' :
          sendStatus.status === 'success' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {sendStatus.status === 'sending' && 'Đang gửi tọa độ...'}
          {sendStatus.status === 'success' && sendStatus.message}
          {sendStatus.status === 'error' && `Lỗi: ${sendStatus.message}`}
        </div>
      )}
      
      {/* Hiển thị kết quả xử lý lở đất */}
      {landslideResults && landslideResults.processingComplete && (
        <div className="absolute top-4 right-4 p-4 bg-white rounded-lg shadow-lg z-[9999] max-w-xs">
          <h3 className="font-bold text-lg">Kết quả phân tích</h3>
          <p className="text-sm mb-2">ID: {landslideResults.id}</p>
          
          {landslideResults.status === 'success' ? (
            <>
              <div className={`p-2 mb-2 rounded ${
                landslideResults.landslideDetected 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {landslideResults.landslideDetected 
                  ? '⚠️ Phát hiện lở đất!' 
                  : '✅ Không phát hiện lở đất.'}
              </div>
              
              {landslideResults.landslideDetected && landslideResults.coordinates && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <p className="font-medium">Tọa độ lở đất:</p>
                  <pre className="overflow-x-auto">
                    {JSON.stringify(landslideResults.coordinates, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="p-2 bg-red-100 text-red-800 rounded">
              Xử lý thất bại. Vui lòng thử lại.
            </div>
          )}
          
          <button 
            className="mt-2 w-full py-1 px-3 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            onClick={() => setLandslideResults(null)}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}