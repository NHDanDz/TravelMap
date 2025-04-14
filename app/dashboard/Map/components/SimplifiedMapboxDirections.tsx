// app/dashboard/Map/components/SimplifiedMapboxDirections.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl';

interface DirectionsProps {
  startPoint: [number, number]; // [longitude, latitude]
  endPoint: [number, number]; // [longitude, latitude]
  mode: 'driving' | 'walking' | 'cycling';
}

const SimplifiedMapboxDirections: React.FC<DirectionsProps> = ({ 
  startPoint, 
  endPoint, 
  mode = 'walking' 
}) => {
  const [routeData, setRouteData] = useState<GeoJSON.Feature | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actualMode, setActualMode] = useState<'driving' | 'walking' | 'cycling'>(mode);

  // Helper function to validate route quality
  const isValidRoute = (geometry: any): boolean => {
    if (!geometry || !geometry.coordinates || !Array.isArray(geometry.coordinates)) {
      return false;
    }
    
    // Routes with very few points are suspicious
    if (geometry.coordinates.length < 5) {
      return false;
    }
    
    // Check for non-linear path (real roads are rarely perfectly straight)
    let directionChanges = 0;
    for (let i = 1; i < geometry.coordinates.length - 1; i++) {
      const prev = geometry.coordinates[i-1];
      const curr = geometry.coordinates[i];
      const next = geometry.coordinates[i+1];
      
      // Calculate direction vectors
      const dir1 = [curr[0] - prev[0], curr[1] - prev[1]];
      const dir2 = [next[0] - curr[0], next[1] - curr[1]];
      
      // Calculate angle change
      const dotProduct = dir1[0] * dir2[0] + dir1[1] * dir2[1];
      const mag1 = Math.sqrt(dir1[0] * dir1[0] + dir1[1] * dir1[1]);
      const mag2 = Math.sqrt(dir2[0] * dir2[0] + dir2[1] * dir2[1]);
      
      if (mag1 === 0 || mag2 === 0) continue;
      
      const cosAngle = dotProduct / (mag1 * mag2);
      
      // Count significant direction changes
      if (cosAngle < 0.995) {
        directionChanges++;
      }
    }
    
    return directionChanges >= 3;
  };

  const fetchDirections = async (routeMode: 'driving' | 'walking' | 'cycling') => {
    // Validate inputs
    if (!startPoint || !endPoint || 
        !Array.isArray(startPoint) || !Array.isArray(endPoint) ||
        startPoint.length !== 2 || endPoint.length !== 2) {
      console.error('Invalid start or end point', { startPoint, endPoint });
      setError('Invalid coordinates provided');
      return null;
    }
    
    try {
      console.log(`Fetching directions from [${startPoint}] to [${endPoint}] via ${routeMode}`);
      
      // Get Mapbox token
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        throw new Error('Mapbox access token is missing');
      }

      // Create the API URL with improved parameters
      const url = `https://api.mapbox.com/directions/v5/mapbox/${routeMode}/` +
                 `${startPoint[0]},${startPoint[1]};` +
                 `${endPoint[0]},${endPoint[1]}` +
                 `?steps=true&geometries=geojson&alternatives=true&overview=full` +
                 `&language=vi` +
                 // Optimize route parameters based on transport mode
                 `${routeMode === 'cycling' ? '&exclude=motorway,ferry,toll' : ''}` +
                 `${routeMode === 'walking' ? '&exclude=motorway' : ''}` +
                 `&access_token=${token}`;
      
      // Fetch directions
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Directions API response status:', response.status);
        throw new Error(`Failed to fetch directions: ${response.statusText}`);
      }
      
      // Parse response
      const data = await response.json();
      
      // Check if routes exist
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }
      
      // Get the first route
      const route = data.routes[0];
      
      // Create GeoJSON for the route
      const routeGeoJson = {
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      };
      
      return { routeGeoJson, route, isValid: isValidRoute(route.geometry) };
    } catch (error) {
      console.error(`Error fetching ${routeMode} directions:`, error);
      throw error;
    }
  };

  useEffect(() => {
    const getDirections = async () => {
      setLoading(true);
      setError(null);
      setActualMode(mode);
      
      try {
        // First try with the requested mode
        const result = await fetchDirections(mode);
        
        // For cycling, validate the route
        if (mode === 'cycling' && result && !result.isValid) {
          console.warn('Cycling route appears invalid. Trying walking mode instead.');
          
          // Try walking mode as fallback
          try {
            setActualMode('walking');
            const walkingResult = await fetchDirections('walking');
            setRouteData(walkingResult?.routeGeoJson as any);
          } catch (walkingError) {
            console.error('Walking fallback also failed:', walkingError);
            
            // If walking also fails, go back to the original result
            setRouteData(result.routeGeoJson as any);
            setActualMode(mode);
          }
        } else if (result) {
          // Use the successful result
          setRouteData(result.routeGeoJson as any);
        }
      } catch (error) {
        console.error('Initial directions request failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch directions');
        
        // Try fallback modes
        if (mode === 'cycling') {
          try {
            console.log('Trying walking as fallback...');
            setActualMode('walking');
            const walkingResult = await fetchDirections('walking');
            if (walkingResult) {
              setRouteData(walkingResult.routeGeoJson as any);
              setError(null); // Clear error if fallback succeeds
            }
          } catch (fallbackError) {
            console.error('Walking fallback failed:', fallbackError);
            
            // Last resort: try driving
            try {
              console.log('Trying driving as last resort...');
              setActualMode('driving');
              const drivingResult = await fetchDirections('driving');
              if (drivingResult) {
                setRouteData(drivingResult.routeGeoJson as any);
                setError(null); // Clear error if fallback succeeds
              }
            } catch (lastResortError) {
              console.error('All direction modes failed:', lastResortError);
              setError('Could not find directions with any mode of transportation');
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    getDirections();
  }, [startPoint, endPoint, mode]);
  
  // Color mapping for different transport modes
  const getModeColor = (transportMode: string) => {
    switch (transportMode) {
      case 'driving': return '#3b82f6'; // blue
      case 'cycling': return '#10b981'; // green
      case 'walking': return '#f59e0b'; // amber/orange
      default: return '#3b82f6';
    }
  };

  return (
    <>
      {/* Only render the route if we have data */}
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
              'line-color': getModeColor(actualMode),
              'line-width': 5,
              'line-opacity': 0.8
            }}
          />
        </Source>
      )}
      
      {/* Status indicators */}
      {loading && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-lg z-10">
          <p>Đang tải chỉ đường...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-lg z-10 text-red-500">
          <p>Lỗi: {error}</p>
        </div>
      )}
      
      {routeData && actualMode !== mode && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-lg z-10 text-amber-500">
          <p>Đã chuyển sang chế độ {actualMode === 'walking' ? 'đi bộ' : actualMode === 'driving' ? 'lái xe' : 'đạp xe'} do không tìm thấy đường {mode === 'walking' ? 'đi bộ' : mode === 'driving' ? 'lái xe' : 'đạp xe'} phù hợp.</p>
        </div>
      )}
    </>
  );
};

export default SimplifiedMapboxDirections;