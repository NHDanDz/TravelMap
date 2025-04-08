// Tạo một file mới: app/dashboard/Map/components/MapGLWrapper.tsx
import React, { forwardRef } from 'react';
import { Map as ReactMapGL } from 'react-map-gl';
import type { Map as MapboxMap } from 'mapbox-gl';

// Sử dụng forwardRef để chuyển tiếp ref đến component Map
const MapGLWrapper = forwardRef<MapboxMap, React.ComponentProps<typeof ReactMapGL>>((props, ref) => {
  return <ReactMapGL {...props} ref={ref as any} />;
});

MapGLWrapper.displayName = 'MapGLWrapper';

export default MapGLWrapper;