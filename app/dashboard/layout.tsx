// app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SharedLayout from '@/app/components/layout/SharedLayout';

// Client-only component wrapper
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // Return null on initial server render
  }
  
  return <>{children}</>;
};

// Import LeafletCSS with client-side only rendering
const LeafletCSSImporter = dynamic(
  () => import('@/app/components/map/LeafletCSS'),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Only include client-side scripts when in browser */}
      <ClientOnly>
        <LeafletCSSImporter />
      </ClientOnly>
      
      {/* Use the shared layout */}
      <SharedLayout>
        {children}
      </SharedLayout>
    </>
  );
}