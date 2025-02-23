import 'leaflet';
import 'leaflet-routing-machine';

declare module 'leaflet' {
  interface Routing {
    control(options: RoutingControlOptions): RoutingControl;
    osrmv1(options: any): any; // Thêm định nghĩa cho osrmv1
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
    containerClassName?: string; // Thêm containerClassName
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright'; // Thêm position
  }

  interface RoutingControl extends L.Control {
    getPlan(): any;
    getRouter(): any;
    setWaypoints(waypoints: L.LatLng[]): any;
  }

  namespace Routing {
    function control(options: RoutingControlOptions): RoutingControl;
    function osrmv1(options: OsrmV1Options): any; // Thêm định nghĩa osrmv1 trong namespace
  }

  // Thêm interface cho options của osrmv1
  interface OsrmV1Options {
    language?: string;
    profile?: 'driving' | 'foot' | 'bicycle';
    url?: string;
    timeout?: number;
    serviceUrl?: string;
  }
}

// Fix cho lỗi useMap
declare module 'react-leaflet' {
  export function useMap(): L.Map;
}