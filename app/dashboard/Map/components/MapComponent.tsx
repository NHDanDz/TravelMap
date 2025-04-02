'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LandslideMarkerLayer from './LandslideMarkerLayer'; 
import LandslideConfirmationForm from './LandslideConfirmationForm';

// Define data types
interface LandslideCoordinate {
  segment_id: string;
  east: number;
  north: number;
}

interface LandslideResult {
  id: string;
  status: string;
  landslideDetected?: boolean;
  landslide_coordinates?: { 
    coordinates: LandslideCoordinate[] 
  };
  model_processing_completed?: boolean;
}

interface StatusState {
  status: 'idle' | 'sending' | 'success' | 'error';
  message?: string;
}

interface LocationMarkerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  searchPosition: { lat: number; lng: number } | null;
  initialSearchProcessed: boolean;
  searchCounter: number;
  viewMode: 'normal' | 'landslide';
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  clickedPosition: L.LatLng | null;
  setClickedPosition: (position: L.LatLng | null) => void;
}

interface MapCenterControlProps {
  goToCoords: { lat: number; lng: number } | null;
  initialSearch: boolean;
  setInitialSearchProcessed: (value: boolean) => void;
  searchCounter: number;
}

interface MapComponentProps {
  goToCoords?: { lat: number; lng: number } | null;
  detectionMode?: boolean;
  fullscreen?: boolean;
  showSearchConfirmation?: boolean;
}

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
function MapCenterControl({ goToCoords, initialSearch, setInitialSearchProcessed, searchCounter }: MapCenterControlProps) {
  const map = useMap();
  
  useEffect(() => {
    if (goToCoords && initialSearch) {
      map.flyTo([goToCoords.lat, goToCoords.lng], 15, {
        duration: 1.5 // Animation duration (seconds)
      });
      // Mark initial search coordinates as processed
      setInitialSearchProcessed(true);
    }
  }, [map, goToCoords, initialSearch, setInitialSearchProcessed, searchCounter]);
  
  return null;
}

function LocationMarker({ 
  onLocationSelect, 
  searchPosition,
  initialSearchProcessed,
  searchCounter,
  viewMode,
  showConfirmDialog,
  setShowConfirmDialog,
  clickedPosition,
  setClickedPosition
}: LocationMarkerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  
  // Update position when search coordinates change and it's the initial search
  useEffect(() => {
    if (searchPosition && !initialSearchProcessed) {
      const newPosition = new L.LatLng(searchPosition.lat, searchPosition.lng);
      setPosition(newPosition);
      onLocationSelect(searchPosition.lat, searchPosition.lng);
      
      // Calculate bounds for square
      const newBounds = calculateSquareBounds(newPosition);
      setBounds(newBounds);
    }
  }, [searchPosition, onLocationSelect, initialSearchProcessed, searchCounter]);

  const map = useMapEvents({
    click(e) {
      // Only process click when in normal mode
      if (viewMode !== 'normal') return;
      
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.leaflet-control') || target.closest('.confirm-landslide-dialog')) {
        return;
      }
      
      setPosition(e.latlng);
      setBounds(calculateSquareBounds(e.latlng));
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      
      // Save clicked position and show confirmation dialog
      setClickedPosition(e.latlng);
      setShowConfirmDialog(true);
    },
  });

  // If in landslide mode, only show marker and rectangle if position is set
  if (viewMode === 'landslide' && position === null) {
    return null;
  }

  return (
    <>
      {position === null ? null : (
      <>
        <Marker position={position} icon={customIcon}>
          <Popup className="custom-popup">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="font-bold text-blue-600 border-b pb-2 mb-2">Vị trí đã chọn</h3>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm font-medium w-20">Kinh độ:</span>
                  <span className="text-sm bg-blue-50 py-1 px-2 rounded font-mono">{position.lng.toFixed(6)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm font-medium w-20">Vĩ độ:</span>
                  <span className="text-sm bg-blue-50 py-1 px-2 rounded font-mono">{position.lat.toFixed(6)}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
        {bounds && (
          <Rectangle 
            bounds={bounds}
            pathOptions={{
              color: '#1e40af', // Darker blue border
              fillColor: '#60a5fa', // Lighter blue fill
              fillOpacity: 0.2, // More transparent
              weight: 3, // Slightly thicker border
              dashArray: '5, 5', // Dashed line pattern
              lineCap: 'round',
              lineJoin: 'round'
            }}
          >
            <Popup className="custom-popup">
              <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                <h3 className="font-bold text-blue-600 border-b pb-2 mb-2">Vùng phân tích</h3>
                <div className="space-y-2">
                  <div className="flex items-center bg-blue-50 p-2 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm font-medium">Kích thước: 5km × 5km</span>
                  </div>
                  <div className="flex items-center bg-yellow-50 p-2 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-medium">Phạm vi kiểm tra lở đất</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Rectangle>
        )}
      </>
    )}
    </>
  );
}

