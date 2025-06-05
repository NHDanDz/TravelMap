// app/dashboard/Map/components/MapGLWrapper.tsx
'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import { Map as ReactMapGL } from 'react-map-gl';
import type { Map as MapboxMap } from 'mapbox-gl';

// Error boundary for map loading issues
interface MapErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  MapErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-600">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Không thể tải bản đồ</h3>
            <p className="text-sm text-gray-500 mb-4">
              Đã xảy ra lỗi khi tải bản đồ. Vui lòng thử lại sau.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced MapGL Wrapper with better error handling and loading states
const MapGLWrapper = forwardRef<MapboxMap, React.ComponentProps<typeof ReactMapGL>>((props, ref) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Default style and configuration
  const defaultStyle = { 
    width: '100%', 
    height: '100%',
    position: 'relative' as const
  };
  
  const style = props.style ? { ...defaultStyle, ...props.style } : defaultStyle;

  // Enhanced props with better defaults
  const enhancedProps = {
    // Default map configuration
    initialViewState: {
      latitude: 21.0285,
      longitude: 105.8542,
      zoom: 13,
      ...props.initialViewState
    },
    
    // Performance optimizations
    reuseMaps: true,
    preserveDrawingBuffer: true,
    
    // Interaction settings
    dragPan: true,
    dragRotate: true,
    scrollZoom: true,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    doubleClickZoom: true,
    
    // Attribution and controls
    attributionControl: false,
    logoPosition: 'bottom-left' as const,
    
    // Merge with provided props
    ...props,
    
    // Style always comes last
    style,
    
    // Enhanced event handlers
    onLoad: (evt: any) => {
      setIsMapLoaded(true);
      setMapError(null);
      props.onLoad?.(evt);
    },
    
    onError: (evt: any) => {
      console.error('Mapbox error:', evt.error);
      setMapError(evt.error?.message || 'Map loading error');
      props.onError?.(evt);
    }
  };

  // Check if Mapbox token is available
  useEffect(() => {
    if (!props.mapboxAccessToken) {
      setMapError('Thiếu Mapbox access token');
    }
  }, [props.mapboxAccessToken]);

  // Loading overlay
const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="w-full h-full border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      <p className="text-gray-600 font-medium">Đang tải bản đồ...</p>
      <p className="text-sm text-gray-500 mt-1">Vui lòng đợi trong giây lát</p>
    </div>
  </div>
);

  // Error overlay
  const ErrorOverlay = ({ message }: { message: string }) => (
    <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-50">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">Lỗi bản đồ</h3>
        <p className="text-sm text-red-700 mb-4">{message}</p>
        <div className="space-y-2">
          <button 
            onClick={() => {
              setMapError(null);
              window.location.reload();
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
          <p className="text-xs text-red-600">
            Nếu lỗi vẫn tiếp tục, vui lòng kiểm tra kết nối internet
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <MapErrorBoundary fallback={<ErrorOverlay message="Lỗi không xác định khi tải bản đồ" />}>
      <div className="relative w-full h-full">
        {/* Map Component */}
        <ReactMapGL {...enhancedProps} ref={ref as any} />
        
        {/* Loading Overlay */}
        {!isMapLoaded && !mapError && <LoadingOverlay />}
        
        {/* Error Overlay */}
        {mapError && <ErrorOverlay message={mapError} />}
        
        {/* Map Status Indicator */}
        {isMapLoaded && (
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Bản đồ đã sẵn sàng</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MapErrorBoundary>
  );
});

MapGLWrapper.displayName = 'MapGLWrapper';

export default MapGLWrapper;