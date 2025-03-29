// app/dashboard/Map/components/SatelliteMapComponent.tsx
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icon configuration
const customIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Calculate 5000x5000m square around a point
function calculateSquareBounds(latLng: L.LatLng): L.LatLngBounds {
  // 2500m distance in degrees (approximate)
  // 1 degree latitude ≈ 111.32 km at equator
  // 1 degree longitude ≈ 111.32 * cos(latitude) km
  const latOffset = 2500 / 111320; // 2500m in latitude degrees
  const longOffset = 2500 / (111320 * Math.cos(latLng.lat * Math.PI / 180)); // 2500m in longitude degrees

  const northEast = L.latLng(latLng.lat + latOffset, latLng.lng + longOffset);
  const southWest = L.latLng(latLng.lat - latOffset, latLng.lng - longOffset);

  return L.latLngBounds(southWest, northEast);
}

// Component to move map when new coordinates are provided
function MapCenterControl({ goToCoords }: { goToCoords: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (goToCoords) {
      map.flyTo([goToCoords.lat, goToCoords.lng], 15, {
        duration: 1.5 // Animation duration (seconds)
      });
    }
  }, [map, goToCoords]);
  
  return null;
}

function LocationMarker({ 
  onLocationSelect, 
  onSendCoordinates,
  searchPosition
}: { 
  onLocationSelect: (lat: number, lng: number) => void;
  onSendCoordinates: (lat: number, lng: number) => void;
  searchPosition: { lat: number; lng: number } | null;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const coordinatesSent = useRef<Set<string>>(new Set());

  // Update position when search coordinates change
  useEffect(() => {
    if (searchPosition) {
      const newPosition = new L.LatLng(searchPosition.lat, searchPosition.lng);
      setPosition(newPosition);
      onLocationSelect(searchPosition.lat, searchPosition.lng);
      
      // Create unique key for coordinates (with limited precision)
      const posKey = `${searchPosition.lat.toFixed(6)},${searchPosition.lng.toFixed(6)}`;
      
      // Only send API if we haven't sent these coordinates before
      if (!coordinatesSent.current.has(posKey)) {
        onSendCoordinates(searchPosition.lat, searchPosition.lng);
        coordinatesSent.current.add(posKey);
      }
      
      // Calculate bounds for square
      const newBounds = calculateSquareBounds(newPosition);
      setBounds(newBounds);
    }
  }, [searchPosition, onLocationSelect, onSendCoordinates]);

  const map = useMapEvents({
    click(e) {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control')) {
        return;
      }
      
      setPosition(e.latlng);
      setBounds(calculateSquareBounds(e.latlng));
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      
      // Create unique key for clicked coordinates
      const posKey = `${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`;
      
      // Only send API if we haven't sent these coordinates before
      if (!coordinatesSent.current.has(posKey)) {
        onSendCoordinates(e.latlng.lat, e.latlng.lng);
        coordinatesSent.current.add(posKey);
      }
    },
  });

  return position === null ? null : (
    <>
      <Marker position={position} icon={customIcon}>
        <Popup>
          <div>
            <h3 className="font-medium">Selected Location</h3>
            <p className="text-sm">Longitude: {position.lng.toFixed(6)}</p>
            <p className="text-sm">Latitude: {position.lat.toFixed(6)}</p>
            <p className="text-sm text-gray-500 mt-2">Coordinates sent to server</p>
          </div>
        </Popup>
      </Marker>
      {bounds && (
        <Rectangle 
          bounds={bounds}
          pathOptions={{
            color: '#0c4cb3',
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            weight: 2
          }}
        >
          <Popup>
            <div>
              <h3 className="font-medium">Analysis Area</h3>
              <p className="text-sm">Size: 5km × 5km</p>
              <p className="text-sm">Landslide detection zone</p>
            </div>
          </Popup>
        </Rectangle>
      )}
    </>
  );
}

