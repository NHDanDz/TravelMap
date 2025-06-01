// app/trip-planner/[id]/map/components/TripMapControls.tsx
'use client';

import React, { useState } from 'react';
import { 
  Settings, Layers, Route, Play, Square, RotateCcw,
  Navigation, Camera, Share, Download, Target, 
  ChevronDown, Sun, Moon, Map, Globe, Satellite,
  Eye, EyeOff, Maximize2, Minimize2, Activity
} from 'lucide-react';

interface MapViewState {
  activeDay: number;
  showRoute: boolean;
  showAllDays: boolean;
  followRoute: boolean;
  mapStyle: string;
  showTimeline: boolean;
  fullScreen: boolean;
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  days: any[];
}

interface TripMapControlsProps {
  mapViewState: MapViewState;
  onMapViewStateChange: (updates: Partial<MapViewState>) => void;
  onRouteSimulation: () => void;
  trip: Trip;
}

const mapStyles = [
  { id: 'streets-v12', name: 'Đường phố', icon: Map },
  { id: 'outdoors-v12', name: 'Ngoài trời', icon: Globe },
  { id: 'satellite-v9', name: 'Vệ tinh', icon: Satellite },
  { id: 'satellite-streets-v12', name: 'Vệ tinh + Đường', icon: Satellite },
  { id: 'light-v11', name: 'Sáng', icon: Sun },
  { id: 'dark-v11', name: 'Tối', icon: Moon }
];

export default function TripMapControls({
  mapViewState,
  onMapViewStateChange,
  onRouteSimulation,
  trip
}: TripMapControlsProps) {
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentDay = trip.days.find(day => day.dayNumber === mapViewState.activeDay);
  const canSimulateRoute = currentDay && currentDay.places && currentDay.places.length >= 2;

  const handleStyleChange = (styleId: string) => {
    onMapViewStateChange({ mapStyle: styleId });
    setShowStyleMenu(false);
  };

  const handleScreenshot = () => {
    // This would integrate with map screenshot functionality
    console.log('Taking screenshot...');
  };

  const handleExport = () => {
    // This would export the current view as PDF/image
    console.log('Exporting map...');
  };

  const handleFitToRoute = () => {
    // This would fit the map to show the current route
    console.log('Fitting to route...');
  };

  return (
    <div className="space-y-3">
      {/* Main Controls Panel */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Route Toggle */}
          <button
            onClick={() => onMapViewStateChange({ showRoute: !mapViewState.showRoute })}
            className={`
              flex items-center justify-center space-x-2 p-3 rounded-lg text-sm font-medium transition-all duration-200
              ${mapViewState.showRoute 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title="Bật/tắt hiển thị tuyến đường"
          >
            <Route className="w-4 h-4" />
            <span>Tuyến</span>
          </button>

          {/* All Days Toggle */}
          <button
            onClick={() => onMapViewStateChange({ showAllDays: !mapViewState.showAllDays })}
            className={`
              flex items-center justify-center space-x-2 p-3 rounded-lg text-sm font-medium transition-all duration-200
              ${mapViewState.showAllDays 
                ? 'bg-green-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title="Hiển thị tất cả ngày / chỉ ngày hiện tại"
          >
            <Eye className="w-4 h-4" />
            <span>{mapViewState.showAllDays ? 'Tất cả' : 'Ngày'}</span>
          </button>

          {/* Route Simulation */}
          <button
            onClick={onRouteSimulation}
            disabled={!canSimulateRoute}
            className={`
              flex items-center justify-center space-x-2 p-3 rounded-lg text-sm font-medium transition-all duration-200
              ${!canSimulateRoute 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : mapViewState.followRoute 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md'
              }
            `}
            title={mapViewState.followRoute ? "Dừng mô phỏng" : "Mô phỏng tuyến đường"}
          >
            {mapViewState.followRoute ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{mapViewState.followRoute ? 'Dừng' : 'Chạy'}</span>
          </button>

          {/* Fit to Route */}
          <button
            onClick={handleFitToRoute}
            className="flex items-center justify-center space-x-2 p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all duration-200"
            title="Phóng to để thấy toàn bộ tuyến đường"
          >
            <Target className="w-4 h-4" />
            <span>Fit</span>
          </button>
        </div>
      </div>

      {/* Map Style Selector */}
      <div className="relative">
        <button
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 flex items-center justify-between hover:shadow-xl transition-all duration-200"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {mapStyles.find(style => style.id === mapViewState.mapStyle)?.name || 'Đường phố'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showStyleMenu ? 'rotate-180' : ''}`} />
        </button>

        {showStyleMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-30">
            {mapStyles.map(style => {
              const StyleIcon = style.icon;
              return (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors
                    ${mapViewState.mapStyle === style.id 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <StyleIcon className="w-4 h-4" />
                  <span>{style.name}</span>
                  {mapViewState.mapStyle === style.id && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 space-y-2">
        <button
          onClick={handleScreenshot}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all duration-200"
          title="Chụp ảnh màn hình"
        >
          <Camera className="w-4 h-4" />
          <span>Chụp ảnh</span>
        </button>

        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all duration-200"
          title="Xuất bản đồ"
        >
          <Download className="w-4 h-4" />
          <span>Xuất file</span>
        </button>
      </div>

      {/* Settings Panel */}
      <div className="relative">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`
            w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 flex items-center justify-between hover:shadow-xl transition-all duration-200
            ${showSettings ? 'bg-blue-50 border-blue-200' : ''}
          `}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Cài đặt</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
        </button>

        {showSettings && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-30">
            <div className="space-y-4">
              {/* Animation Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tốc độ mô phỏng
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  defaultValue="5"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Chậm</span>
                  <span>Nhanh</span>
                </div>
              </div>

              {/* Auto-fit */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tự động căn chỉnh</span>
                <button className="w-10 h-6 bg-gray-300 rounded-full relative transition-colors duration-200">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform duration-200" />
                </button>
              </div>

              {/* Show Labels */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Hiển thị nhãn</span>
                <button className="w-10 h-6 bg-blue-600 rounded-full relative transition-colors duration-200">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform duration-200" />
                </button>
              </div>

              {/* 3D Buildings */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Tòa nhà 3D</span>
                <button className="w-10 h-6 bg-gray-300 rounded-full relative transition-colors duration-200">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Day Info */}
      {currentDay && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">Ngày {mapViewState.activeDay}</div>
            <div className="text-sm text-gray-600">
              {currentDay.places?.length || 0} địa điểm
            </div>
            {currentDay.places && currentDay.places.length > 0 && (
              <div className="flex items-center justify-center space-x-1 mt-2">
                <Activity className="w-3 h-3 text-blue-600" />
                <span className="text-xs text-blue-600">
                  {currentDay.places[0].startTime} - {currentDay.places[currentDay.places.length - 1].endTime || '...'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend for All Days View */}
      {mapViewState.showAllDays && trip.days.length > 1 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Chú thích ngày</div>
          <div className="grid grid-cols-2 gap-1">
            {trip.days.slice(0, 6).map(day => (
              <div key={day.dayNumber} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'][(day.dayNumber - 1) % 6] 
                  }}
                />
                <span className="text-xs text-gray-600">Ngày {day.dayNumber}</span>
              </div>
            ))}
          </div>
          {trip.days.length > 6 && (
            <div className="text-xs text-gray-500 mt-1">+{trip.days.length - 6} ngày khác</div>
          )}
        </div>
      )}
    </div>
  );
}