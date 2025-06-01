// app/trip-planner/[id]/map/hooks/useMapUrlParams.ts
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MapUrlParams {
  day?: number;
  place?: string;
  route?: boolean;
  style?: string;
  zoom?: number;
  lat?: number;
  lng?: number;
}

export function useMapUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [params, setParams] = useState<MapUrlParams>({});

  // Parse URL parameters
  useEffect(() => {
    const newParams: MapUrlParams = {};
    
    const day = searchParams.get('day');
    if (day) newParams.day = parseInt(day);
    
    const place = searchParams.get('place');
    if (place) newParams.place = place;
    
    const route = searchParams.get('route');
    if (route) newParams.route = route === 'true';
    
    const style = searchParams.get('style');
    if (style) newParams.style = style;
    
    const zoom = searchParams.get('zoom');
    if (zoom) newParams.zoom = parseFloat(zoom);
    
    const lat = searchParams.get('lat');
    if (lat) newParams.lat = parseFloat(lat);
    
    const lng = searchParams.get('lng');
    if (lng) newParams.lng = parseFloat(lng);
    
    setParams(newParams);
  }, [searchParams]);

  // Update URL parameters
  const updateParams = (newParams: Partial<MapUrlParams>, replace = false) => {
    const current = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        current.set(key, value.toString());
      } else {
        current.delete(key);
      }
    });
    
    const url = `${window.location.pathname}?${current.toString()}`;
    
    if (replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };

  // Clear specific parameters
  const clearParams = (keys: string[]) => {
    const current = new URLSearchParams(searchParams.toString());
    keys.forEach(key => current.delete(key));
    const url = `${window.location.pathname}?${current.toString()}`;
    router.replace(url);
  };

  // Generate shareable URL
  const getShareableUrl = (baseUrl?: string) => {
    const base = baseUrl || window.location.origin;
    return `${base}${window.location.pathname}?${searchParams.toString()}`;
  };

  return {
    params,
    updateParams,
    clearParams,
    getShareableUrl
  };
}