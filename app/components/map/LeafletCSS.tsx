// app/components/map/LeafletCSS.tsx
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// Component to handle Leaflet CSS and scripts in a hydration-safe way
export default function LeafletCSS() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if CSS has already been added - only run on client
    if (typeof window !== 'undefined') {
      const existingLeafletCss = document.querySelector('link[href*="leaflet.css"]');
      const existingRoutingCss = document.querySelector('link[href*="leaflet-routing-machine.css"]');
      
      // Only add CSS if not already present
      if (!existingLeafletCss) {
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCss.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
        leafletCss.crossOrigin = '';
        document.head.appendChild(leafletCss);
      }
      
      if (!existingRoutingCss) {
        const routingCss = document.createElement('link');
        routingCss.rel = 'stylesheet';
        routingCss.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
        document.head.appendChild(routingCss);
      }
    }

    // No cleanup needed as we want to keep these styles throughout the application
  }, []);

  // Only render scripts on client-side
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Load Leaflet JS using Next.js Script component */}
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
        crossOrigin=""
      />
      
      {/* Load Leaflet Routing Machine after Leaflet */}
      <Script
        src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}