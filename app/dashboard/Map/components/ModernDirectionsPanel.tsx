// app/dashboard/Map/components/ModernDirectionsPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Navigation,  
  MapPin, 
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle, 
  Play,
  Square,
  RotateCcw,
  Share,
  Bookmark
} from 'lucide-react';

interface DirectionsStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver?: {
    type: string;
    modifier?: string;
  };
}

interface ModernDirectionsPanelProps {
  currentLocation: [number, number] | null;
  selectedPlace: { name: string; coordinates: [number, number]; address?: string } | null;
  routeData: any;
  travelMode: 'walking' | 'cycling' | 'driving';
  onTravelModeChange: (mode: 'walking' | 'cycling' | 'driving') => void;
  onClearRoute: () => void;
}

const ModernDirectionsPanel: React.FC<ModernDirectionsPanelProps> = ({
  currentLocation,
  selectedPlace,
  routeData,
  travelMode,
  onTravelModeChange,
  onClearRoute
}) => {
  const [showSteps, setShowSteps] = useState(true);
  const [steps, setSteps] = useState<DirectionsStep[]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
    mode: string;
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Extract route information
  useEffect(() => {
    if (routeData?.properties) {
      setRouteInfo({
        distance: routeData.properties.distance || 0,
        duration: routeData.properties.duration || 0,
        mode: routeData.properties.mode || travelMode
      });
    }
  }, [routeData, travelMode]);

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${minutes} phút`;
    }
  };

  // Get travel mode info
  const getTravelModeInfo = (mode: string) => {
    switch (mode) {
      case 'driving':
        return { icon: '🚗', label: 'Lái xe', color: 'bg-blue-500' };
      case 'cycling':
        return { icon: '🚲', label: 'Xe đạp', color: 'bg-green-500' };
      case 'walking':
        return { icon: '🚶', label: 'Đi bộ', color: 'bg-orange-500' };
      default:
        return { icon: '🚗', label: 'Di chuyển', color: 'bg-gray-500' };
    }
  };

  // Start navigation simulation
  const handleStartNavigation = () => {
    setIsNavigating(true);
    // In a real app, this would integrate with navigation APIs
  };

  // Stop navigation
  const handleStopNavigation = () => {
    setIsNavigating(false);
  };

  const modeInfo = getTravelModeInfo(routeInfo?.mode || travelMode);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-4 text-white ${modeInfo.color}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Navigation className="w-5 h-5" />
            </div>
            <h2 className="font-semibold">Chỉ đường</h2>
          </div>
          <button
            onClick={onClearRoute}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Summary */}
        {routeInfo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {formatDistance(routeInfo.distance)}
              </span>
              <span className="text-lg">
                {formatDuration(routeInfo.duration)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <span>{modeInfo.icon}</span>
              <span>{modeInfo.label}</span>
              <span>•</span>
              <span>Tuyến đường tốt nhất</span>
            </div>
          </div>
        )}
      </div>

      {/* Travel Mode Selector */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Phương thức di chuyển</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { mode: 'walking', icon: '🚶', label: 'Đi bộ' },
            { mode: 'cycling', icon: '🚲', label: 'Xe đạp' },
            { mode: 'driving', icon: '🚗', label: 'Xe hơi' }
          ].map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => onTravelModeChange(mode as any)}
              className={`
                flex flex-col items-center p-3 rounded-xl transition-all duration-200
                ${travelMode === mode 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              <span className="text-lg mb-1">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Route Points */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-3">
          {/* Start Point */}
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Vị trí của bạn</p>
              <p className="text-xs text-gray-500">Điểm xuất phát</p>
            </div>
          </div>

          {/* Dotted line */}
          <div className="ml-1.5 w-0.5 h-6 bg-gray-300 bg-dotted"></div>

          {/* End Point */}
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {selectedPlace?.name || 'Điểm đến'}
              </p>
              {selectedPlace?.address && (
                <p className="text-xs text-gray-500">{selectedPlace.address}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {routeData && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            {!isNavigating ? (
              <button
                onClick={handleStartNavigation}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
              >
                <Play className="w-5 h-5" />
                <span className="font-medium">Bắt đầu điều hướng</span>
              </button>
            ) : (
              <button
                onClick={handleStopNavigation}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
              >
                <Square className="w-5 h-5" />
                <span className="font-medium">Dừng điều hướng</span>
              </button>
            )}
            
            <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Share className="w-5 h-5 text-gray-600" />
            </button>
            
            <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Bookmark className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Steps */}
      {routeData && (
        <div className="max-h-64 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="flex items-center justify-between w-full mb-3 text-left"
            >
              <h3 className="font-medium text-gray-900">Hướng dẫn chi tiết</h3>
              {showSteps ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {showSteps && (
              <div className="space-y-3">
                {/* Mock steps - in real app, these would come from the route data */}
                {[
                  { instruction: "Bắt đầu đi về hướng đông bắc trên đường hiện tại", distance: 50, duration: 60 },
                  { instruction: "Rẽ phải vào Đường ABC", distance: 200, duration: 150 },
                  { instruction: "Tiếp tục thẳng qua 2 ngã tư", distance: 500, duration: 400 },
                  { instruction: "Rẽ trái vào Phố XYZ", distance: 150, duration: 120 },
                  { instruction: "Đến nơi, bên phải", distance: 30, duration: 30 }
                ].map((step, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{step.instruction}</p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span>{formatDistance(step.distance)}</span>
                        <span>•</span>
                        <span>{formatDuration(step.duration)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current Navigation Step (when navigating) */}
      {isNavigating && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Tiếp theo</p>
              <p className="text-sm text-blue-700">Rẽ phải vào Đường ABC trong 200m</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-900">200m</p>
              <p className="text-xs text-blue-700">2 phút</p>
            </div>
          </div>
        </div>
      )}

      {/* No Route State */}
      {!currentLocation && (
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Cần vị trí hiện tại</h3>
          <p className="text-sm text-gray-600">
            Vui lòng cho phép truy cập vị trí để sử dụng tính năng chỉ đường
          </p>
        </div>
      )}

      {!selectedPlace && currentLocation && (
        <div className="p-8 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Chọn điểm đến</h3>
          <p className="text-sm text-gray-600">
            Tìm kiếm và chọn một địa điểm để bắt đầu chỉ đường
          </p>
        </div>
      )}

      {/* Route Options */}
      {routeData && (
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tuyến đường được đề xuất</span>
            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span>Tìm tuyến khác</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDirectionsPanel;