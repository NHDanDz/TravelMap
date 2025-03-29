// app/dashboard/Map/page.tsx
'use client';

import dynamic from 'next/dynamic';
 
const MapComponent = dynamic(
  () => import('./components/MapComponent'),
  {
    loading: () => <div className="w-full h-[calc(100vh-64px)] bg-gray-100 animate-pulse" />,
    ssr: false
  }
);

export default function MapPage() {
  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <MapComponent />
    </div>
  );
}