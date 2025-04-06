// app/dashboard/Map/ScriptImports.tsx
'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

// Component này chỉ để load các script cần thiết cho Leaflet mà không gây conflict
export default function ScriptImports() {
  // Chỉ thêm CSS bằng useEffect để tránh hydration mismatch
  useEffect(() => {
    // Thêm CSS cho Leaflet
    const leafletCss = document.createElement('link');
    leafletCss.rel = 'stylesheet';
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletCss.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
    leafletCss.crossOrigin = '';
    document.head.appendChild(leafletCss);

    // Thêm CSS cho Leaflet Routing Machine
    const routingCss = document.createElement('link');
    routingCss.rel = 'stylesheet';
    routingCss.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
    document.head.appendChild(routingCss);

    // Cleanup khi component unmounted
    return () => {
      try {
        if (document.head.contains(leafletCss)) {
          document.head.removeChild(leafletCss);
        }
        if (document.head.contains(routingCss)) {
          document.head.removeChild(routingCss);
        }
      } catch (e) {
        console.error('Error removing CSS links:', e);
      }
    };
  }, []);

  const handleScriptLoad = () => {
    console.log('Leaflet script loaded');
  };
  
  const handleRoutingScriptLoad = () => {
    console.log('Leaflet Routing Machine script loaded');
  };

  return (
    <>
      {/* Load Leaflet JS */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
      />
      
      {/* Load Leaflet Routing Machine sau Leaflet */}
      <Script
        src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"
        strategy="afterInteractive"
        onLoad={handleRoutingScriptLoad}
      />
    </>
  );
}