// app/dashboard/landslides/page.tsx
import { Suspense } from 'react';
import LandslidesContent from './LandslidesContent';

export const metadata = {
  title: 'Quản lý Sạt lở đất',
  description: 'Quản lý và theo dõi các điểm sạt lở đất',
};

export default function LandslidesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quản lý và Theo dõi Sạt lở đất</h1>
      
      <Suspense fallback={<div className="p-4 rounded-lg bg-gray-50 animate-pulse h-96"></div>}>
        <LandslidesContent />
      </Suspense>
    </div>
  );
}
