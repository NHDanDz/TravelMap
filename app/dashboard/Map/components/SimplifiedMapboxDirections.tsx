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

  useEffect(() => {
    const fetchDirections = async () => {
      // Validate inputs
      if (!startPoint || !endPoint || 
          !Array.isArray(startPoint) || !Array.isArray(endPoint) ||
          startPoint.length !== 2 || endPoint.length !== 2) {
        console.error('Invalid start or end point', { startPoint, endPoint });
        setError('Invalid coordinates provided');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching directions from', startPoint, 'to', endPoint, 'via', mode);
        
        // Get Mapbox token
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          throw new Error('Mapbox access token is missing');
        }

        // Create the API URL (ensure coordinates are in the correct format: [longitude, latitude])
        const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}?steps=true&geometries=geojson&access_token=${token}`;
        
        // Fetch directions
        const response = await fetch(url);
        if (!response.ok) {
          console.error('Directions API response status:', response.status);
          throw new Error(`Failed to fetch directions: ${response.statusText}`);
        }
        
        // Parse response
        const data = await response.json();
        console.log('Directions API response:', data);
        
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
        
        // Set route data
        setRouteData(routeGeoJson as any);
        
      } catch (error) {
        console.error('Error fetching directions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch directions');
      } finally {
        setLoading(false);
      }
    };

    fetchDirections();
  }, [startPoint, endPoint, mode]);
  
  // If there's an error or we're still loading, don't render anything
  if (error) console.error('Directions error:', error);

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
              'line-color': mode === 'driving' ? '#3b82f6' : 
                          mode === 'cycling' ? '#10b981' : '#f59e0b',
              'line-width': 5,
              'line-opacity': 0.8
            }}
          />
        </Source>
      )}
      
      {/* Simple loading/error indicators */}
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
    </>
  );
};

export default SimplifiedMapboxDirections;