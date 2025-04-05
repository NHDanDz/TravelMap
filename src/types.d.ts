import 'leaflet';
import 'leaflet-routing-machine';

declare module 'leaflet' {
  namespace Routing {
    function control(options: RoutingControlOptions): Control;
    function osrmv1(options: OsrmV1Options): any;
    
    interface Control extends L.Control {
      getPlan(): any;
      getRouter(): any;
      setWaypoints(waypoints: L.LatLng[]): any;
    }
    
    interface RoutingControlOptions {
      waypoints: L.LatLng[];
      router?: any;
      routeWhileDragging?: boolean;
      lineOptions?: {
        styles?: {
          color: string;
          weight: number;
        }[];
      };
      show?: boolean;
      addWaypoints?: boolean;
      draggableWaypoints?: boolean;
      fitSelectedRoutes?: boolean;
      showAlternatives?: boolean;
      createMarker?: (i: number, waypoint: any, n: number) => L.Marker | null;
      containerClassName?: string;
      position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    }
    
    interface OsrmV1Options {
      language?: string;
      profile?: 'driving' | 'foot' | 'bicycle';
      url?: string;
      timeout?: number;
      serviceUrl?: string;
    }
  }
}

// Fix cho lỗi useMap
declare module 'react-leaflet' {
  export function useMap(): L.Map;
}