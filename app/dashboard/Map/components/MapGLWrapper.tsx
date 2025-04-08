// app/dashboard/Map/components/MapGLWrapper.tsx
import React, { forwardRef } from 'react';
import { Map as ReactMapGL } from 'react-map-gl';
import type { Map as MapboxMap } from 'mapbox-gl';

// Sử dụng forwardRef để chuyển tiếp ref đến component Map
const MapGLWrapper = forwardRef<MapboxMap, React.ComponentProps<typeof ReactMapGL>>((props, ref) => {
  // Ensure map takes full height of container
  const defaultStyle = { width: '100%', height: '100%' };
  const style = props.style ? { ...defaultStyle, ...props.style } : defaultStyle;
  
  return <ReactMapGL {...props} ref={ref as any} style={style} />;
});

MapGLWrapper.displayName = 'MapGLWrapper';

export default MapGLWrapper;