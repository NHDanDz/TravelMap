'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Navigation, ChevronUp, ChevronDown } from 'lucide-react';

interface DirectionsProps {
  startPoint: [number, number];
  endPoint: [number, number];
  mode?: 'driving' | 'walking' | 'cycling';
  mapInstance?: any; // Optional map instance for adding the route line
}

interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
}

const SimpleMapboxDirections: React.FC<DirectionsProps> = ({ 
  startPoint, 
  endPoint, 
  mode = 'walking',
  mapInstance 
}) => {
  const [steps, setSteps] = useState<RouteStep[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showDirections, setShowDirections] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startPoint || !endPoint) return;
    
    const fetchDirections = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get Mapbox token
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          throw new Error('Mapbox access token is missing');
        }

        // Prepare coordinates
        const startLng = startPoint[1];
        const startLat = startPoint[0];
        const endLng = endPoint[1]; 
        const endLat = endPoint[0];
        
        // Fetch directions from Mapbox API
        const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startLng},${startLat};${endLng},${endLat}?steps=true&geometries=geojson&access_token=${token}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch directions: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // Update state with route data
          setTotalDistance(route.distance);
          setTotalDuration(route.duration);
          
          // Extract steps from the route
          if (route.legs && route.legs.length > 0) {
            const routeSteps = route.legs[0].steps.map((step: any) => ({
              distance: step.distance,
              duration: step.duration,
              instruction: step.maneuver.instruction
            }));
            
            setSteps(routeSteps);
          }
          
          // If we have a map instance, add the route line
          if (mapInstance && route.geometry) {
            // This assumes the map is using mapbox-gl directly
            // If it's not, this won't work and can be removed
            try {
              // Remove existing route layer if any
              if (mapInstance.getSource('route')) {
                mapInstance.removeLayer('route-line');
                mapInstance.removeSource('route');
              }
              
              // Add the route to the map
              mapInstance.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route.geometry
                }
              });
              
              mapInstance.addLayer({
                id: 'route-line',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': mode === 'driving' ? '#3b82f6' : 
                              mode === 'cycling' ? '#10b981' : '#f59e0b',
                  'line-width': 5,
                  'line-opacity': 0.8
                }
              });
              
              console.log('Added route line to map');
            } catch (err) {
              console.error('Error adding route to map:', err);
            }
          }
        } else {
          setError('No routes found');
        }
      } catch (err) {
        console.error('Error fetching directions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch directions');
      } finally {
        setLoading(false);
      }
    };

    fetchDirections();
  }, [startPoint, endPoint, mode, mapInstance]);

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
      return `${hours} hr ${remainingMinutes} min`;
    } else {
      return `${minutes} min`;
    }
  };

  return (
    <div className="absolute bottom-4 left-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-10">
      <div 
        className="bg-blue-600 text-white p-3 flex justify-between items-center cursor-pointer"
        onClick={() => setShowDirections(!showDirections)}
      >
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Directions</h3>
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
            <p className="text-center text-gray-500 p-4">No directions available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleMapboxDirections;