'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

// Client-only wrapper component
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return <>{children}</>;
};

// Dynamically import the Mapbox component (not Leaflet)
const DynamicMapboxMap = dynamic(
  () => import('../Map/components/ModernMapboxMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Compass className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">TravelSense Map</h1>
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    )
  }
);

export default function MapboxPage() {
  return (
    <div className="h-screen w-full">
      <ClientOnly>
        <DynamicMapboxMap />
      </ClientOnly>
    </div>
  );
}