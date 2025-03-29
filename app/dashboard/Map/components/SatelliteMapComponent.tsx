'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LandslideMarkerLayer from './LandslideMarkerLayer';

// Định nghĩa các kiểu dữ liệu
interface LandslideCoordinate {
  segment_id: string;
  east: number;
  north: number;
}

interface LandslideResult {
  id: string;
  status: string;
  landslideDetected?: boolean;
  landslide_coordinates?: { 
    coordinates: LandslideCoordinate[] 
  };
  processingComplete: boolean;
}

interface StatusState {
  status: 'idle' | 'sending' | 'success' | 'error';
  message?: string;
}

interface LocationMarkerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  searchPosition: { lat: number; lng: number } | null;
  initialSearchProcessed: boolean;
  searchCounter: number; // Thêm prop mới
}

interface MapCenterControlProps {
  goToCoords: { lat: number; lng: number } | null;
  initialSearch: boolean;
  setInitialSearchProcessed: (value: boolean) => void;
  searchCounter: number; // Thêm prop mới
}

interface SatelliteMapComponentProps {
  goToCoords?: { lat: number; lng: number } | null;
}

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

// Calculate 5000x5000m square around a point
function calculateSquareBounds(latLng: L.LatLng): L.LatLngBounds {
  // 2500m distance in degrees (approximate)
  // 1 degree latitude ≈ 111.32 km at equator
  // 1 degree longitude ≈ 111.32 * cos(latitude) km
  const latOffset = 2500 / 111320; // 2500m in latitude degrees
  const longOffset = 2500 / (111320 * Math.cos(latLng.lat * Math.PI / 180)); // 2500m in longitude degrees

  const northEast = L.latLng(latLng.lat + latOffset, latLng.lng + longOffset);
  const southWest = L.latLng(latLng.lat - latOffset, latLng.lng - longOffset);

  return L.latLngBounds(southWest, northEast);
}

// Component to move map when new coordinates are provided
function MapCenterControl({ goToCoords, initialSearch, setInitialSearchProcessed, searchCounter }: MapCenterControlProps) {
  const map = useMap();
  
  useEffect(() => {
    if (goToCoords && initialSearch) {
      map.flyTo([goToCoords.lat, goToCoords.lng], 15, {
        duration: 1.5 // Animation duration (seconds)
      });
      // Đánh dấu đã xử lý tọa độ tìm kiếm ban đầu
      setInitialSearchProcessed(true);
    }
  }, [map, goToCoords, initialSearch, setInitialSearchProcessed, searchCounter]);
  
  return null;
}

