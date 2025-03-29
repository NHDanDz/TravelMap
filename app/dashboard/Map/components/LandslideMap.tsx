// components/LandslideMap.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Giả lập kết quả từ API - sẽ được thay thế bằng dữ liệu thực tế từ API
const mockLandslideResults = {
  coordinates: [
    {
      segment_id: "Llandslide_S182",
      east: 504811.4367816092,
      north: 2322908.103448276
    },
    {
      segment_id: "Llandslide_S159",
      east: 504940.8333333333,
      north: 2323046.071428572
    },
    {
      segment_id: "Llandslide_S1654",
      east: 505544.69696969696,
      north: 2319482.121212121
    },
    {
      segment_id: "Llandslide_S1256",
      east: 503214.7478991597,
      north: 2320359.957983193
    },
    {
      segment_id: "Llandslide_S1604",
      east: 505309.8806366048,
      north: 2319570.7824933687
    },
    {
      segment_id: "Llandslide_S1674",
      east: 502814.58083832334,
      north: 2319388.532934132
    },
    {
      segment_id: "Llandslide_S471",
      east: 504166.41414141416,
      north: 2322248.9393939395
    },
    {
      segment_id: "Llandslide_S519",
      east: 502436.9122257053,
      north: 2322146.2852664576
    },
    {
      segment_id: "Llandslide_S265",
      east: 501695.10256410256,
      north: 2322601.8205128205
    }
  ]
};

// Hàm chuyển đổi tọa độ UTM sang LatLng
// Lưu ý: Đây là ước tính đơn giản, cần có phép chuyển đổi chính xác hơn tùy theo vùng UTM
function convertToLatLng(east, north) {
  // Thông số cho việc chuyển đổi (cần điều chỉnh cho vùng cụ thể)
  // Đây là ước tính cho khu vực Việt Nam (khoảng vùng UTM 48N/49N)
  const originLat = 20.0; // Ước lượng vĩ độ gốc
  const originLng = 105.0; // Ước lượng kinh độ gốc
  
  // Hệ số chuyển đổi (cần điều chỉnh)
  const mPerDegreeLat = 111320; // Khoảng 111.32 km cho 1 độ vĩ độ
  const mPerDegreeLng = 110000; // Khoảng cần điều chỉnh tùy theo vĩ độ
  
  // Điểm tham chiếu (giả định)
  const refEast = 500000; // Điểm giữa của vùng UTM
  const refNorth = 2300000; // Ước tính cho vùng Bắc Việt Nam
  
  // Tính toán sự chênh lệch
  const deltaEast = east - refEast;
  const deltaNorth = north - refNorth;
  
  // Chuyển đổi sang độ
  const deltaLng = deltaEast / mPerDegreeLng;
  const deltaLat = deltaNorth / mPerDegreeLat;
  
  // Tính tọa độ cuối cùng
  const lat = originLat + deltaLat;
  const lng = originLng + deltaLng;
  
  return { lat, lng };
}

// Biểu tượng tùy chỉnh cho điểm lở đất
const landslideIcon = L.icon({
  iconUrl: '/images/landslide-marker.png', // Thay bằng đường dẫn thực tế của bạn
  iconRetinaUrl: '/images/landslide-marker-2x.png', // Tùy chọn
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component để hiển thị tọa độ lở đất
function LandslideMarkers({ landslideData }) {
  const map = useMap();
  
  useEffect(() => {
    if (landslideData && landslideData.length > 0) {
      // Tạo mảng các điểm để tự động zoom đến vùng chứa tất cả điểm
      const points = landslideData.map(point => {
        const { lat, lng } = convertToLatLng(point.east, point.north);
        return [lat, lng];
      });
      
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [landslideData, map]);
  
  if (!landslideData || landslideData.length === 0) {
    return null;
  }
  
  return (
    <LayerGroup>
      {landslideData.map((point, index) => {
        const { lat, lng } = convertToLatLng(point.east, point.north);
        return (
          <div key={point.segment_id || index}>
            <Marker 
              position={[lat, lng]} 
              icon={landslideIcon}
            >
              <Popup>
                <div>
                  <h3 className="font-medium">Landslide Point</h3>
                  <p className="text-sm">ID: {point.segment_id}</p>
                  <p className="text-sm">East: {point.east.toFixed(2)}</p>
                  <p className="text-sm">North: {point.north.toFixed(2)}</p>
                  <p className="text-sm">Converted Lat: {lat.toFixed(6)}</p>
                  <p className="text-sm">Converted Lng: {lng.toFixed(6)}</p>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[lat, lng]} 
              radius={250} 
              pathOptions={{
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.3
              }}
            />
          </div>
        );
      })}
    </LayerGroup>
  );
}

export default function LandslideMapComponent({ landslideResults = null }) {
  const [currentLocation, setCurrentLocation] = useState([21.0285, 105.8542]); // Mặc định ở Hà Nội
  const [loading, setLoading] = useState(true);
  
  // Lấy vị trí của người dùng
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      console.error('Browser does not support geolocation');
      setLoading(false);
    }
  }, []);

  // Xử lý dữ liệu landslideResults
  const landslideData = landslideResults?.coordinates || mockLandslideResults.coordinates;

  if (loading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={currentLocation}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Sử dụng lớp bản đồ vệ tinh từ Esri */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/en-us/home">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        {/* Hiển thị tọa độ lở đất */}
        <LandslideMarkers landslideData={landslideData} />
      </MapContainer>

      {/* Hướng dẫn sử dụng */}
      <div className="absolute top-4 left-4 p-3 bg-white rounded-lg shadow-lg z-[1000] max-w-xs opacity-80 hover:opacity-100 transition-opacity">
        <h3 className="font-bold text-lg">Vị trí lở đất</h3>
        <p className="text-sm">Đã phát hiện {landslideData.length} điểm lở đất</p>
        <p className="text-sm mt-2">Nhấp vào điểm đỏ để xem chi tiết</p>
      </div>
    </div>
  );
}