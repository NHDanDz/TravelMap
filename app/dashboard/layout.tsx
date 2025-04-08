// app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SharedLayout from '@/app/components/layout/SharedLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SharedLayout>
      {children}
    </SharedLayout>
  );
}