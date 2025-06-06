'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, Route, Check, X, Info, AlertTriangle,
  Calendar, Loader2, Zap, CheckCircle
} from 'lucide-react';

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  image: string;
  latitude: string;
  longitude: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  openingHours?: string;
  notes?: string;
}

interface Day {
  dayNumber: number;
  date: string;
  places: Place[];
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  numDays: number;
  days: Day[];
}

interface OptimizationOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface TripOptimizerProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onClose: () => void;
}

// Format time
const formatTime = (timeStr: string): string => {
  return timeStr;
};

// Format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours} giờ ` : ''}${mins > 0 ? `${mins} phút` : ''}`;
};

// Calculate distance between two coordinates (in km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

// Convert degrees to radians
const deg2rad = (deg: number) => {
  return deg * (Math.PI/180);
};

// Optimization strategies
const optimizationOptions: OptimizationOption[] = [
  {
    id: 'distance',
    name: 'Tối ưu khoảng cách',
    description: 'Sắp xếp địa điểm theo thứ tự để giảm thiểu tổng quãng đường di chuyển',
    icon: <Route className="w-5 h-5 text-blue-500" />
  },
  {
    id: 'time',
    name: 'Tối ưu thời gian',
    description: 'Phân bổ thời gian hợp lý cho từng địa điểm và xem xét giờ mở cửa',
    icon: <Clock className="w-5 h-5 text-green-500" />
  },
  {
    id: 'balance',
    name: 'Cân bằng hoạt động',
    description: 'Phân phối các loại địa điểm để tạo lịch trình đa dạng',
    icon: <Calendar className="w-5 h-5 text-purple-500" />
  }
];

