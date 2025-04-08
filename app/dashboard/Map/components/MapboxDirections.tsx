// app/dashboard/Map/components/MapboxDirections.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl';
import { Clock, Navigation, ChevronUp, ChevronDown } from 'lucide-react';

interface DirectionsProps {
  startPoint: [number, number]; // [longitude, latitude]
  endPoint: [number, number]; // [longitude, latitude]
  mode: 'driving' | 'walking' | 'cycling';
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

const MapboxDirections: React.FC<DirectionsProps> = ({ 
  startPoint, 
  endPoint, 
  mode = 'walking' 
}) => {
  const [routeData, setRouteData] = useState<GeoJSON.Feature | null>(null);
  const [steps, setSteps] = useState<RouteStep[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showDirections, setShowDirections] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirections = async () => {
      if (!startPoint || !endPoint) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch directions from Mapbox API
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          throw new Error('Mapbox access token is missing');
        }

        const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}?steps=true&geometries=geojson&access_token=${token}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch directions: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Create GeoJSON for the route
          const routeGeoJson = {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          };
          
          setRouteData(routeGeoJson as any);
          setTotalDistance(route.distance);
          setTotalDuration(route.duration);
          
          // Extract steps from the route
          if (route.legs && route.legs.length > 0) {
            const routeSteps = route.legs[0].steps.map((step: any) => ({
              instruction: step.maneuver.instruction,
              distance: step.distance,
              duration: step.duration
            }));
            
            setSteps(routeSteps);
          }
        } else {
          setError('No routes found');
        }
      } catch (error) {
        console.error('Error fetching directions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch directions');
      } finally {
        setLoading(false);
      }
    };

    fetchDirections();
  }, [startPoint, endPoint, mode]);

  // Format distance for display
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours} giờ ${remainingMinutes} phút`;
    } else {
      return `${minutes} phút`;
    }
  };

  if (!routeData && !loading && !error) return null;

  return (
    <>
      {/* Route Line on Map */}
      {routeData && (
        <Source id="route-source" type="geojson" data={routeData}>
          <Layer
            id="route"
            type="line"
            layout={{
              'line-join': 'round',
              'line-cap': 'round'
            }}
            paint={{
              'line-color': mode === 'driving' ? '#3b82f6' : 
                          mode === 'cycling' ? '#10b981' : '#f59e0b',
              'line-width': 5,
              'line-opacity': 0.8
            }}
          />
        </Source>
      )}
      
      {/* Directions Panel */}
      <div className="absolute bottom-4 left-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-10">
        <div 
          className="bg-blue-600 text-white p-3 flex justify-between items-center cursor-pointer"
          onClick={() => setShowDirections(!showDirections)}
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            <div>
              <h3 className="font-medium">Chỉ đường</h3>
              {!loading && totalDistance > 0 && (
                <div className="text-xs flex items-center gap-1">
                  <span>{formatDistance(totalDistance)}</span>
                  <span>•</span>
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              )}
            </div>
          </div>
          {showDirections ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </div>
        
        {showDirections && (
          <div className="max-h-64 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center p-4 text-red-500">
                <p>{error}</p>
              </div>
            ) : steps.length > 0 ? (
              <div className="space-y-3 p-2">
                {steps.map((step, index) => (
                  <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                    <p className="text-sm">{step.instruction}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatDistance(step.distance)}</span>
                      <span>{formatDuration(step.duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 p-4">Không có dữ liệu chỉ đường</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MapboxDirections;