export default function SatelliteMapComponent({ 
  goToCoords = null 
}: { 
  goToCoords?: { lat: number; lng: number } | null 
}) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendStatus, setSendStatus] = useState<{
    status: 'idle' | 'sending' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });
  const [landslideResults, setLandslideResults] = useState<{
    id: string;
    status: string;
    landslideDetected?: boolean;
    coordinates?: any;
    processingComplete: boolean;
  } | null>(null);
  
  // Track active polling processes
  const currentPollingId = useRef<string | null>(null);
  const pollingCleanupFunction = useRef<(() => void) | null>(null);

  // Fix for Leaflet icons in Next.js
  useEffect(() => {
    // Set default marker icon
    L.Marker.prototype.options.icon = customIcon;
  }, []);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    console.log('Location selected:', { lat, lng });
  }, []);
  
  // Status polling function with improved request handling
  const startPollingStatus = useCallback((landslideId: string) => {
    // Prevent duplicate polling - check if already polling this ID
    if (currentPollingId.current === landslideId) {
      console.log(`Already polling for landslide ID: ${landslideId}`);
      return;
    }
    
    // Clean up any existing polling
    if (pollingCleanupFunction.current) {
      pollingCleanupFunction.current();
      pollingCleanupFunction.current = null;
    }
    
    // Set current polling ID
    currentPollingId.current = landslideId;
    
    // Tracking variables
    let pollCount = 0;
    const maxPolls = 40;
    let isPolling = true;
    
    console.log(`Starting to poll for landslide ID: ${landslideId}`);
    
    // Create interval for polling
    const intervalId = setInterval(async () => {
      if (!isPolling) {
        clearInterval(intervalId);
        return;
      }
      
      try {
        pollCount++;
        
        // Use Next.js API proxy
        const statusUrl = `/api/landslide?id=${landslideId}`;
        
        console.log(`Checking status (${pollCount}/${maxPolls}) for ID: ${landslideId}`);
        
        const response = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText.substring(0, 500) + '...');
          throw new Error(`HTTP error when checking status: ${response.status}`);
        }
        
        // Process JSON response
        const statusData = await response.json();
        console.log('Status data:', statusData);
        
        // Check if we have complete landslide detection data
        const hasCompleteLandslideData = 
          statusData.status === 'success' && 
          statusData.landslide_detected !== null && 
          statusData.landslide_coordinates !== null;
        
        // Update state with latest results
        if (statusData && typeof statusData === 'object') {
          setLandslideResults({
            id: landslideId,
            status: statusData.status || 'unknown',
            landslideDetected: statusData.landslide_detected === true,
            coordinates: statusData.landslide_coordinates || null,
            processingComplete: hasCompleteLandslideData || statusData.status === 'error'
          });
          
          // Stop polling if we have complete data or there's an error
          if (hasCompleteLandslideData || statusData.status === 'error') {
            console.log('Processing complete with full data:', statusData);
            
            // Display result notification
            setSendStatus({
              status: statusData.status === 'success' ? 'success' : 'error',
              message: statusData.status === 'success' 
                ? `Processing complete: ${statusData.landslide_detected ? 'Landslide detected!' : 'No landslide detected.'}`
                : `Error processing: ${statusData.message || 'Unknown error'}`
            });
            
            // Clean up
            isPolling = false;
            currentPollingId.current = null;
            clearInterval(intervalId);
            
            // Auto-hide notification after 10 seconds
            setTimeout(() => {
              setSendStatus({ status: 'idle' });
            }, 10000);
          }
        } else {
          throw new Error('Invalid response data');
        }
        
        // Stop if we've reached max poll count
        if (pollCount >= maxPolls) {
          console.log('Reached maximum polling attempts');
          
          setSendStatus({
            status: 'error',
            message: 'Processing timeout. Please check again later.'
          });
          
          // Clean up
          isPolling = false;
          currentPollingId.current = null;
          clearInterval(intervalId);
          
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 5000);
        }
      } catch (error) {
        console.error('Error checking landslide status:', error);
        
        // Stop polling after several consecutive errors
        if (pollCount >= 5) {
          setSendStatus({
            status: 'error',
            message: error instanceof Error ? error.message : 'Error checking status'
          });
          
          // Clean up
          isPolling = false;
          currentPollingId.current = null;
          clearInterval(intervalId);
          
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 3000);
        }
      }
    }, 5000);
    
    // Store cleanup function
    pollingCleanupFunction.current = () => {
      isPolling = false;
      currentPollingId.current = null;
      clearInterval(intervalId);
    };
  }, []);

  // Send coordinates to API endpoint using Next.js API route
  const sendCoordinates = async (lat: number, lng: number) => {
    try {
      setSendStatus({ status: 'sending' });
      
      // Create payload for GEE (X: longitude, Y: latitude)
      const payload = {
        X: lng,  // Longitude - GEE expects this first
        Y: lat,  // Latitude
        event_date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        api_key: process.env.NEXT_PUBLIC_API_KEY || "10102003" // Add API key from environment variable
      };
      
      console.log('Sending to API:', payload);
      
      // Use Next.js API proxy instead of calling ngrok directly
      const apiUrl = '/api/landslide';
      
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
  
      // Log status code and headers for debugging
      console.log('Response status code:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers]));
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText.substring(0, 500));
        throw new Error(`HTTP Error! Status code: ${response.status}`);
      }
  
      // Process JSON response
      const data = await response.json();
      console.log('Coordinates sent successfully:', data);
      
      // Save ID to state for tracking results
      const landslideId = data.id;
      if (!landslideId) {
        throw new Error('No landslide ID in response');
      }
      
      setLandslideResults({
        id: landslideId,
        status: 'processing',
        processingComplete: false
      });
      
      setSendStatus({ 
        status: 'success', 
        message: 'Coordinates sent successfully! ID: ' + landslideId 
      });
      
      // Start tracking processing status
      startPollingStatus(landslideId);
      
      // Notification will automatically disappear after status tracking begins
      setTimeout(() => {
        setSendStatus({ status: 'idle' });
      }, 5000);
    } catch (error) {
      console.error('Error sending coordinates:', error);
      setSendStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Error sending coordinates' 
      });
    }
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Vietnam coordinates
          setCurrentLocation([21.0285, 105.8542]);
          setLoading(false);
        }
      );
    } else {
      console.error('Browser does not support geolocation');
      // Fallback to Vietnam coordinates
      setCurrentLocation([21.0285, 105.8542]);
      setLoading(false);
    }
  }, []);

  // Clean up polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollingCleanupFunction.current) {
        pollingCleanupFunction.current();
      }
    };
  }, []);

  if (loading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={currentLocation || [21.0285, 105.8542]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Use satellite map layer from Esri */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/en-us/home">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        {currentLocation && (
          <Marker position={currentLocation} icon={customIcon}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        <LocationMarker 
          onLocationSelect={handleLocationSelect} 
          onSendCoordinates={sendCoordinates}
          searchPosition={goToCoords}
        />
        
        {/* Map center control component */}
        <MapCenterControl goToCoords={goToCoords} />
      </MapContainer>

      {/* Status notification */}
      {sendStatus.status !== 'idle' && (
        <div className={`absolute bottom-4 right-4 p-4 rounded-lg shadow-lg z-[9999] ${
          sendStatus.status === 'sending' ? 'bg-blue-100 text-blue-800' :
          sendStatus.status === 'success' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {sendStatus.status === 'sending' && 'Sending coordinates...'}
          {sendStatus.status === 'success' && sendStatus.message}
          {sendStatus.status === 'error' && `Error: ${sendStatus.message}`}
        </div>
      )}
      
      {/* Landslide analysis results */}
      {landslideResults && landslideResults.processingComplete && (
        <div className="absolute top-4 right-4 p-4 bg-white rounded-lg shadow-lg z-[9999] max-w-xs">
          <h3 className="font-bold text-lg">Analysis Results</h3>
          <p className="text-sm mb-2">ID: {landslideResults.id}</p>
          
          {landslideResults.status === 'success' ? (
            <>
              <div className={`p-2 mb-2 rounded ${
                landslideResults.landslideDetected 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {landslideResults.landslideDetected 
                  ? '⚠️ Landslide detected!' 
                  : '✅ No landslide detected.'}
              </div>
              
              {landslideResults.landslideDetected && landslideResults.coordinates && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <p className="font-medium">Landslide coordinates:</p>
                  <pre className="overflow-x-auto">
                    {JSON.stringify(landslideResults.coordinates, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="p-2 bg-red-100 text-red-800 rounded">
              Processing failed. Please try again.
            </div>
          )}
          
          <button 
            className="mt-2 w-full py-1 px-3 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            onClick={() => setLandslideResults(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}