// app/dashboard/Map/components/MapboxDirections.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl';
import { Clock, Navigation, ChevronUp, ChevronDown, AlertCircle, Shield } from 'lucide-react';

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
  const [currentMode, setCurrentMode] = useState<'driving' | 'walking' | 'cycling'>(mode);
  const [usedFallbackMode, setUsedFallbackMode] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState<string[]>([]);

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

  // Helper function to check if a route follows actual roads (not just a straight line)
  const isValidRoute = (geometry: any): boolean => {
    if (!geometry || !geometry.coordinates || !Array.isArray(geometry.coordinates)) {
      return false;
    }
    
    // Routes with very few points are suspicious
    if (geometry.coordinates.length < 5) {
      return false;
    }
    
    // Check for non-linear path (real roads rarely go in perfect straight lines)
    let directionChanges = 0;
    for (let i = 1; i < geometry.coordinates.length - 1; i++) {
      const prev = geometry.coordinates[i-1];
      const curr = geometry.coordinates[i];
      const next = geometry.coordinates[i+1];
      
      // Calculate direction vectors
      const dir1 = [curr[0] - prev[0], curr[1] - prev[1]];
      const dir2 = [next[0] - curr[0], next[1] - curr[1]];
      
      // Calculate angle change using dot product
      const dotProduct = dir1[0] * dir2[0] + dir1[1] * dir2[1];
      const mag1 = Math.sqrt(dir1[0] * dir1[0] + dir1[1] * dir1[1]);
      const mag2 = Math.sqrt(dir2[0] * dir2[0] + dir2[1] * dir2[1]);
      
      if (mag1 === 0 || mag2 === 0) continue;
      
      const cosAngle = dotProduct / (mag1 * mag2);
      
      // Count significant direction changes (angle changes > ~2 degrees)
      if (cosAngle < 0.998) {
        directionChanges++;
      }
    }
    
    return directionChanges >= 3;
  };

  // Create fallback direct line when all routing options fail
  const createDirectLine = () => {
    // Create a simple straight line between points
    const directLine = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          startPoint,
          endPoint
        ]
      }
    };
    
    // Calculate rough distance (straight line)
    const dx = startPoint[0] - endPoint[0];
    const dy = startPoint[1] - endPoint[1];
    
    // Rough approximation (not accounting for Earth's curvature)
    // 111,111 meters is roughly 1 degree of latitude
    // Longitude degrees vary by latitude, but we'll use a simple approximation
    const latMid = (startPoint[1] + endPoint[1]) / 2;
    const kmPerLongDegree = Math.cos(latMid * Math.PI / 180) * 111.111;
    
    const distance = Math.sqrt(
      Math.pow(dy * 111.111, 2) + 
      Math.pow(dx * kmPerLongDegree, 2)
    ) * 1000; // convert to meters
    
    // Rough time estimate (assuming 5 km/h walking speed)
    const duration = distance / (5000/3600);
    
    setRouteData(directLine as any);
    setTotalDistance(distance);
    setTotalDuration(duration);
    setSteps([{
      instruction: "Đi trực tiếp đến điểm đến",
      distance: distance,
      duration: duration
    }]);
    
    setError("Không thể tìm thấy đường đi chi tiết. Đang hiển thị đường thẳng.");
  };

  // Function to fetch directions with a specific mode
  const fetchDirectionsWithMode = async (transportMode: 'driving' | 'walking' | 'cycling') => {
    if (!startPoint || !endPoint) {
      setError("Thiếu điểm đầu hoặc điểm đến");
      return null;
    }
    
    // Record that we've attempted this mode
    setFallbackAttempted(prev => [...prev, transportMode]);
    
    try {
      // Validate that coordinates are finite numbers
      if (!isFinite(startPoint[0]) || !isFinite(startPoint[1]) || 
          !isFinite(endPoint[0]) || !isFinite(endPoint[1])) {
        throw new Error('Tọa độ không hợp lệ');
      }
      
      console.log(`Requesting ${transportMode} directions from [${startPoint[0]},${startPoint[1]}] to [${endPoint[0]},${endPoint[1]}]`);
      
      // Get Mapbox access token
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        throw new Error('Không tìm thấy token Mapbox');
      }

      // Ensure coordinates are in the correct format: longitude,latitude
      const coordinatesString = `${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}`;

      // Build optimized URL for the specific transport mode
      // Note: Mapbox expects coordinates as longitude,latitude
      let url = `https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${coordinatesString}`;
      
      // Add query parameters
      const params = new URLSearchParams({
        'steps': 'true',
        'geometries': 'geojson',
        'overview': 'full',
        'language': 'vi',
        'access_token': token
      });
      
      // Add mode-specific parameters - using only valid exclude values
      // Valid exclude values: ferry, cash_only_tolls, border_crossing, country_border, state_border
      if (transportMode === 'cycling' || transportMode === 'walking') {
        // We can exclude ferry for both cycling and walking if desired
        params.append('exclude', 'ferry');
      }
      
      // Use fetch with timeout to avoid hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${url}?${params.toString()}`, { 
        signal: controller.signal,
        method: 'GET'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`API lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we have valid routes
      if (!data.routes || data.routes.length === 0) {
        throw new Error('Không tìm thấy đường đi');
      }
      
      // Get the first (best) route
      const route = data.routes[0];
      
      // Validate route quality for cycling (check if it's not just a straight line)
      if (transportMode === 'cycling' && !isValidRoute(route.geometry)) {
        console.warn('Đường đạp xe không hợp lệ (có thể là đường thẳng). Thử chế độ đi bộ.');
        throw new Error('Đường đạp xe không hợp lệ');
      }
      
      // Extract steps for turn instructions
      const routeSteps: RouteStep[] = [];
      if (route.legs && route.legs.length > 0 && route.legs[0].steps) {
        route.legs[0].steps.forEach((step: any) => {
          if (step.maneuver && step.maneuver.instruction) {
            routeSteps.push({
              instruction: step.maneuver.instruction,
              distance: step.distance || 0,
              duration: step.duration || 0
            });
          }
        });
      }
      
      // Return all the route data
      return {
        route,
        geometry: route.geometry,
        distance: route.distance,
        duration: route.duration,
        steps: routeSteps
      };
      
    } catch (error) {
      console.error(`Lỗi khi tìm đường ${transportMode}:`, error);
      return null;
    }
  };

  // Main effect to load directions
  useEffect(() => {
    const getDirections = async () => {
      setLoading(true);
      setError(null);
      setUsedFallbackMode(false);
      setFallbackAttempted([]);
      setCurrentMode(mode);
      
      try {
        // First try with the requested mode
        const result = await fetchDirectionsWithMode(mode);
        
        if (result) {
          // Use the successful result
          setRouteData(result.geometry);
          setTotalDistance(result.distance);
          setTotalDuration(result.duration);
          setSteps(result.steps);
          setLoading(false);
          return;
        }
        
        // If original mode failed, try fallbacks
        let fallbackResult = null;
        
        // Try walking if we didn't already
        if (mode !== 'walking') {
          console.log('Thử chuyển sang chế độ đi bộ...');
          fallbackResult = await fetchDirectionsWithMode('walking');
          if (fallbackResult) {
            setRouteData(fallbackResult.geometry);
            setTotalDistance(fallbackResult.distance);
            setTotalDuration(fallbackResult.duration);
            setSteps(fallbackResult.steps);
            setCurrentMode('walking');
            setUsedFallbackMode(true);
            setLoading(false);
            return;
          }
        }
        
        // Try driving if we didn't already
        if (mode !== 'driving' && !fallbackAttempted.includes('driving')) {
          console.log('Thử chuyển sang chế độ lái xe...');
          fallbackResult = await fetchDirectionsWithMode('driving');
          if (fallbackResult) {
            setRouteData(fallbackResult.geometry);
            setTotalDistance(fallbackResult.distance);
            setTotalDuration(fallbackResult.duration);
            setSteps(fallbackResult.steps);
            setCurrentMode('driving');
            setUsedFallbackMode(true);
            setLoading(false);
            return;
          }
        }
        
        // If all modes failed, create a direct line
        console.log('Tất cả các chế độ đều thất bại. Tạo đường thẳng...');
        createDirectLine();
        
      } catch (error) {
        console.error('Lỗi khi tìm đường:', error);
        setError('Không thể tìm đường. Vui lòng thử lại sau.');
        createDirectLine(); // Fallback to direct line
      } finally {
        setLoading(false);
      }
    };

    getDirections();
  }, [startPoint, endPoint, mode]);

  // Helper to get color based on transport mode
  const getModeColor = (transportMode: string) => {
    switch (transportMode) {
      case 'driving': return '#3b82f6'; // blue
      case 'cycling': return '#10b981'; // green
      case 'walking': return '#f59e0b'; // amber/orange
      default: return '#3b82f6';
    }
  };

  // Get icon and text based on transport mode
  const getModeInfo = (transportMode: string) => {
    switch (transportMode) {
      case 'driving': return { icon: '🚗', text: 'Lái xe' };
      case 'cycling': return { icon: '🚲', text: 'Xe đạp' };
      case 'walking': return { icon: '🚶', text: 'Đi bộ' };
      default: return { icon: '🚗', text: 'Lái xe' };
    }
  };

  if (!loading && !routeData && !error) return null;

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
              'line-color': getModeColor(currentMode),
              'line-width': 5,
              'line-opacity': 0.8,
              // Add dashed line pattern if using direct line fallback
              ...(error && error.includes('đường thẳng') ? {
                'line-dasharray': [1, 2]
              } : {})
            }}
          />
        </Source>
      )}
      
      {/* Directions Panel */}
      <div className="absolute bottom-4 left-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-10">
        <div 
          className={`text-white p-3 flex justify-between items-center cursor-pointer
                     ${currentMode === 'driving' ? 'bg-blue-600' : 
                       currentMode === 'cycling' ? 'bg-green-600' : 
                       'bg-amber-500'}`}
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
        
        {/* Warning message if using fallback mode */}
        {usedFallbackMode && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-2 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              Không tìm thấy đường đi bằng {mode === 'cycling' ? 'xe đạp' : mode === 'walking' ? 'đi bộ' : 'lái xe'}.
              Đã chuyển sang chế độ {currentMode === 'walking' ? 'đi bộ' : currentMode === 'cycling' ? 'xe đạp' : 'lái xe'}.
            </div>
          </div>
        )}
        
        {/* Error message if any */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-2 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}
        
        {showDirections && (
          <div className="max-h-64 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
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
        
        {/* Mode indicator */}
        <div className="p-2 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
              currentMode === 'driving' ? 'bg-blue-600' : 
              currentMode === 'cycling' ? 'bg-green-600' : 
              'bg-amber-500'
            }`}>
              <span>{getModeInfo(currentMode).icon}</span>
              <span>{getModeInfo(currentMode).text}</span>
              {usedFallbackMode && <Shield size={14} className="ml-1" />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapboxDirections;