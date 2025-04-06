// app/dashboard/Map/LeafletCss.tsx
'use client';

import { useEffect } from 'react';

// Component này CHỈ thêm CSS cho Leaflet, không thêm scripts
export default function LeafletCss() {
  useEffect(() => {
    // Kiểm tra xem CSS đã được thêm vào chưa
    const existingLinkLeaflet = document.querySelector('link[href*="leaflet.css"]');
    const existingLinkRouting = document.querySelector('link[href*="leaflet-routing-machine.css"]');
    
    // Chỉ thêm CSS nếu chưa có
    if (!existingLinkLeaflet) {
      // Thêm CSS cho Leaflet
      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletCss.id = 'leaflet-css'; // Thêm ID để dễ tham chiếu
      document.head.appendChild(leafletCss);
    }
    
    if (!existingLinkRouting) {
      // Thêm CSS cho Leaflet Routing Machine
      const routingCss = document.createElement('link');
      routingCss.rel = 'stylesheet';
      routingCss.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
      routingCss.id = 'leaflet-routing-css'; // Thêm ID để dễ tham chiếu
      document.head.appendChild(routingCss);
    }

    // Không cần cleanup vì chúng ta muốn giữ CSS này trong toàn bộ ứng dụng
  }, []);

  // Component này không render gì cả
  return null;
}