// app/dashboard/Map/components/LandslideMarkerLayer.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { LayerGroup, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Định nghĩa kiểu dữ liệu
interface LandslideCoordinate {
  segment_id: string;
  east: number;
  north: number;
}

interface LandslideMarkerLayerProps {
  coordinates: LandslideCoordinate[];
  autoFitBounds?: boolean;
  circleRadius?: number;
  iconSize?: [number, number];
  showCircles?: boolean;
  onMarkerClick?: (coordinate: LandslideCoordinate) => void;
  highlightedId?: string;
}

// Biểu tượng tùy chỉnh cho điểm lở đất
const createLandslideIcon = (size: [number, number] = [32, 32], highlighted: boolean = false) => {
  return L.icon({
    iconUrl: '/images/landslide-warning-icon.svg',
    iconSize: highlighted ? [size[0] * 1.3, size[1] * 1.3] : size, // Tăng kích thước nếu được highlight
    iconAnchor: highlighted 
      ? [size[0] * 1.3 / 2, size[1] * 1.3] // Điều chỉnh điểm neo khi size thay đổi
      : [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
    className: highlighted ? 'landslide-marker-highlighted' : 'landslide-marker' // Thêm class riêng để có thể chỉnh CSS
  });
};

// Hàm chuyển đổi tọa độ UTM sang LatLng
// Dựa trên mã mẫu đã cung cấp
function convertToLatLng(east: number, north: number): L.LatLng {
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
  
  return L.latLng(lat, lng);
}

// Hàm kiểm tra xem một tọa độ LatLng có hợp lệ không
function isValidLatLng(latLng: L.LatLng): boolean {
  return latLng.lat >= -90 && latLng.lat <= 90 && 
         latLng.lng >= -180 && latLng.lng <= 180;
}

const LandslideMarkerLayer = ({ 
  coordinates, 
  autoFitBounds = true,
  circleRadius = 250,
  iconSize = [32, 32],
  showCircles = true,
  onMarkerClick,
  highlightedId
}: LandslideMarkerLayerProps) => {
  const map = useMap();
  
  // Tạo mảng các điểm Leaflet từ tọa độ UTM
  const points = useMemo(() => {
    if (!coordinates || coordinates.length === 0) return [];
    
    return coordinates.map(point => {
      try {
        // Nếu east/north là dưới dạng chuỗi, chuyển đổi thành số
        const eastNum = typeof point.east === 'string' ? parseFloat(point.east) : point.east;
        const northNum = typeof point.north === 'string' ? parseFloat(point.north) : point.north;
        
        const latLng = convertToLatLng(eastNum, northNum);
        
        // Kiểm tra tọa độ hợp lệ
        if (!isValidLatLng(latLng)) {
          console.warn(`Tọa độ không hợp lệ cho điểm ${point.segment_id}: [${latLng.lat}, ${latLng.lng}]`);
          return null;
        }
        
        return {
          id: point.segment_id,
          coordinate: point,
          latLng: latLng
        };
      } catch (error) {
        console.error(`Lỗi chuyển đổi tọa độ cho điểm ${point.segment_id}:`, error);
        return null;
      }
    }).filter(point => point !== null) as {
      id: string;
      coordinate: LandslideCoordinate;
      latLng: L.LatLng;
    }[];
  }, [coordinates]);
  
  // Tự động điều chỉnh view khi coordinates thay đổi
  useEffect(() => {
    if (autoFitBounds && points.length > 0) {
      try {
        // Chỉ lấy các điểm có tọa độ hợp lệ
        const validLatLngs = points.map(p => p.latLng);
        
        if (validLatLngs.length > 0) {
          const bounds = L.latLngBounds(validLatLngs);
          
          // Sửa lỗi TypeScript: Đảm bảo đúng kiểu dữ liệu cho flyToBounds
          map.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 16
          });
        }
      } catch (error) {
        console.error('Lỗi khi điều chỉnh bounds của bản đồ:', error);
      }
    }
  }, [map, points, autoFitBounds]);
  
  if (points.length === 0) {
    return null;
  }
  
  return (
    <LayerGroup>
      {points.map(point => {
        const isHighlighted = highlightedId === point.id;
        
        // Điều chỉnh kích thước icon nếu được highlight
        const currentIconSize: [number, number] = isHighlighted 
          ? [iconSize[0] * 1.2, iconSize[1] * 1.2] 
          : iconSize;
        
        return (
          <div key={point.id || `landslide-${point.coordinate.east}-${point.coordinate.north}`}>
            <Marker 
              position={point.latLng} 
              icon={createLandslideIcon(currentIconSize, isHighlighted)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(point.coordinate);
                }
              }}
            >
              <Popup>
                <div className="p-1 landslide-popup">
                  <h3 className="font-medium text-red-600">Điểm lở đất</h3>
                  <p className="text-sm">ID: {point.id}</p>
                  <p className="text-sm">Tọa độ Đông: {point.coordinate.east.toFixed(2)}</p>
                  <p className="text-sm">Tọa độ Bắc: {point.coordinate.north.toFixed(2)}</p>
                  <p className="text-sm">Vĩ độ: {point.latLng.lat.toFixed(6)}</p>
                  <p className="text-sm">Kinh độ: {point.latLng.lng.toFixed(6)}</p>
                </div>
              </Popup>
            </Marker>
            
            {showCircles && (
              <Circle 
                center={point.latLng} 
                radius={isHighlighted ? circleRadius * 1.2 : circleRadius} 
                pathOptions={{
                  color: isHighlighted ? '#ff0000' : '#f03',
                  weight: isHighlighted ? 2 : 1,
                  fillColor: isHighlighted ? '#ff5555' : '#f03',
                  fillOpacity: isHighlighted ? 0.4 : 0.3
                }}
              />
            )}
          </div>
        );
      })}
    </LayerGroup>
  );
};

export default LandslideMarkerLayer;