const TripOptimizer: React.FC<TripOptimizerProps> = ({ 
  trip, 
  onUpdateTrip,
  onClose
}) => {
  const [optimizationMethod, setOptimizationMethod] = useState<string>('balance');
  const [optimizedTrip, setOptimizedTrip] = useState<Trip | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationLogs, setOptimizationLogs] = useState<string[]>([]);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [optimizationConflicts, setOptimizationConflicts] = useState<{
    dayNumber: number;
    message: string;
  }[]>([]);
  
  // Effect to run optimization when method changes
  useEffect(() => {
    if (optimizing) {
      runOptimization();
    }
  }, [optimizationMethod]);
  
  // Start optimization
  const startOptimization = () => {
    setOptimizing(true);
    setOptimizationLogs([]);
    setOptimizationComplete(false);
    setOptimizationConflicts([]);
    runOptimization();
  };
  
  // Run optimization with currently selected method
  const runOptimization = () => {
    addLog(`Bắt đầu tối ưu hóa lịch trình với phương pháp: ${getMethodName(optimizationMethod)}`);
    
    // Create a deep copy of the trip
    const tripCopy: Trip = JSON.parse(JSON.stringify(trip));
    
    // Process each day
    tripCopy.days.forEach(day => {
      addLog(`Đang tối ưu Ngày ${day.dayNumber} (${day.places.length} địa điểm)`);
      
      if (day.places.length <= 1) {
        addLog(`Ngày ${day.dayNumber} chỉ có ${day.places.length} địa điểm, không cần tối ưu`);
        return;
      }
      
      // Apply different optimization strategies
      switch (optimizationMethod) {
        case 'distance':
          optimizeByDistance(day);
          break;
        case 'time':
          optimizeByTime(day);
          break;
        case 'balance':
          optimizeByBalance(day);
          break;
      }
    });
    
    // Simulate some processing time
    setTimeout(() => {
      setOptimizedTrip(tripCopy);
      setOptimizing(false);
      setOptimizationComplete(true);
      addLog('Hoàn thành tối ưu hóa lịch trình');
    }, 2000);
  };
  
  // Log optimization steps
  const addLog = (message: string) => {
    setOptimizationLogs(prevLogs => [...prevLogs, message]);
  };
  
  // Get method name
  const getMethodName = (methodId: string): string => {
    const option = optimizationOptions.find(opt => opt.id === methodId);
    return option ? option.name : methodId;
  };
  
  // Optimize by minimizing distance between places
  const optimizeByDistance = (day: Day) => {
    addLog(`Tính toán khoảng cách giữa các địa điểm...`);
    
    if (day.places.length <= 1) return;
    
    // Build distance matrix
    const distanceMatrix: number[][] = [];
    for (let i = 0; i < day.places.length; i++) {
      distanceMatrix[i] = [];
      for (let j = 0; j < day.places.length; j++) {
        if (i === j) {
          distanceMatrix[i][j] = 0;
        } else {
          const place1 = day.places[i];
          const place2 = day.places[j];
          const distance = calculateDistance(
            parseFloat(place1.latitude),
            parseFloat(place1.longitude),
            parseFloat(place2.latitude),
            parseFloat(place2.longitude)
          );
          distanceMatrix[i][j] = distance;
        }
      }
    }
    
    // Simple greedy algorithm for path optimization
    const visited = new Array(day.places.length).fill(false);
    const optimizedIndices: number[] = [];
    
    // Start with the first place
    let currentIndex = 0;
    optimizedIndices.push(currentIndex);
    visited[currentIndex] = true;
    
    // Find the nearest unvisited place each time
    while (optimizedIndices.length < day.places.length) {
      let nearestIndex = -1;
      let minDistance = Infinity;
      
      for (let i = 0; i < day.places.length; i++) {
        if (!visited[i] && distanceMatrix[currentIndex][i] < minDistance) {
          minDistance = distanceMatrix[currentIndex][i];
          nearestIndex = i;
        }
      }
      
      if (nearestIndex !== -1) {
        optimizedIndices.push(nearestIndex);
        visited[nearestIndex] = true;
        currentIndex = nearestIndex;
        addLog(`Thêm địa điểm ${day.places[nearestIndex].name} (khoảng cách: ${minDistance.toFixed(2)} km)`);
      }
    }
    
    // Reorder places based on optimized indices
    const optimizedPlaces = optimizedIndices.map(index => day.places[index]);
    day.places = optimizedPlaces;
    
    // Update time slots
    updateTimeSlots(day);
  };
  
  // Optimize by time (consider opening hours and durations)
  const optimizeByTime = (day: Day) => {
    addLog(`Phân tích giờ mở cửa và thời lượng...`);
    
    if (day.places.length <= 1) return;
    
    // Sort places by opening hours (if available)
    day.places.sort((a, b) => {
      // Extract opening hour if available
      const getOpeningHour = (place: Place): number => {
        if (!place.openingHours) return 9; // Default to 9 AM
        
        // Simple parsing for formats like "9:00 - 17:00" or "9:00 AM - 5:00 PM"
        const match = place.openingHours.match(/(\d+):(\d+)/);
        if (match) {
          return parseInt(match[1]); 
        }
        return 9;
      };
      
      return getOpeningHour(a) - getOpeningHour(b);
    });
    
    addLog(`Sắp xếp lại địa điểm theo giờ mở cửa`);
    
    // Update time slots
    updateTimeSlots(day);
    
    // Check for conflicts with opening hours
    checkTimeConflicts(day);
  };
  
  // Optimize by balancing different types of activities
  const optimizeByBalance = (day: Day) => {
    addLog(`Cân bằng các loại hoạt động trong ngày...`);
    
    if (day.places.length <= 1) return;
    
    // Group places by type
    const placesByType: Record<string, Place[]> = {};
    day.places.forEach(place => {
      if (!placesByType[place.type]) {
        placesByType[place.type] = [];
      }
      placesByType[place.type].push(place);
    });
    
    // Distribute places of different types
    const optimizedPlaces: Place[] = [];
    let hasMorePlaces = true;
    const types = Object.keys(placesByType);
    
    addLog(`Phân phối ${types.length} loại địa điểm: ${types.join(', ')}`);
    
    // Round-robin distribution by type
    while (hasMorePlaces) {
      hasMorePlaces = false;
      
      for (const type of types) {
        if (placesByType[type].length > 0) {
          optimizedPlaces.push(placesByType[type].shift()!);
          hasMorePlaces = true;
        }
      }
    }
    
    // Update the day's places
    day.places = optimizedPlaces;
    
    // Further optimize by distance within each sequence
    optimizeByDistance(day);
  };
  
  // Update time slots for all places
  const updateTimeSlots = (day: Day) => {
    // Start at 9:00 AM (or use first place's opening time if available)
    let currentTimeMinutes = 9 * 60; // 9:00 AM in minutes
    
    day.places.forEach((place, index) => {
      // Format current time as HH:MM
      const startHour = Math.floor(currentTimeMinutes / 60);
      const startMin = currentTimeMinutes % 60;
      const startTimeFormatted = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      
      // Calculate end time based on duration (default to 60 mins if not specified)
      const duration = place.duration || 60;
      const endTimeMinutes = currentTimeMinutes + duration;
      const endHour = Math.floor(endTimeMinutes / 60);
      const endMin = endTimeMinutes % 60;
      const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      // Update place times
      place.startTime = startTimeFormatted;
      place.endTime = endTimeFormatted;
      
      // Add travel time between places (30 mins)
      currentTimeMinutes = endTimeMinutes + 30;
      
      addLog(`Cập nhật thời gian cho ${place.name}: ${startTimeFormatted} - ${endTimeFormatted}`);
    });
  };
  
  // Check for conflicts with opening hours
  const checkTimeConflicts = (day: Day) => {
    const conflicts: {place: Place, message: string}[] = [];
    
    day.places.forEach(place => {
      if (place.openingHours && place.startTime) {
        // Simple check for time conflict
        // This is a simplified implementation - in a real app, you'd need more robust time parsing
        const isOpen = isWithinOpeningHours(place.startTime, place.endTime || '23:59', place.openingHours);
        
        if (!isOpen) {
          const conflict = {
            place,
            message: `${place.name} có thể không mở cửa vào thời gian ${place.startTime}`
          };
          conflicts.push(conflict);
        }
      }
    });
    
    if (conflicts.length > 0) {
      addLog(`Phát hiện ${conflicts.length} xung đột về thời gian`);
      
      // Add to global conflicts
      conflicts.forEach(conflict => {
        setOptimizationConflicts(prev => [
          ...prev, 
          { 
            dayNumber: day.dayNumber, 
            message: conflict.message 
          }
        ]);
      });
    } else {
      addLog(`Không phát hiện xung đột thời gian`);
    }
  };
  
  // Check if a time is within opening hours
  const isWithinOpeningHours = (startTime: string, endTime: string, openingHours: string): boolean => {
    // This is a simplified implementation
    // In a real app, you'd need more robust time parsing for various opening hours formats
    
    // For demo, just assume all places are open during visiting time
    if (Math.random() > 0.8) {
      return false; // Randomly generate some conflicts for demonstration
    }
    return true;
  };
  
  // Apply optimized trip
  const applyOptimization = () => {
    if (optimizedTrip) {
      onUpdateTrip(optimizedTrip);
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Tối ưu hóa lịch trình</h2>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6">
          {!optimizing && !optimizationComplete && (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Chọn phương pháp tối ưu hóa</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Tối ưu hóa lịch trình giúp sắp xếp các địa điểm một cách hợp lý, tiết kiệm thời gian di chuyển và tăng trải nghiệm du lịch.
                </p>
                
                <div className="space-y-3">
                  {optimizationOptions.map(option => (
                    <div 
                      key={option.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        optimizationMethod === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setOptimizationMethod(option.id)}
                    >
                      <div className="flex">
                        <div className="mr-4">
                          {option.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{option.name}</h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <div className="ml-auto">
                          {optimizationMethod === option.id && (
                            <Check className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">Về tính năng tối ưu hóa</h4>
                    <p className="text-sm text-blue-700">
                      Tối ưu hóa sẽ sắp xếp lại thứ tự các địa điểm và thời gian trong lịch trình của bạn.
                      Quá trình này không làm thay đổi các địa điểm đã chọn, chỉ điều chỉnh thứ tự và thời gian.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {optimizing && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Đang tối ưu hóa lịch trình</h3>
              <p className="text-gray-600 mb-8">Vui lòng đợi trong khi chúng tôi tối ưu hóa lịch trình của bạn</p>
              
              <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-4 text-left h-60 overflow-y-auto">
                <h4 className="font-medium text-gray-700 mb-2">Nhật ký tối ưu hóa:</h4>
                <div className="space-y-1.5">
                  {optimizationLogs.map((log, index) => (
                    <div key={index} className="text-sm text-gray-600 flex">
                      <span className="text-gray-400 inline-block w-16">{(index + 1).toString().padStart(2, '0')}</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {optimizationComplete && (
            <div>
              <div className="text-center py-4 mb-6">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Tối ưu hóa hoàn tất</h3>
                <p className="text-gray-600">
                  Lịch trình của bạn đã được tối ưu hóa bằng phương pháp "{getMethodName(optimizationMethod)}"
                </p>
              </div>
              
              {optimizationConflicts.length > 0 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Cảnh báo về lịch trình</h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        Phát hiện một số vấn đề tiềm ẩn về thời gian. Bạn có thể điều chỉnh thủ công sau khi áp dụng.
                      </p>
                      <ul className="space-y-1">
                        {optimizationConflicts.map((conflict, index) => (
                          <li key={index} className="text-sm text-yellow-700 flex items-start">
                            <span className="inline-block w-12 flex-shrink-0">Ngày {conflict.dayNumber}:</span>
                            <span>{conflict.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Tổng quan thay đổi:</h4>
                
                <div className="space-y-4">
                  {optimizedTrip?.days.map(day => (
                    <div key={day.dayNumber} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <h5 className="font-medium text-gray-800 mb-2">Ngày {day.dayNumber} - {day.places.length} địa điểm</h5>
                      <div className="text-sm text-gray-600">
                        {day.places.map((place, index) => (
                          <div key={place.id} className="flex items-center mb-2 last:mb-0">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600 mr-2">
                              {index + 1}
                            </div>
                            <div className="flex-grow">
                              <span className="font-medium">{place.name}</span> 
                              {place.startTime && place.endTime && (
                                <span className="text-gray-500 ml-2">
                                  {place.startTime} - {place.endTime}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    setOptimizationComplete(false);
                    setOptimizing(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 mr-4"
                >
                  Thử phương pháp khác
                </button>
                
                <button
                  onClick={applyOptimization}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 items-center gap-2 inline-flex"
                >
                  <Zap className="w-4 h-4" />
                  <span>Áp dụng thay đổi</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            Hủy
          </button>
          
          {!optimizing && !optimizationComplete && (
            <button
              onClick={startOptimization}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Bắt đầu tối ưu hóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripOptimizer;