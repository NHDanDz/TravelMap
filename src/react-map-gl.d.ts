declare module 'react-map-gl' {
    import * as React from 'react';
    import * as MapboxGL from 'mapbox-gl';
  
    // Re-export everything from mapbox-gl
    export * from 'mapbox-gl';
  
    // Map component
    export interface MapProps extends Omit<React.HTMLProps<HTMLDivElement>, 'style'> {
      reuseMaps?: boolean;
      mapboxAccessToken?: string;
      mapStyle?: MapboxGL.Style | string;
      style?: React.CSSProperties;
      cursor?: string;
      RTLTextPlugin?: string;
      onLoad?: (event: MapboxGL.MapboxEvent) => void;
      onMove?: (event: ViewStateChangeEvent) => void;
      onMoveStart?: (event: ViewStateChangeEvent) => void;
      onMoveEnd?: (event: ViewStateChangeEvent) => void;
      onClick?: (event: MapboxGL.MapMouseEvent) => void;
      // Add other event handlers and props as needed
      [key: string]: any;
    }
  
    export interface ViewState {
      longitude: number;
      latitude: number;
      zoom: number;
      pitch?: number;
      bearing?: number;
      padding?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
      [key: string]: any;
    }
  
    export interface ViewStateChangeEvent {
      viewState: ViewState;
      interactionState: any;
      originalEvent: Event;
    }
  
    export type MapRef = MapboxGL.Map;
  
    export const Map: React.FC<MapProps>;
  
    // Marker
    export interface MarkerProps {
      longitude: number;
      latitude: number;
      anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      offset?: [number, number];
      rotation?: number;
      pitchAlignment?: 'map' | 'viewport' | 'auto';
      rotationAlignment?: 'map' | 'viewport' | 'auto';
      draggable?: boolean;
      onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
      onDrag?: (event: MapboxGL.MapboxEvent<MouseEvent>) => void;
      onDragStart?: (event: MapboxGL.MapboxEvent<MouseEvent>) => void;
      onDragEnd?: (event: MapboxGL.MapboxEvent<MouseEvent>) => void;
      children?: React.ReactNode;
      style?: React.CSSProperties;
      className?: string;
    }
  
    export const Marker: React.FC<MarkerProps>;
  
    // Popup
    export interface PopupProps {
      longitude: number;
      latitude: number;
      anchor?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      offset?: [number, number] | number;
      closeButton?: boolean;
      closeOnClick?: boolean;
      tipSize?: number;
      className?: string;
      style?: React.CSSProperties;
      maxWidth?: string;
      onClose?: () => void;
      onOpen?: () => void;
      children?: React.ReactNode;
    }
  
    export const Popup: React.FC<PopupProps>;
  
    // NavigationControl
    export interface NavigationControlProps {
      position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
      showCompass?: boolean;
      showZoom?: boolean;
      visualizePitch?: boolean;
    }
  
    export const NavigationControl: React.FC<NavigationControlProps>;
  
    // GeolocateControl
    export interface GeolocateControlProps {
      position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
      trackUserLocation?: boolean;
      showUserLocation?: boolean;
      showAccuracyCircle?: boolean;
      fitBoundsOptions?: MapboxGL.FitBoundsOptions;
      onGeolocate?: (position: GeolocationPosition) => void;
    }
  
    export const GeolocateControl: React.FC<GeolocateControlProps>;
  
    // Source and Layer
    export interface SourceProps {
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
      data?: GeoJSON.Feature | GeoJSON.FeatureCollection | GeoJSON.Geometry | string | { [key: string]: any };
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
  
    export const Source: React.FC<SourceProps>;
  
    export interface LayerProps {
      id: string;
      type?: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap' | 'fill-extrusion' | 'raster' | 'hillshade' | 'background';
      source?: string;
      'source-layer'?: string;
      beforeId?: string;
      layout?: MapboxGL.AnyLayout;
      paint?: MapboxGL.AnyPaint;
      filter?: any[];
      minzoom?: number;
      maxzoom?: number;
    }
  
    export const Layer: React.FC<LayerProps>;
  
    // Hook
    export function useMap(): { current: MapboxGL.Map };
  }
  
  declare module 'mapbox-gl' {
    export interface Map {
      getCanvas(): HTMLCanvasElement;
      // Add any missing methods you need
    }
  }