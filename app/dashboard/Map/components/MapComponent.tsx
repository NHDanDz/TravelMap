// app/dashboard/Map/components/MapComponent.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icon configuration
const customIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface MapComponentProps {
  goToCoords?: { lat: number; lng: number } | null;
  detectionMode?: boolean;
  fullscreen?: boolean;
}


// Hàm tính toán hình vuông 5000x5000m xung quanh điểm
function calculateSquareBounds(latLng: L.LatLng): L.LatLngBounds {
  // Độ dài 2500m tính theo độ (xấp xỉ)
  // 1 độ vĩ độ ≈ 111.32 km ở xích đạo
  // 1 độ kinh độ ≈ 111.32 * cos(latitude) km
  const latOffset = 2500 / 111320; // độ dài 2500m theo độ vĩ độ
  const longOffset = 2500 / (111320 * Math.cos(latLng.lat * Math.PI / 180)); // độ dài 2500m theo độ kinh độ

  const northEast = L.latLng(latLng.lat + latOffset, latLng.lng + longOffset);
  const southWest = L.latLng(latLng.lat - latOffset, latLng.lng - longOffset);

  return L.latLngBounds(southWest, northEast);
}

// Component để di chuyển bản đồ khi có tọa độ mới
function MapCenterControl({ goToCoords }: { goToCoords: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (goToCoords) {
      map.flyTo([goToCoords.lat, goToCoords.lng], 15, {
        duration: 1.5 // Thời gian di chuyển (giây)
      });
    }
  }, [map, goToCoords]);
  
  return null;
}

function LocationMarker({ 
  onLocationSelect, 
  onSendCoordinates,
  searchPosition
}: { 
  onLocationSelect: (lat: number, lng: number) => void;
  onSendCoordinates: (lat: number, lng: number) => void;
  searchPosition: { lat: number; lng: number } | null;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const alreadySent = useRef<{[key: string]: boolean}>({});

  // Cập nhật vị trí khi có tọa độ tìm kiếm mới
  useEffect(() => {
    if (searchPosition) {
      const newPosition = new L.LatLng(searchPosition.lat, searchPosition.lng);
      setPosition(newPosition);
      onLocationSelect(searchPosition.lat, searchPosition.lng);
      
      // Tạo khóa duy nhất cho tọa độ
      const posKey = `${searchPosition.lat.toFixed(6)},${searchPosition.lng.toFixed(6)}`;
      
      // Chỉ gửi API nếu chưa gửi cho tọa độ này trước đó
      if (!alreadySent.current[posKey]) {
        onSendCoordinates(searchPosition.lat, searchPosition.lng);
        alreadySent.current[posKey] = true;
      }
      
      // Tính toán bounds cho hình vuông
      const newBounds = calculateSquareBounds(newPosition);
      setBounds(newBounds);
    }
  }, [searchPosition, onLocationSelect, onSendCoordinates]);

  const map = useMapEvents({
    click(e) {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control')) {
        return;
      }
      
      setPosition(e.latlng);
      setBounds(calculateSquareBounds(e.latlng));
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      
      // Gửi tọa độ lên server
      onSendCoordinates(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <>
      <Marker position={position} icon={customIcon}>
        <Popup>
          <div>
            <h3 className="font-medium">Vị trí đã chọn</h3>
            <p className="text-sm">Kinh độ: {position.lng.toFixed(6)}</p>
            <p className="text-sm">Vĩ độ: {position.lat.toFixed(6)}</p>
            <p className="text-sm text-gray-500 mt-2">Tọa độ đã được gửi lên server</p>
          </div>
        </Popup>
      </Marker>
      {bounds && (
        <Rectangle 
          bounds={bounds}
          pathOptions={{
            color: '#0c4cb3',
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            weight: 2
          }}
        >
          <Popup>
            <div>
              <h3 className="font-medium">Vùng phân tích</h3>
              <p className="text-sm">Kích thước: 5km × 5km</p>
              <p className="text-sm">Phạm vi kiểm tra lở đất</p>
            </div>
          </Popup>
        </Rectangle>
      )}
    </>
  );
}

export default function MapComponent({ 
  goToCoords = null,
  detectionMode = false,
  fullscreen = false
}: MapComponentProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
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

  // Fix cho Leaflet icons trong Next.js
  useEffect(() => {
    // Sử dụng cách khác để cài đặt icon mặc định
    L.Marker.prototype.options.icon = customIcon;
  }, []);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    console.log('Vị trí được chọn:', { lat, lng });
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
        
        console.log(response);

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
      const apiUrl = process.env.NEXT_PUBLIC_COORDINATES_SERVER_URL || 'https://f6c3-27-72-102-101.ngrok-free.app/api/landslide';
      
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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          console.error('Lỗi khi lấy vị trí:', error);
          // Fallback to Vietnam coordinates
          setCurrentLocation([21.0285, 105.8542]);
          setLoading(false);
        }
      );
    } else {
      console.error('Trình duyệt không hỗ trợ geolocation');
      // Fallback to Vietnam coordinates
      setCurrentLocation([21.0285, 105.8542]);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }
  const containerClass = fullscreen 
    ? "w-full h-screen" 
    : "w-full h-full min-h-[600px]";
  
  return (
    <div className={`w-full h-full ${fullscreen ? 'absolute inset-0' : 'relative'}`}>
      <MapContainer
        center={currentLocation || [21.0285, 105.8542]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false} // Tắt zoom control mặc định
        attributionControl={false} // Tắt attribution control mặc định
      >
      <div className="leaflet-control-container">
        <div className="leaflet-top leaflet-right" style={{ zIndex: 1000, marginTop: '10px', marginRight: '10px' }}>
          <div className="leaflet-control-zoom leaflet-bar leaflet-control">
            <a className="leaflet-control-zoom-in" href="#" title="Zoom in" role="button" aria-label="Zoom in">+</a>
            <a className="leaflet-control-zoom-out" href="#" title="Zoom out" role="button" aria-label="Zoom out">−</a>
          </div>
        </div>
      </div>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {currentLocation && (
          <Marker position={currentLocation} icon={customIcon}>
            <Popup>Vị trí của bạn</Popup>
          </Marker>
        )}

        <LocationMarker 
          onLocationSelect={handleLocationSelect} 
          onSendCoordinates={sendCoordinates}
          searchPosition={goToCoords}
        />
        
        {/* Component điều khiển tọa độ trung tâm bản đồ */}
        <MapCenterControl goToCoords={goToCoords} />
      </MapContainer>

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