// Component to get a reference to the map
function MapReference({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  
  return null;
}

export default function MapComponent({ 
  goToCoords = null,
  detectionMode = false,
  fullscreen = false,
  showSearchConfirmation = false
}: MapComponentProps) {
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendStatus, setSendStatus] = useState<StatusState>({ status: 'idle' });
  const [landslideResults, setLandslideResults] = useState<LandslideResult | null>(null);
  
  // Add state to track view mode
  const [viewMode, setViewMode] = useState<'normal' | 'landslide'>('normal');
  
  // Add state to track if initial search coordinates have been processed
  const [initialSearchProcessed, setInitialSearchProcessed] = useState<boolean>(false);
  // Add new state to track new searches
  const [searchCounter, setSearchCounter] = useState<number>(0);
  
  // Track active polling processes
  const currentPollingId = useRef<string | null>(null);
  const pollingCleanupFunction = useRef<(() => void) | null>(null);

  // Lift state from LocationMarker to parent component
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [clickedPosition, setClickedPosition] = useState<L.LatLng | null>(null);

  // Add state to manage landslide confirmation form
  // Add state to save coordinates sent to API
  const [sentCoordinates, setSentCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const [showConfirmationForm, setShowConfirmationForm] = useState<boolean>(false);
  const [selectedLandslideCoord, setSelectedLandslideCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [landslideImage, setLandslideImage] = useState<string | null>(null);

  // Reference to the map object
  const mapRef = useRef<L.Map | null>(null);

  // Function to get reference to Leaflet map
  const setMapRef = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  // Fix for Leaflet icons in Next.js
  useEffect(() => {
    // Set default marker icon
    L.Marker.prototype.options.icon = customIcon;
  }, []);

  // Add a new useEffect hook to detect when goToCoords changes
  useEffect(() => {
    if (goToCoords) {
      // Reset initialSearchProcessed state to false when there are new search coordinates
      setInitialSearchProcessed(false);
      // Increment search counter to trigger other effects
      setSearchCounter(prev => prev + 1);
    }
  }, [goToCoords]);

  // Add new useEffect to handle when goToCoords changes and showSearchConfirmation is true
  useEffect(() => {
    if (goToCoords && showSearchConfirmation && viewMode === 'normal') {
      // Create corresponding position and show confirmation dialog
      const newPosition = new L.LatLng(goToCoords.lat, goToCoords.lng);
      setClickedPosition(newPosition);
      setShowConfirmDialog(true);
    }
  }, [goToCoords, showSearchConfirmation, viewMode]);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    console.log('Vị trí đã chọn:', { lat, lng });
  }, []);
  
  // Function to handle when user confirms landslide point
  const handleLandslideConfirmation = async (landslideData: any) => {
    try {
      setSendStatus({ status: 'sending', message: 'Đang lưu thông tin điểm sạt lở...' });
      
      // Determine if this is an update or new landslide
      const isUpdate = !!landslideData.id;
      const apiMethod = isUpdate ? 'PUT' : 'POST';
      
      // Call API endpoint to save confirmed landslide point
      const response = await fetch('/api/landslide-confirmation', {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...landslideData,
          detectionResultId: landslideResults?.id || null,
          originalCoordinates: landslideResults?.landslide_coordinates?.coordinates || []
        }),
      });

      // Handle conflict response - might be trying to create a duplicate
      if (response.status === 409) {
        const errorData = await response.json();
        
        // If it's a duplicate error with landslide info, we can use this information
        if (errorData.duplicate && errorData.landslide) {
          console.log('Duplicate landslide detected:', errorData.landslide);
          
          // Update the existing landslide instead
          const updateResponse = await fetch('/api/landslide-confirmation', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...landslideData,
              id: errorData.landslide.id, // Use the existing ID
              detectionResultId: landslideResults?.id || null,
              originalCoordinates: landslideResults?.landslide_coordinates?.coordinates || []
            }),
          });
          
          if (!updateResponse.ok) {
            throw new Error('Lỗi khi cập nhật thông tin điểm sạt lở');
          }
          
          const updateResult = await updateResponse.json();
          console.log('Đã cập nhật điểm sạt lở:', updateResult);
          
          setSendStatus({
            status: 'success',
            message: `Đã cập nhật điểm sạt lở: ${landslideData.name}`,
          });
          
          // Close confirmation form
          setShowConfirmationForm(false);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 5000);
          
          return;
        } else {
          throw new Error(errorData.error || 'Lỗi khi lưu thông tin điểm sạt lở');
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi lưu thông tin điểm sạt lở');
      }

      const result = await response.json();
      console.log('Đã lưu điểm sạt lở:', result);
      
      setSendStatus({
        status: 'success',
        message: isUpdate 
          ? `Đã cập nhật điểm sạt lở: ${landslideData.name}`
          : `Đã xác nhận và lưu điểm sạt lở: ${landslideData.name}`,
      });
      
      // Close confirmation form
      setShowConfirmationForm(false);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setSendStatus({ status: 'idle' });
      }, 5000);
    } catch (error) {
      console.error('Lỗi khi lưu điểm sạt lở:', error);
      setSendStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Lỗi khi lưu thông tin điểm sạt lở',
      });
      
      // Auto-hide error notification after 5 seconds
      setTimeout(() => {
        setSendStatus({ status: 'idle' });
      }, 5000);
    }
  };
  
  // Function to capture map area at selected location
  const captureMapArea = useCallback(() => {
    if (sentCoordinates && mapRef.current) {
      try {
        // Method 1: Create sample satellite image URL based on coordinates
        // Use conversion from map coordinates to image area coordinates
        
        // Use OpenStreetMap static image API - no token needed
        const zoom = 15; // Appropriate zoom level
        const width = 500;
        const height = 300;
        
        // Create URL for OpenStreetMap static image
        return `https://staticmap.openstreetmap.de/staticmap.php?center=${sentCoordinates.lat},${sentCoordinates.lng}&zoom=${zoom}&size=${width}x${height}&maptype=mapnik`;
        
        // Fallback method: Use placeholder image
        // return `/images/map-placeholder.jpg`;
      } catch (error) {
        console.error("Lỗi khi chụp bản đồ:", error);
        return `/images/map-placeholder.jpg`;
      }
    }
    return `/images/map-placeholder.jpg`;
  }, [sentCoordinates, mapRef]);

  // Function to open landslide confirmation form with original coordinates sent to API
  const openConfirmationForm = useCallback(() => {
    // Always prioritize using coordinates sent to API
    if (sentCoordinates) {
      setSelectedLandslideCoord(sentCoordinates);
      
      // Instead of calling non-existent API, use function to capture map area
      const imageUrl = captureMapArea();
      setLandslideImage(imageUrl);
      
      setShowConfirmationForm(true);
    } else {
      console.error('No coordinates sent to API');
      setSendStatus({
        status: 'error',
        message: 'Không thể xác nhận: Thiếu thông tin tọa độ gốc',
      });
    }
  }, [sentCoordinates, captureMapArea]);
  
  // Status polling function with improved request handling
  const startPollingStatus = useCallback((landslideId: string) => {
    // Prevent duplicate polling - check if already polling this ID
    if (currentPollingId.current === landslideId) {
      console.log(`Đã đang theo dõi trạng thái cho ID: ${landslideId}`);
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
    const maxPolls = 100;
    let isPolling = true;
    
    console.log(`Bắt đầu theo dõi trạng thái cho ID: ${landslideId}`);
    
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
        
        console.log(`Kiểm tra trạng thái (${pollCount}/${maxPolls}) cho ID: ${landslideId}`);
        
        const response = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Lỗi phản hồi:', errorText.substring(0, 500) + '...');
          throw new Error(`Lỗi HTTP khi kiểm tra trạng thái: ${response.status}`);
        }
        
        // Process JSON response
        const statusData = await response.json();
        console.log('Dữ liệu trạng thái:', statusData);
        
        // CRITICAL CHECK: Stop immediately if we see success status AND model processing completed
        if (statusData && statusData.status === 'success' && statusData.model_processing_completed === true) {
          console.log('ĐÃ NHẬN ĐƯỢC TRẠNG THÁI THÀNH CÔNG - DỪNG NGAY LẬP TỨC');
          
          // Update state with results
          setLandslideResults({
            id: landslideId,
            status: 'success',
            landslideDetected: statusData.landslide_detected === true,
            landslide_coordinates: statusData.landslide_coordinates || null,
            model_processing_completed: true
          });
          
          // Display success notification
          setSendStatus({
            status: 'success',
            message: `Xử lý hoàn tất: ${statusData.landslide_detected ? 'Phát hiện lở đất!' : 'Không phát hiện lở đất.'}`
          });
          
          // Switch to landslide view if needed
          if (statusData.landslide_detected && statusData.landslide_coordinates) {
            setViewMode('landslide');
          }
          
          // Clean up - using multiple approaches to ensure it stops
          isPolling = false;
          currentPollingId.current = null;
          clearInterval(intervalId);
          pollingCleanupFunction.current = null;
          
          // Auto-hide notification
          setTimeout(() => {
            setSendStatus({ status: 'idle' });
          }, 10000);
          
          return; // Exit immediately
        }
        
        // For all other cases, continue with normal processing
        if (statusData && typeof statusData === 'object') {
          
          // Check for error status
          if (statusData.status === 'error' || statusData.status === 'error_detection') {
            console.log('Đã nhận được trạng thái lỗi, dừng kiểm tra');
            
            // Update state with error results
            setLandslideResults({
              id: landslideId,
              status: 'error',
              landslideDetected: false, 
              model_processing_completed: true
            });
            
            // Display error notification
            setSendStatus({
              status: 'error',
              message: `Lỗi xử lý: ${statusData.message || 'Lỗi không xác định'}`
            });
            
            // Clean up
            isPolling = false;
            currentPollingId.current = null;
            clearInterval(intervalId);
            
            // Auto-hide notification
            setTimeout(() => {
              setSendStatus({ status: 'idle' });
            }, 10000);
            
            return; // Exit early
          }
          
          // If we're still processing, update state without stopping poll
          setLandslideResults({
            id: landslideId,
            status: statusData.status || 'unknown',
            landslideDetected: statusData.landslide_detected === true,
            landslide_coordinates: statusData.landslide_coordinates || null,
            model_processing_completed: statusData.model_processing_completed === true
          });
        } else {
          throw new Error('Dữ liệu phản hồi không hợp lệ');
        }
        
        // Stop if we've reached max poll count
        if (pollCount >= maxPolls) {
          console.log('Đã đạt đến số lần thử tối đa');
          
          setSendStatus({
            status: 'error',
            message: 'Quá thời gian xử lý. Vui lòng kiểm tra lại sau.'
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
        console.error('Lỗi kiểm tra trạng thái lở đất:', error);
        
        // Stop polling after several consecutive errors
        if (pollCount >= 5) {
          setSendStatus({
            status: 'error',
            message: error instanceof Error ? error.message : 'Lỗi kiểm tra trạng thái'
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

    // Return the cleanup function in case we need to clean up manually
    return () => {
      if (pollingCleanupFunction.current) {
        pollingCleanupFunction.current();
      }
    };
  }, []);

  // Send coordinates to API endpoint using Next.js API route
  const sendCoordinates = async (lat: number, lng: number, eventDate: string) => {
    try {
      setSendStatus({ status: 'sending' });
      
      // Save sent coordinates in state for later use when confirming landslide
      setSentCoordinates({ lat, lng });
      
      // Create payload for GEE (X: longitude, Y: latitude)
      const payload = {
        X: lng,  // Longitude - GEE expects this first
        Y: lat,  // Latitude
        event_date: eventDate,
        api_key: process.env.NEXT_PUBLIC_API_KEY || "10102003" // Add API key from environment variable
      };
      
      console.log('Gửi đến API:', payload);
      
      // Use Next.js API proxy instead of calling ngrok directly
      const apiUrl = '/api/landslide';
      
      console.log('URL API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
  
      // Log status code and headers for debugging
      console.log('Mã trạng thái phản hồi:', response.status);
      console.log('Headers phản hồi:', Object.fromEntries([...response.headers]));
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Phản hồi lỗi:', errorText.substring(0, 500));
        throw new Error(`Lỗi HTTP! Mã trạng thái: ${response.status}`);
      }
  
      // Process JSON response
      const data = await response.json();
      console.log('Tọa độ đã được gửi thành công:', data);
      
      // Save ID to state for tracking results
      const responseId = data.id;
      if (!responseId) {
        throw new Error('Không có ID lở đất trong phản hồi');
      }
      
      setLandslideResults({
        id: responseId,
        status: 'processing',
        model_processing_completed: false
      });
      
      setSendStatus({ 
        status: 'success', 
        message: 'Tọa độ đã được gửi thành công! ID: ' + responseId 
      });
      
      // Start tracking processing status
      startPollingStatus(responseId);
      
      // Notification will automatically disappear after status tracking begins
      setTimeout(() => {
        setSendStatus({ status: 'idle' });
      }, 5000);
    } catch (error) {
      console.error('Lỗi gửi tọa độ:', error);
      setSendStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Lỗi gửi tọa độ' 
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
          console.error('Lỗi lấy vị trí:', error);
          // Fallback to Vietnam coordinates
          setCurrentLocation([21.0285, 105.8542]);
          setLoading(false);
        }
      );
    } else {
      console.error('Trình duyệt không hỗ trợ geolocation');
      // Fallback to Vietnam coordinates
      setCurrentLocation([21.0285, 105.8542]);
      setLoading(false);
    }
  }, []);

  // Listen for custom event to send data
  useEffect(() => {
    const handleSendLandslideData = (event: CustomEvent) => {
      const { lat, lng, eventDate } = event.detail;
      sendCoordinates(lat, lng, eventDate);
    };

    window.addEventListener('send-landslide-data', handleSendLandslideData as EventListener);

    return () => {
      window.removeEventListener('send-landslide-data', handleSendLandslideData as EventListener);
      
      if (pollingCleanupFunction.current) {
        pollingCleanupFunction.current();
      }
    };
  }, []);

  if (loading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  const containerClass = fullscreen 
    ? "w-full h-screen relative" 
    : "w-full h-full min-h-[600px] relative";

  return (
    <div className={containerClass}>
      <MapContainer
        center={goToCoords ? [goToCoords.lat, goToCoords.lng] : currentLocation ? currentLocation : [21.0285, 105.8542]}
        zoom={goToCoords ? 15 : 7}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={(map) => {
          if (map) setMapRef(map);
        }}
      >
        {/* Add zoom controls in a position that's not covered */}
        <div className="leaflet-control-container">
          <div className="leaflet-top leaflet-right" style={{ zIndex: 1000, marginTop: '10px', marginRight: '10px' }}>
            <div className="leaflet-control-zoom leaflet-bar leaflet-control">
              <a className="leaflet-control-zoom-in" href="#" title="Zoom in" role="button" aria-label="Zoom in">+</a>
              <a className="leaflet-control-zoom-out" href="#" title="Zoom out" role="button" aria-label="Zoom out">−</a>
            </div>
          </div>
        </div>
        
        {/* Use standard OpenStreetMap layer instead of satellite */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {currentLocation && (
          <Marker position={currentLocation} icon={customIcon}>
            <Popup>Vị trí của bạn</Popup>
          </Marker>
        )}

        {/* LocationMarker displays in both view modes, but pass viewMode so it can adjust behavior */}
        <LocationMarker 
          onLocationSelect={handleLocationSelect} 
          searchPosition={goToCoords}
          initialSearchProcessed={initialSearchProcessed}
          searchCounter={searchCounter}
          viewMode={viewMode}
          showConfirmDialog={showConfirmDialog}
          setShowConfirmDialog={setShowConfirmDialog}
          clickedPosition={clickedPosition}
          setClickedPosition={setClickedPosition}
        />
        
        {/* Display landslide points if in landslide view mode and analysis results exist */}
        {viewMode === 'landslide' && landslideResults?.landslideDetected && 
          landslideResults.landslide_coordinates?.coordinates && (
          <LandslideMarkerLayer 
            coordinates={landslideResults.landslide_coordinates.coordinates} 
            autoFitBounds={true}
            centerLongitude={goToCoords?.lng || currentLocation?.[1] || 105.8542}
            centerLatitude={goToCoords?.lat || currentLocation?.[0] || 21.0285}
            onMarkerClick={() => {
              // When user clicks a marker, show confirmation form using original coordinates sent to API
              openConfirmationForm();
            }}
          />
        )}
        {/* Map center control component */}
        <MapCenterControl 
          goToCoords={goToCoords} 
          initialSearch={!initialSearchProcessed} 
          setInitialSearchProcessed={setInitialSearchProcessed}
          searchCounter={searchCounter}
        />
        
        {/* Component to get reference to map object */}
        <MapReference onMapReady={setMapRef} />
      </MapContainer>

      {/* Confirmation dialog - only display in normal mode */}
      {showConfirmDialog && clickedPosition && viewMode === 'normal' && (
        <div className="confirm-landslide-dialog absolute top-40 right-4 bg-white p-4 rounded-lg shadow-lg z-[9999] max-w-sm">
          <h3 className="font-bold text-lg mb-2">Phát hiện sạt lở đất</h3>
          <p className="text-sm mb-3">Phân tích khu vực này để tìm kiếm sạt lở đất?</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Chọn mốc thời gian:</label>
            <input 
              type="date" 
              id="event-date" 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              defaultValue={new Date().toISOString().split('T')[0]} 
            />
          </div>
          
          <div className="text-sm mb-3">
            <p>Kinh độ: {clickedPosition.lng.toFixed(6)}</p>
            <p>Vĩ độ: {clickedPosition.lat.toFixed(6)}</p>
          </div>
          
          <div className="flex justify-between">
            <button 
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              onClick={() => setShowConfirmDialog(false)}
            >
              Hủy
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              onClick={() => {
                // Get date value from input
                const dateInput = document.getElementById('event-date') as HTMLInputElement;
                const eventDate = dateInput?.value || new Date().toISOString().split('T')[0];
                
                // Call function to send data
                window.dispatchEvent(new CustomEvent('send-landslide-data', {
                  detail: {
                    lat: clickedPosition.lat,
                    lng: clickedPosition.lng,
                    eventDate: eventDate
                  }
                }));
                
                setShowConfirmDialog(false);
              }}
            >
              Phân tích
            </button>
          </div>
        </div>
      )}

      {/* Landslide confirmation form */}
      {showConfirmationForm && selectedLandslideCoord && (
        <LandslideConfirmationForm
          isOpen={showConfirmationForm}
          onClose={() => setShowConfirmationForm(false)}
          onSubmit={handleLandslideConfirmation}
          detectedCoordinates={selectedLandslideCoord}
          detectedImage={landslideImage}
        />
      )}

      {/* View mode toggle button */}
      {landslideResults?.landslideDetected && landslideResults.landslide_coordinates?.coordinates && (
        <div className="absolute top-4 left-4 z-[1000] space-y-2">
          <button 
            className={`px-3 py-2 rounded-lg shadow-lg w-full ${
              viewMode === 'normal' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-blue-500'
            }`}
            onClick={() => setViewMode(viewMode === 'normal' ? 'landslide' : 'normal')}
          >
            {viewMode === 'normal' ? 'Xem điểm lở đất' : 'Chế độ thường'}
          </button>
          
          {/* Add button to confirm landslide point */}
          {viewMode === 'landslide' && (
            <button 
              className="px-3 py-2 rounded-lg shadow-lg bg-green-500 text-white w-full"
              onClick={() => {
                // Use original coordinates sent to API to confirm landslide
                openConfirmationForm();
              }}
            >
              Xác nhận sạt lở
            </button>
          )}
        </div>
      )}

      
      {/* Display detailed status during processing */}
      {landslideResults && !landslideResults.model_processing_completed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg z-[9999] w-80 mx-auto">
          <h3 className="font-bold text-center">Đang xử lý...</h3>
          <p className="text-sm text-center mt-1">
            {landslideResults.status === 'processing' && 'Khởi tạo xử lý...'}
            {landslideResults.status === 'processing_images' && 'Đang xử lý ảnh vệ tinh...'}
            {landslideResults.status === 'detecting_landslides' && 'Đang phát hiện lở đất...'}
            {landslideResults.status === 'unknown' && 'Đang xử lý...'}
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      )}

      {/* Status notification */}
      {sendStatus.status !== 'idle' && (
        <div className={`absolute bottom-4 right-4 p-4 rounded-lg shadow-lg z-[9999] ${
          sendStatus.status === 'sending' ? 'bg-blue-100 text-blue-800' :
          sendStatus.status === 'success' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {sendStatus.status === 'sending' && (sendStatus.message || 'Đang gửi tọa độ...')}
          {sendStatus.status === 'success' && sendStatus.message}
          {sendStatus.status === 'error' && `Lỗi: ${sendStatus.message}`}
        </div>
      )}
      
      {/* Landslide analysis results */}
      {landslideResults && landslideResults.model_processing_completed && (
        <div className="absolute top-4 right-4 p-4 bg-white rounded-lg shadow-lg z-[9999] max-w-xs">
          <h3 className="font-bold text-lg">Kết quả phân tích</h3>
          <p className="text-sm mb-2">ID: {landslideResults.id}</p>
          
          {landslideResults.status === 'success' ? (
            <>
              <div className={`p-2 mb-2 rounded ${
                landslideResults.landslideDetected 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {landslideResults.landslideDetected 
                  ? '⚠️ Phát hiện lở đất!' 
                  : '✅ Không phát hiện lở đất.'}
              </div>
              
              {landslideResults.landslideDetected && landslideResults.landslide_coordinates?.coordinates && (
                <div className="mt-2">
                  <p className="font-medium text-sm">Đã phát hiện {landslideResults.landslide_coordinates.coordinates.length} điểm lở đất</p>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="mt-2 flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
                      onClick={() => setViewMode('landslide')}
                    >
                      Xem trên bản đồ
                    </button>
                    
                    <button 
                      className="mt-2 flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                      onClick={() => {
                        // Use original coordinates sent to API to confirm landslide
                        openConfirmationForm();
                      }}
                    >
                      Xác nhận sạt lở
                    </button>
                  </div>
                  
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-h-40 overflow-y-auto">
                    <p className="font-medium mb-1">Chi tiết tọa độ:</p>
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-1 border text-center mx-auto">ID</th>
                          <th className="p-1 border text-center mx-auto">Đông</th>
                          <th className="p-1 border text-center mx-auto">Bắc</th>
                         </tr>
                      </thead>
                      <tbody>
                        {landslideResults.landslide_coordinates.coordinates.map((coord: LandslideCoordinate, idx: number) => (
                          <tr key={coord.segment_id || idx}>
                            <td className="p-1 border">{coord.segment_id}</td>
                            <td className="p-1 border text-right">{parseFloat(coord.east.toString()).toFixed(1)}</td>
                            <td className="p-1 border text-right">{parseFloat(coord.north.toString()).toFixed(1)}</td>
                          </tr>
                        ))} 
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-2 bg-red-100 text-red-800 rounded">
              Xử lý thất bại. Vui lòng thử lại.
            </div>
          )}
          
          <button 
            className="mt-3 w-full py-1 px-3 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            onClick={() => setLandslideResults(null)}
          >
            Đóng
          </button>
        </div>
      )}
    </div> 
  );
}