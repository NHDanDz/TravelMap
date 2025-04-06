// app/dashboard/Map/components/DynamicMapComponents.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMapEvents, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Định nghĩa interface cho props
interface LocationMarkerProps {
  onLocationSelect?: (lat: number, lng: number) => void;
}

interface RoutingMachineProps {
  startPoint: [number, number];
  endPoint: [number, number];
}

// Component cho vị trí hiện tại trên bản đồ
export const LocationMarkerComponent: React.FC<LocationMarkerProps> = ({ onLocationSelect }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  // Custom icon
  const customIcon = new L.Icon({
    iconUrl: '/images/marker-icon.png',
    iconRetinaUrl: '/images/marker-icon-2x.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const map = useMapEvents({
    click(e) {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control') || target.closest('.nearby-controls')) {
        return;
      }
      
      setPosition(e.latlng);
      onLocationSelect?.(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}>
      <Popup>Vị trí đã chọn</Popup>
    </Marker>
  );
};

// Component cho Routing Machine
export const RoutingMachineComponent: React.FC<RoutingMachineProps> = ({ startPoint, endPoint }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;

    // Kiểm tra xem Leaflet Routing Machine đã được tải hay chưa
    if (typeof L.Routing === 'undefined') {
      console.error('Leaflet Routing Machine is not loaded');
      return;
    }

    // Biến lưu trữ control để cleanup
    let routingControl: L.Routing.Control | null = null;

    try {
      // Tạo các LatLng từ điểm bắt đầu và kết thúc
      const startLatLng = L.latLng(startPoint[0], startPoint[1]);
      const endLatLng = L.latLng(endPoint[0], endPoint[1]);

      // Tạo control mới 
      routingControl = L.Routing.control({
        waypoints: [startLatLng, endLatLng],
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: '#6366F1', weight: 4 }]
        },
        show: true,
        addWaypoints: false,
        draggableWaypoints: true,
        fitSelectedRoutes: true,
        showAlternatives: false,
        createMarker: () => null, // không tạo marker mới
        containerClassName: 'routing-container'
      });

      // Thêm vào map
      routingControl.addTo(map);

      // Custom style cho container
      const style = document.createElement('style');
      style.textContent = `
        .routing-container {
          background: white;
          padding: 10px;
          margin: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
        }
      `;
      document.head.appendChild(style);

      // Return cleanup function
      return () => {
        if (routingControl) {
          try {
            map.removeControl(routingControl);
          } catch (e) {
            console.error("Error removing routing control:", e);
          }
        }
        
        try {
          document.head.removeChild(style);
        } catch (e) {
          console.error("Error removing style:", e);
        }
      };
    } catch (error) {
      console.error("Error setting up routing control:", error);
      return undefined;
    }
  }, [map, startPoint, endPoint]);

  return null;
};