function LocationMarker({ 
  onLocationSelect, 
  searchPosition,
  initialSearchProcessed,
  searchCounter
}: LocationMarkerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [clickedPosition, setClickedPosition] = useState<L.LatLng | null>(null);
  
  // Update position when search coordinates change and it's the initial search
  useEffect(() => {
    if (searchPosition && !initialSearchProcessed) {
      const newPosition = new L.LatLng(searchPosition.lat, searchPosition.lng);
      setPosition(newPosition);
      onLocationSelect(searchPosition.lat, searchPosition.lng);
      
      // Calculate bounds for square
      const newBounds = calculateSquareBounds(newPosition);
      setBounds(newBounds);
    }
  }, [searchPosition, onLocationSelect, initialSearchProcessed, searchCounter]);

  const map = useMapEvents({
    click(e) {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control') || target.closest('.confirm-landslide-dialog')) {
        return;
      }
      
      setPosition(e.latlng);
      setBounds(calculateSquareBounds(e.latlng));
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      
      // Lưu vị trí đã nhấp và hiển thị hộp thoại xác nhận
      setClickedPosition(e.latlng);
      setShowConfirmDialog(true);
    },
  });

  return (
    <>
      {position === null ? null : (
        <>
          <Marker position={position} icon={customIcon}>
            <Popup>
              <div>
                <h3 className="font-medium">Vị trí đã chọn</h3>
                <p className="text-sm">Kinh độ: {position.lng.toFixed(6)}</p>
                <p className="text-sm">Vĩ độ: {position.lat.toFixed(6)}</p>
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
      )}
      
      {/* Hộp thoại xác nhận */}
      {showConfirmDialog && clickedPosition && (
        <div className="confirm-landslide-dialog absolute top-16 right-4 bg-white p-4 rounded-lg shadow-lg z-[9999] max-w-sm">
          <h3 className="font-bold text-lg mb-2">Phát hiện sạt lở đất</h3>
          <p className="text-sm mb-3">Phân tích khu vực này để tìm kiếm sạt lở đất?</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Chọn mốc thời gian:</label>
            <input 
              type="date" 
              id="event-date" 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              defaultValue={new Date().toISOString().split('T')[0]} 
            />
          </div>
          
          <div className="text-sm mb-3">
            <p>Kinh độ: {clickedPosition.lng.toFixed(6)}</p>
            <p>Vĩ độ: {clickedPosition.lat.toFixed(6)}</p>
          </div>
          
          <div className="flex justify-between">
            <button 
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              onClick={() => setShowConfirmDialog(false)}
            >
              Hủy
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              onClick={() => {
                // Lấy giá trị ngày từ input
                const dateInput = document.getElementById('event-date') as HTMLInputElement;
                const eventDate = dateInput?.value || new Date().toISOString().split('T')[0];
                
                // Gọi hàm gửi dữ liệu (không gửi ID nữa)
                window.dispatchEvent(new CustomEvent('send-landslide-data', {
                  detail: {
                    lat: clickedPosition.lat,
                    lng: clickedPosition.lng,
                    eventDate: eventDate
                  }
                }));
                
                setShowConfirmDialog(false);
              }}
            >
              Phân tích
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function SatelliteMapComponent({ 
  goToCoords = null 
}: SatelliteMapComponentProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendStatus, setSendStatus] = useState<StatusState>({ status: 'idle' });
  const [landslideResults, setLandslideResults] = useState<LandslideResult | null>(null);
  
  // Thêm state để theo dõi chế độ xem
  const [viewMode, setViewMode] = useState<'normal' | 'landslide'>('normal');
  
  // Thêm state để theo dõi xem đã xử lý tọa độ tìm kiếm ban đầu chưa
  const [initialSearchProcessed, setInitialSearchProcessed] = useState<boolean>(false);
  // Thêm một state mới để theo dõi lần tìm kiếm mới
  const [searchCounter, setSearchCounter] = useState<number>(0);
  
  // Track active polling processes
  const currentPollingId = useRef<string | null>(null);
  const pollingCleanupFunction = useRef<(() => void) | null>(null);

  // Fix for Leaflet icons in Next.js
  useEffect(() => {
    // Set default marker icon
    L.Marker.prototype.options.icon = customIcon;
  }, []);

  // Thêm một useEffect hook mới để phát hiện khi goToCoords thay đổi
  useEffect(() => {
    if (goToCoords) {
      // Đặt lại trạng thái initialSearchProcessed về false khi có tọa độ tìm kiếm mới
      setInitialSearchProcessed(false);
      // Tăng bộ đếm tìm kiếm để kích hoạt các effect khác
      setSearchCounter(prev => prev + 1);
    }
  }, [goToCoords]);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    console.log('Vị trí đã chọn:', { lat, lng });
  }, []);
  
// Status polling function with improved request handling
const startPollingStatus = useCallback((landslideId: string) => {
    // Prevent duplicate polling - check if already polling this ID
    if (currentPollingId.current === landslideId) {
      console.log(`Đã đang theo dõi trạng thái cho ID: ${landslideId}`);
      return;
    }
    
    // Clean up any existing polling
    if (pollingCleanupFunction.current) {
      pollingCleanupFunction.current();
      pollingCleanupFunction.current = null;
    }
    
    // Set current polling ID
    currentPollingId.current = landslideId;
    
    // Tracking variables
    let pollCount = 0;
    const maxPolls = 40;
    let isPolling = true;
    
    console.log(`Bắt đầu theo dõi trạng thái cho ID: ${landslideId}`);
    
    // Create interval for polling
    const intervalId = setInterval(async () => {
      if (!isPolling) {
        clearInterval(intervalId);
        return;
      }
      
      try {
        pollCount++;
        
        // Use Next.js API proxy
        const statusUrl = `/api/landslide?id=${landslideId}`;
        
        console.log(`Kiểm tra trạng thái (${pollCount}/${maxPolls}) cho ID: ${landslideId}`);
        
        const response = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Lỗi phản hồi:', errorText.substring(0, 500) + '...');
          throw new Error(`Lỗi HTTP khi kiểm tra trạng thái: ${response.status}`);
        }
        
        // Process JSON response
        const statusData = await response.json();
        console.log('Dữ liệu trạng thái:', statusData);
        
        // CRITICAL CHECK: Stop immediately if we see success status
        if (statusData && statusData.status === 'success') {
          console.log('ĐÃ NHẬN ĐƯỢC TRẠNG THÁI THÀNH CÔNG - DỪNG NGAY LẬP TỨC');
          
          // Update state with results
          setLandslideResults({
            id: landslideId,
            status: 'success',
            landslideDetected: statusData.landslide_detected === true,
            landslide_coordinates: statusData.landslide_coordinates || null,
            processingComplete: true
          });
          
          // Display success notification
          setSendStatus({
            status: 'success',
            message: `Xử lý hoàn tất: ${statusData.landslide_detected ? 'Phát hiện lở đất!' : 'Không phát hiện lở đất.'}`
          });
          
          // Switch to landslide view if needed
          if (statusData.landslide_detected && statusData.landslide_coordinates) {
            setViewMode('landslide');
          }
          
          // Clean up - using multiple approaches to ensure it stops
          isPolling = false;
          currentPollingId.current = null;
          clearInterval(intervalId);
          pollingCleanupFunction.current = null;
          
          // Auto-hide notification
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 10000);
          
          return; // Exit immediately
        }
        
        // For all other cases, continue with normal processing
        if (statusData && typeof statusData === 'object') {
          
          // Check for error status
          if (statusData.status === 'error') {
            console.log('Đã nhận được trạng thái lỗi, dừng kiểm tra');
            
            // Update state with error results
            setLandslideResults({
              id: landslideId,
              status: 'error',
              landslideDetected: false, 
              processingComplete: true
            });
            
            // Display error notification
            setSendStatus({
              status: 'error',
              message: `Lỗi xử lý: ${statusData.message || 'Lỗi không xác định'}`
            });
            
            // Clean up
            isPolling = false;
            currentPollingId.current = null;
            clearInterval(intervalId);
            
            // Auto-hide notification
            setTimeout(() => {
              setSendStatus({ status: 'idle' });
            }, 10000);
            
            return; // Exit early
          }
          
          // If we're still processing, update state without stopping poll
          setLandslideResults({
            id: landslideId,
            status: statusData.status || 'unknown',
            landslideDetected: statusData.landslide_detected === true,
            landslide_coordinates: statusData.landslide_coordinates || null,
            processingComplete: false
          });
        } else {
          throw new Error('Dữ liệu phản hồi không hợp lệ');
        }
        
        // Stop if we've reached max poll count
        if (pollCount >= maxPolls) {
          console.log('Đã đạt đến số lần thử tối đa');
          
          setSendStatus({
            status: 'error',
            message: 'Quá thời gian xử lý. Vui lòng kiểm tra lại sau.'
          });
          
          // Clean up
          isPolling = false;
          currentPollingId.current = null;
          clearInterval(intervalId);
          
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 5000);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra trạng thái lở đất:', error);
        
        // Stop polling after several consecutive errors
        if (pollCount >= 5) {
          setSendStatus({
            status: 'error',
            message: error instanceof Error ? error.message : 'Lỗi kiểm tra trạng thái'
          });
          
          // Clean up
          isPolling = false;
          currentPollingId.current = null;
          clearInterval(intervalId);
          
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 3000);
        }
      }
    }, 5000);
    
    // Store cleanup function
    pollingCleanupFunction.current = () => {
      isPolling = false;
      currentPollingId.current = null;
      clearInterval(intervalId);
    };

    // Return the cleanup function in case we need to clean up manually
    return () => {
      if (pollingCleanupFunction.current) {
        pollingCleanupFunction.current();
      }
    };
  }, []);
  // Send coordinates to API endpoint using Next.js API route
  const sendCoordinates = async (lat: number, lng: number, eventDate: string) => {
    try {
      setSendStatus({ status: 'sending' });
      
      // Create payload for GEE (X: longitude, Y: latitude)
      const payload = {
        X: lng,  // Longitude - GEE expects this first
        Y: lat,  // Latitude
        event_date: eventDate,
        api_key: process.env.NEXT_PUBLIC_API_KEY || "10102003" // Add API key from environment variable
      };
      
      console.log('Gửi đến API:', payload);
      
      // Use Next.js API proxy instead of calling ngrok directly
      const apiUrl = '/api/landslide';
      
      console.log('URL API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
  
      // Log status code and headers for debugging
      console.log('Mã trạng thái phản hồi:', response.status);
      console.log('Headers phản hồi:', Object.fromEntries([...response.headers]));
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Phản hồi lỗi:', errorText.substring(0, 500));
        throw new Error(`Lỗi HTTP! Mã trạng thái: ${response.status}`);
      }
  
      // Process JSON response
      const data = await response.json();
      console.log('Tọa độ đã được gửi thành công:', data);
      
      // Save ID to state for tracking results
      const responseId = data.id;
      if (!responseId) {
        throw new Error('Không có ID lở đất trong phản hồi');
      }
      
      setLandslideResults({
        id: responseId,
        status: 'processing',
        processingComplete: false
      });
      
      setSendStatus({ 
        status: 'success', 
        message: 'Tọa độ đã được gửi thành công! ID: ' + responseId 
      });
      
      // Start tracking processing status
      startPollingStatus(responseId);
      
      // Notification will automatically disappear after status tracking begins
      setTimeout(() => {
        setSendStatus({ status: 'idle' });
      }, 5000);
    } catch (error) {
      console.error('Lỗi gửi tọa độ:', error);
      setSendStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Lỗi gửi tọa độ' 
      });
    }
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          console.error('Lỗi lấy vị trí:', error);
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

  // Bắt sự kiện từ custom event để gửi dữ liệu
  useEffect(() => {
    const handleSendLandslideData = (event: CustomEvent) => {
      const { lat, lng, eventDate } = event.detail;
      sendCoordinates(lat, lng, eventDate);
    };

    window.addEventListener('send-landslide-data', handleSendLandslideData as EventListener);

    return () => {
      window.removeEventListener('send-landslide-data', handleSendLandslideData as EventListener);
      
      if (pollingCleanupFunction.current) {
        pollingCleanupFunction.current();
      }
    };
  }, []);

  if (loading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={currentLocation || [21.0285, 105.8542]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Use satellite map layer from Esri */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/en-us/home">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        {currentLocation && (
          <Marker position={currentLocation} icon={customIcon}>
            <Popup>Vị trí của bạn</Popup>
          </Marker>
        )}

        {viewMode === 'normal' && (
          <LocationMarker 
            onLocationSelect={handleLocationSelect} 
            searchPosition={goToCoords}
            initialSearchProcessed={initialSearchProcessed}
            searchCounter={searchCounter}
          />
        )}
        
        {/* Hiển thị các điểm lở đất nếu ở chế độ xem lở đất và có kết quả phân tích */}
        {viewMode === 'landslide' && landslideResults?.landslideDetected && landslideResults.landslide_coordinates?.coordinates && (
          <LandslideMarkerLayer coordinates={landslideResults.landslide_coordinates.coordinates} autoFitBounds={true} />
        )}
        
        {/* Map center control component */}
        <MapCenterControl 
          goToCoords={goToCoords} 
          initialSearch={!initialSearchProcessed} 
          setInitialSearchProcessed={setInitialSearchProcessed}
          searchCounter={searchCounter}
        />
      </MapContainer>

      {/* Nút chuyển đổi chế độ xem */}
      {landslideResults?.landslideDetected && landslideResults.landslide_coordinates?.coordinates && (
        <div className="absolute top-4 left-4 z-[1000]">
          <button 
            className={`px-3 py-2 rounded-lg shadow-lg ${
              viewMode === 'normal' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-blue-500'
            }`}
            onClick={() => setViewMode(viewMode === 'normal' ? 'landslide' : 'normal')}
          >
            {viewMode === 'normal' ? 'Xem điểm lở đất' : 'Chế độ thường'}
          </button>
        </div>
      )}

      {/* Status notification */}
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
      
      {/* Landslide analysis results */}
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
              
              {landslideResults.landslideDetected && landslideResults.landslide_coordinates?.coordinates && (
                <div className="mt-2">
                  <p className="font-medium text-sm">Đã phát hiện {landslideResults.landslide_coordinates.coordinates.length} điểm lở đất</p>
                  
                  <button 
                    className="mt-2 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                    onClick={() => setViewMode('landslide')}
                  >
                    Xem trên bản đồ
                  </button>
                  
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-40 overflow-y-auto">
                    <p className="font-medium mb-1">Chi tiết tọa độ:</p>
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-1 border text-left">ID</th>
                          <th className="p-1 border text-right">Đông</th>
                          <th className="p-1 border text-right">Bắc</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landslideResults.landslide_coordinates.coordinates.slice(0, 5).map((coord: LandslideCoordinate, idx: number) => (
                          <tr key={coord.segment_id || idx}>
                            <td className="p-1 border">{coord.segment_id}</td>
                            <td className="p-1 border text-right">{parseFloat(coord.east.toString()).toFixed(1)}</td>
                            <td className="p-1 border text-right">{parseFloat(coord.north.toString()).toFixed(1)}</td>
                          </tr>
                        ))}
                        {landslideResults.landslide_coordinates.coordinates.length > 5 && (
                          <tr>
                            <td colSpan={3} className="p-1 text-center italic">
                              ...và {landslideResults.landslide_coordinates.coordinates.length - 5} điểm khác
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-2 bg-red-100 text-red-800 rounded">
              Xử lý thất bại. Vui lòng thử lại.
            </div>
          )}
          
          <button 
            className="mt-3 w-full py-1 px-3 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            onClick={() => setLandslideResults(null)}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}