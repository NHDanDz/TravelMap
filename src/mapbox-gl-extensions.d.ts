import { Map as MapboxMap } from 'mapbox-gl';
import { 
  ViewState, 
  MapLayerMouseEvent, 
  MapboxGeoJSONFeature
} from 'react-map-gl';

declare global {
  interface Window {
    mapboxgl: {
      Map: typeof MapboxMap;
    };
  }
}

// Extend the Map type to include flyTo and other missing methods
declare module 'mapbox-gl' {
  interface Map {
    getCenter(): { lng: number; lat: number };
    flyTo(options: {
      center: [number, number];
      zoom?: number;
      bearing?: number;
      pitch?: number;
      duration?: number;
      essential?: boolean;
      easing?: (t: number) => number;
    }): this;
    getCanvas(): HTMLCanvasElement;
    getContainer(): HTMLDivElement;
    fitBounds(
      bounds: [[number, number], [number, number]],
      options?: { padding?: number | { top: number; bottom: number; left: number; right: number }; duration?: number }
    ): this;
  }
}

// Add proper typing for Marker and Popup events
declare module 'react-map-gl' {
  interface MarkerEvent extends Event {
    originalEvent: MouseEvent;
    target: HTMLElement;
    lngLat: { lng: number; lat: number };
    features?: MapboxGeoJSONFeature[];
  }
  
  // Extend the MapLayerMouseEvent to include missing properties
  interface ExtendedMapLayerMouseEvent extends MapLayerMouseEvent {
    originalEvent: MouseEvent;
    features?: MapboxGeoJSONFeature[];
    lngLat: { lng: number; lat: number };
  }

  // Extend GeolocateEvent to include coords
  interface GeolocateEvent {
    coords: {
      latitude: number;
      longitude: number;
      accuracy: number;
      altitude?: number;
      altitudeAccuracy?: number;
      heading?: number;
      speed?: number;
    };
    timestamp: number;
  }
}

// Add missing typings for Source and Layer
declare module 'react-map-gl' {
  interface SourceProps {
    id: string;
    type: 'vector' | 'raster' | 'raster-dem' | 'geojson' | 'image' | 'video';
    url?: string;
    tiles?: string[];
    bounds?: [number, number, number, number];
    scheme?: 'xyz' | 'tms';
    tileSize?: number;
    minzoom?: number;
    maxzoom?: number;
    attribution?: string;
    encoding?: 'terrarium' | 'mapbox';
    data?: any;
    buffer?: number;
    tolerance?: number;
    cluster?: boolean;
    clusterRadius?: number;
    clusterMaxZoom?: number;
    lineMetrics?: boolean;
    generateId?: boolean;
    coordinates?: number[][];
    children?: React.ReactNode;
  }

  interface LayerProps {
    id: string;
    type?: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap' | 'fill-extrusion' | 'raster' | 'hillshade' | 'background';
    source?: string;
    'source-layer'?: string;
    beforeId?: string;
    layout?: any;
    paint?: any;
    filter?: any[];
    minzoom?: number;
    maxzoom?: number;
  }
}