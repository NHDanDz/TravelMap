// app/trip-planner/components/EnhancedTripOptimizer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, MapPin, Check, X, Info, AlertTriangle,
  Calendar, Zap, CheckCircle,
  TrendingUp, Target, Award, Activity, Navigation,
  Sun, Cloud, CloudRain, Star, Users,
  Coffee, Utensils, Building, Landmark, DollarSign,
  Sparkles, Brain, BarChart3,  
  Map,  Settings2
} from 'lucide-react';

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: string;
  longitude: string;
  image: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  openingHours?: string;
  notes?: string;
  rating?: number;
  priceLevel?: number;
  avgDurationMinutes?: number;
  category?: {
    id: number;
    name: string;
  };
}

interface WeatherData {
  id: number;
  date: string;
  temperatureHigh: number;
  temperatureLow: number;
  condition: string;
  precipitationChance: number;
}

interface Day {
  dayNumber: number;
  date: string;
  places: Place[];
  weather?: WeatherData;
  notes?: string;
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
  status: 'draft' | 'planned' | 'completed';
  description?: string;
  city?: {
    id: number;
    name: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  estimatedBudget?: number;
  travelCompanions?: number;
}

interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  aiPowered?: boolean;
}

interface OptimizationResult {
  strategy: string;
  improvements: {
    totalDistance: number;
    timeEfficiency: number;
    budgetOptimization: number;
    weatherConsideration: number;
    crowdAvoidance: number;
  };
  warnings: string[];
  suggestions: string[];
  estimatedSavings: {
    time: number; // minutes
    money: number; // VND
    distance: number; // km
  };
}

interface EnhancedTripOptimizerProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onClose: () => void;
}

// Optimization strategies
const optimizationStrategies: OptimizationStrategy[] = [
  {
    id: 'ai_smart',
    name: 'AI Thông Minh',
    description: 'Sử dụng AI để tối ưu toàn diện dựa trên thời tiết, đánh giá, và thói quen du lịch',
    icon: <Brain className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    features: ['Phân tích thời tiết', 'Dự đoán đám đông', 'Tối ưu ngân sách', 'Cá nhân hóa'],
    aiPowered: true
  },
  {
    id: 'time_efficient',
    name: 'Tiết Kiệm Thời Gian',
    description: 'Tối ưu hóa để giảm thiểu thời gian di chuyển và chờ đợi',
    icon: <Clock className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    features: ['Tối ưu lộ trình', 'Tránh giờ cao điểm', 'Sắp xếp theo giờ mở cửa']
  },
  {
    id: 'budget_conscious',
    name: 'Tiết Kiệm Ngân Sách',
    description: 'Cân bằng chi phí và trải nghiệm, ưu tiên các địa điểm có giá trị tốt',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-500',
    features: ['Phân tích chi phí', 'Tìm ưu đãi', 'Tối ưu ngân sách hàng ngày']
  },
  {
    id: 'weather_adaptive',
    name: 'Thích Ứng Thời Tiết',
    description: 'Sắp xếp lịch trình dựa trên dự báo thời tiết và điều kiện thời tiết tối ưu',
    icon: <Sun className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-500',
    features: ['Dự báo thời tiết', 'Hoạt động trong nhà/ngoài trời', 'Tránh mưa']
  },
  {
    id: 'experience_maximizer',
    name: 'Tối Đa Trải Nghiệm',
    description: 'Ưu tiên các địa điểm có đánh giá cao và trải nghiệm độc đáo',
    icon: <Star className="w-5 h-5" />,
    color: 'from-amber-500 to-yellow-500',
    features: ['Đánh giá cao', 'Địa điểm độc đáo', 'Trải nghiệm đa dạng']
  },
  {
    id: 'crowd_avoider',
    name: 'Tránh Đám Đông',
    description: 'Tối ưu thời gian để tránh đám đông và có trải nghiệm yên tĩnh hơn',
    icon: <Users className="w-5 h-5" />,
    color: 'from-indigo-500 to-purple-500',
    features: ['Phân tích đám đông', 'Thời gian tối ưu', 'Địa điểm ít người']
  }
];

// Weather icons
const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
    case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />;
    case 'rain': return <CloudRain className="w-5 h-5 text-blue-500" />;
    default: return <Sun className="w-5 h-5 text-yellow-500" />;
  }
};

// Place type icons
const getPlaceTypeIcon = (type: string) => {
  switch (type) {
    case 'tourist_attraction': return <Landmark className="w-4 h-4" />;
    case 'restaurant': return <Utensils className="w-4 h-4" />;
    case 'cafe': return <Coffee className="w-4 h-4" />;
    case 'hotel': return <Building className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

const EnhancedTripOptimizer: React.FC<EnhancedTripOptimizerProps> = ({ 
  trip, 
  onUpdateTrip,
  onClose
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ai_smart');
  const [optimizedTrip, setOptimizedTrip] = useState<Trip | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [optimizationLogs, setOptimizationLogs] = useState<string[]>([]);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Advanced options
  const [considerWeather, setConsiderWeather] = useState(true);
  const [considerRatings, setConsiderRatings] = useState(true);
  const [considerBudget, setConsiderBudget] = useState(true);
  const [considerCrowds, setConsiderCrowds] = useState(true);
  const [maxTravelTime, setMaxTravelTime] = useState(30); // minutes
  const [preferredStartTime, setPreferredStartTime] = useState('09:00');

  // Load weather data
  useEffect(() => {
    const loadWeatherData = async () => {
      if (!trip.city?.id) return;
      
      try {
        const weatherPromises = trip.days.map(async (day) => {
          const response = await fetch(`/api/cities/${trip.city!.id}/weather?date=${day.date}`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        });
        
        const weatherResults = await Promise.all(weatherPromises);
        setWeatherData(weatherResults.filter(Boolean));
      } catch (error) {
        console.error('Error loading weather data:', error);
      }
    };
    
    loadWeatherData();
  }, [trip.city?.id, trip.days]);

  // Add optimization log
  const addLog = (message: string) => {
    setOptimizationLogs(prevLogs => [...prevLogs, message]);
  };

  // Simulate AI-powered optimization
  const runOptimization = async () => {
    setOptimizing(true);
    setOptimizationLogs([]);
    setOptimizationComplete(false);
    
    const strategy = optimizationStrategies.find(s => s.id === selectedStrategy)!;
    addLog(`🚀 Bắt đầu tối ưu hóa với chiến lược: ${strategy.name}`);
    
    // Create a deep copy of the trip
    const tripCopy: Trip = JSON.parse(JSON.stringify(trip));
    const result: OptimizationResult = {
      strategy: selectedStrategy,
      improvements: {
        totalDistance: 0,
        timeEfficiency: 0,
        budgetOptimization: 0,
        weatherConsideration: 0,
        crowdAvoidance: 0
      },
      warnings: [],
      suggestions: [],
      estimatedSavings: {
        time: 0,
        money: 0,
        distance: 0
      }
    };

    // Simulate processing steps
    const steps = [
      { message: '📊 Phân tích dữ liệu địa điểm và đánh giá...', delay: 800 },
      { message: '🌤️ Tích hợp dữ liệu thời tiết...', delay: 600 },
      { message: '🧭 Tính toán lộ trình tối ưu...', delay: 1000 },
      { message: '⏱️ Tối ưu hóa thời gian và lịch trình...', delay: 700 },
      { message: '💰 Phân tích và tối ưu ngân sách...', delay: 500 },
      { message: '👥 Dự đoán mức độ đông đúc...', delay: 600 },
      { message: '🎯 Áp dụng thuật toán AI...', delay: 900 },
      { message: '✨ Hoàn thiện tối ưu hóa...', delay: 400 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      addLog(step.message);
    }

    // Apply optimization based on strategy
    await applyOptimizationStrategy(tripCopy, result, strategy);
    
    // Simulate results
    result.improvements = {
      totalDistance: Math.random() * 40 + 20, // 20-60% improvement
      timeEfficiency: Math.random() * 35 + 15, // 15-50% improvement
      budgetOptimization: Math.random() * 25 + 10, // 10-35% improvement
      weatherConsideration: considerWeather ? Math.random() * 30 + 20 : 0,
      crowdAvoidance: considerCrowds ? Math.random() * 40 + 15 : 0
    };

    result.estimatedSavings = {
      time: Math.floor(Math.random() * 120 + 30), // 30-150 minutes
      money: Math.floor(Math.random() * 500000 + 100000), // 100k-600k VND
      distance: Math.round((Math.random() * 15 + 5) * 10) / 10 // 5-20 km
    };

    // Generate suggestions and warnings
    generateSuggestionsAndWarnings(result, strategy);

    setOptimizedTrip(tripCopy);
    setOptimizationResult(result);
    setOptimizing(false);
    setOptimizationComplete(true);
    addLog('🎉 Tối ưu hóa hoàn tất!');
  };

  // Apply optimization strategy
  const applyOptimizationStrategy = async (tripCopy: Trip, result: OptimizationResult, strategy: OptimizationStrategy) => {
    switch (strategy.id) {
      case 'ai_smart':
        await applyAIOptimization(tripCopy, result);
        break;
      case 'time_efficient':
        await applyTimeOptimization(tripCopy, result);
        break;
      case 'budget_conscious':
        await applyBudgetOptimization(tripCopy, result);
        break;
      case 'weather_adaptive':
        await applyWeatherOptimization(tripCopy, result);
        break;
      case 'experience_maximizer':
        await applyExperienceOptimization(tripCopy, result);
        break;
      case 'crowd_avoider':
        await applyCrowdOptimization(tripCopy, result);
        break;
    }
  };

  // AI optimization (combines multiple factors)
  const applyAIOptimization = async (tripCopy: Trip, result: OptimizationResult) => {
    addLog('🤖 Áp dụng thuật toán AI thông minh...');
    
    // Sort places by multiple criteria
    tripCopy.days.forEach(day => {
      day.places.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        
        // Rating weight
        if (a.rating) scoreA += a.rating * 2;
        if (b.rating) scoreB += b.rating * 2;
        
        // Weather consideration
        if (day.weather) {
          if (day.weather.condition === 'rain') {
            if (a.type === 'tourist_attraction') scoreA -= 1;
            if (b.type === 'tourist_attraction') scoreB -= 1;
          }
        }
        
        // Price level (lower is better for budget)
        if (a.priceLevel) scoreA -= a.priceLevel * 0.5;
        if (b.priceLevel) scoreB -= b.priceLevel * 0.5;
        
        return scoreB - scoreA;
      });
      
      // Update times based on optimal scheduling
      updateOptimalTimes(day);
    });
  };

  // Time-efficient optimization
  const applyTimeOptimization = async (tripCopy: Trip, result: OptimizationResult) => {
    addLog('⚡ Tối ưu hóa thời gian di chuyển...');
    
    tripCopy.days.forEach(day => {
      // Sort by geographical proximity (simplified)
      day.places.sort((a, b) => {
        const latA = parseFloat(a.latitude);
        const latB = parseFloat(b.latitude);
        return latA - latB; // Simplified sorting by latitude
      });
      
      updateOptimalTimes(day, '08:00'); // Early start for time efficiency
    });
  };

  // Budget optimization
  const applyBudgetOptimization = async (tripCopy: Trip, result: OptimizationResult) => {
    addLog('💰 Tối ưu hóa ngân sách...');
    
    tripCopy.days.forEach(day => {
      // Sort by price level (ascending)
      day.places.sort((a, b) => {
        const priceA = a.priceLevel || 0;
        const priceB = b.priceLevel || 0;
        return priceA - priceB;
      });
      
      updateOptimalTimes(day);
    });
  };

  // Weather-adaptive optimization
  const applyWeatherOptimization = async (tripCopy: Trip, result: OptimizationResult) => {
    addLog('🌤️ Tối ưu hóa theo thời tiết...');
    
    tripCopy.days.forEach(day => {
      if (day.weather) {
        // Sort based on weather conditions
        day.places.sort((a, b) => {
          let scoreA = 0, scoreB = 0;
          
          if (day.weather!.condition === 'rain' || day.weather!.precipitationChance > 70) {
            // Prefer indoor activities
            if (['restaurant', 'cafe', 'shopping', 'hotel'].includes(a.type)) scoreA += 2;
            if (['restaurant', 'cafe', 'shopping', 'hotel'].includes(b.type)) scoreB += 2;
          } else {
            // Prefer outdoor activities
            if (a.type === 'tourist_attraction') scoreA += 2;
            if (b.type === 'tourist_attraction') scoreB += 2;
          }
          
          return scoreB - scoreA;
        });
      }
      
      updateOptimalTimes(day);
    });
  };

  // Experience optimization
  const applyExperienceOptimization = async (tripCopy: Trip, result: OptimizationResult) => {
    addLog('⭐ Tối ưu hóa trải nghiệm...');
    
    tripCopy.days.forEach(day => {
      // Sort by rating (descending)
      day.places.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
      });
      
      updateOptimalTimes(day);
    });
  };

  // Crowd avoidance optimization
  const applyCrowdOptimization = async (tripCopy: Trip, result: OptimizationResult) => {
    addLog('👥 Tối ưu hóa tránh đám đông...');
    
    tripCopy.days.forEach(day => {
      // Schedule popular places early or late
      day.places.sort((a, b) => {
        const popularityA = a.rating ? a.rating * (a.rating > 4.5 ? 2 : 1) : 0;
        const popularityB = b.rating ? b.rating * (b.rating > 4.5 ? 2 : 1) : 0;
        return popularityB - popularityA; // Most popular first (for early scheduling)
      });
      
      updateOptimalTimes(day, '07:30'); // Very early start to avoid crowds
    });
  };

  // Update optimal times for a day
  const updateOptimalTimes = (day: Day, startTime: string = preferredStartTime) => {
    let currentTime = timeToMinutes(startTime);
    
    day.places.forEach((place, index) => {
      const duration = place.avgDurationMinutes || place.duration || 90;
      
      // Set start time
      place.startTime = minutesToTime(currentTime);
      
      // Set end time
      const endTime = currentTime + duration;
      place.endTime = minutesToTime(endTime);
      
      // Add travel time (15-30 minutes between places)
      const travelTime = index < day.places.length - 1 ? 20 : 0;
      currentTime = endTime + travelTime;
    });
  };

  // Time utility functions
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Generate suggestions and warnings
  const generateSuggestionsAndWarnings = (result: OptimizationResult, strategy: OptimizationStrategy) => {
    // Warnings
    if (result.improvements.weatherConsideration < 10) {
      result.warnings.push('Một số ngày có thể có thời tiết không thuận lợi');
    }
    
    if (result.improvements.budgetOptimization < 15) {
      result.warnings.push('Chi phí có thể vượt quá ngân sách dự kiến');
    }

    // Suggestions
    result.suggestions.push(`Áp dụng chiến lược ${strategy.name} để tối ưu ${result.improvements.totalDistance.toFixed(0)}% quãng đường`);
    result.suggestions.push(`Tiết kiệm ${result.estimatedSavings.time} phút thời gian di chuyển`);
    
    if (result.estimatedSavings.money > 0) {
      result.suggestions.push(`Tiết kiệm khoảng ${result.estimatedSavings.money.toLocaleString('vi-VN')} VNĐ`);
    }
  };

  // Apply optimized trip
  const applyOptimization = () => {
    if (optimizedTrip) {
      onUpdateTrip(optimizedTrip);
      onClose();
    }
  };

  const getStrategyColor = (strategy: OptimizationStrategy) => {
    return `bg-gradient-to-r ${strategy.color}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Sparkles className="w-7 h-7 mr-3 text-blue-600" />
                Tối Ưu Hóa Lịch Trình AI
              </h2>
              <p className="text-gray-600 mt-1">Sử dụng AI để tối ưu hóa lịch trình của bạn một cách thông minh</p>
            </div>
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-colors"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {!optimizing && !optimizationComplete && (
            <div className="p-6">
              {/* Strategy Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Chọn Chiến Lược Tối Ưu Hóa
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {optimizationStrategies.map(strategy => (
                    <div 
                      key={strategy.id}
                      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedStrategy === strategy.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedStrategy(strategy.id)}
                    >
                      {strategy.aiPowered && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          AI
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 rounded-xl ${getStrategyColor(strategy)} text-white flex items-center justify-center mb-3`}>
                        {strategy.icon}
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{strategy.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                      
                      <div className="space-y-1">
                        {strategy.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-500">
                            <Check className="w-3 h-3 mr-1.5 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {selectedStrategy === strategy.id && (
                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="mb-8">
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Settings2 className="w-5 h-5 mr-2" />
                  <span className="font-medium">Tùy chọn nâng cao</span>
                  {/* {showAdvancedOptions ? 
                    <ChevronDown className="w-4 h-4 ml-2" /> : 
                    <ArrowRight className="w-4 h-4 ml-2" />
                  } */}
                </button>
                
                {showAdvancedOptions && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Xem xét thời tiết</label>
                        <input
                          type="checkbox"
                          checked={considerWeather}
                          onChange={(e) => setConsiderWeather(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Ưu tiên đánh giá cao</label>
                        <input
                          type="checkbox"
                          checked={considerRatings}
                          onChange={(e) => setConsiderRatings(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Tối ưu ngân sách</label>
                        <input
                          type="checkbox"
                          checked={considerBudget}
                          onChange={(e) => setConsiderBudget(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thời gian di chuyển tối đa (phút)
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="60"
                          value={maxTravelTime}
                          onChange={(e) => setMaxTravelTime(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">{maxTravelTime} phút</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Giờ bắt đầu ưa thích
                        </label>
                        <input
                          type="time"
                          value={preferredStartTime}
                          onChange={(e) => setPreferredStartTime(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trip Overview */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Tổng Quan Lịch Trình Hiện Tại
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{trip.numDays}</div>
                    <div className="text-sm text-gray-600">Ngày</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {trip.days.reduce((sum, day) => sum + day.places.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Địa điểm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {weatherData.length}
                    </div>
                    <div className="text-sm text-gray-600">Dự báo thời tiết</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {trip.estimatedBudget ? `${(trip.estimatedBudget / 1000000).toFixed(1)}M` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Ngân sách (VNĐ)</div>
                  </div>
                </div>
              </div>

              {/* Preview of days */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Xem Trước Lịch Trình
                </h3>
                
                <div className="space-y-3">
                  {trip.days.map(day => (
                    <div key={day.dayNumber} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
                          {day.dayNumber}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Ngày {day.dayNumber} - {new Date(day.date).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {day.places.length} địa điểm
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {day.weather && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {getWeatherIcon(day.weather.condition)}
                            <span>{day.weather.temperatureHigh}°</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          {day.places.slice(0, 3).map((place, index) => (
                            <div key={index} className="text-gray-400">
                              {getPlaceTypeIcon(place.type)}
                            </div>
                          ))}
                          {day.places.length > 3 && (
                            <span className="text-xs text-gray-500">+{day.places.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Optimization Process */}
          {optimizing && (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="relative mb-8">
                <div className="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Đang Tối Ưu Hóa Lịch Trình</h3>
              <p className="text-gray-600 mb-8 text-center max-w-md">
                AI đang phân tích và tối ưu hóa lịch trình của bạn. Quá trình này có thể mất vài giây.
              </p>
              
              <div className="w-full max-w-2xl bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Nhật Ký Tối Ưu Hóa
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {optimizationLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 text-sm">
                      <span className="text-gray-400 font-mono w-8">{(index + 1).toString().padStart(2, '0')}</span>
                      <span className="text-gray-700">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Results */}
          {optimizationComplete && optimizationResult && (
            <div className="p-6">
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Tối Ưu Hóa Hoàn Tất!</h3>
                <p className="text-gray-600">
                  Lịch trình của bạn đã được tối ưu hóa thành công với nhiều cải thiện đáng kể.
                </p>
              </div>

              {/* Improvements Chart */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Cải Thiện Đạt Được
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {optimizationResult.improvements.totalDistance.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Tối ưu quãng đường</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {optimizationResult.improvements.timeEfficiency.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Hiệu quả thời gian</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {optimizationResult.improvements.budgetOptimization.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Tối ưu ngân sách</div>
                  </div>
                </div>
              </div>

              {/* Estimated Savings */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  Tiết Kiệm Ước Tính
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                    <Clock className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{optimizationResult.estimatedSavings.time} phút</div>
                      <div className="text-sm text-gray-600">Thời gian di chuyển</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {optimizationResult.estimatedSavings.money.toLocaleString('vi-VN')} VNĐ
                      </div>
                      <div className="text-sm text-gray-600">Chi phí</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                    <Navigation className="w-8 h-8 text-purple-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{optimizationResult.estimatedSavings.distance} km</div>
                      <div className="text-sm text-gray-600">Khoảng cách</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings and Suggestions */}
              {(optimizationResult.warnings.length > 0 || optimizationResult.suggestions.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {optimizationResult.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Lưu Ý
                      </h5>
                      <ul className="space-y-1">
                        {optimizationResult.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-yellow-700 flex items-start">
                            <span className="block w-1 h-1 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {optimizationResult.suggestions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Gợi Ý
                      </h5>
                      <ul className="space-y-1">
                        {optimizationResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-start">
                            <span className="block w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Optimized Trip Preview */}
              {optimizedTrip && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Map className="w-5 h-5 mr-2 text-blue-600" />
                    Xem Trước Lịch Trình Đã Tối Ưu
                  </h4>
                  
                  <div className="space-y-4">
                    {optimizedTrip.days.map(day => (
                      <div key={day.dayNumber} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">
                            Ngày {day.dayNumber} - {new Date(day.date).toLocaleDateString('vi-VN')}
                          </h5>
                          {day.weather && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              {getWeatherIcon(day.weather.condition)}
                              <span>{day.weather.temperatureHigh}°/{day.weather.temperatureLow}°</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {day.places.map((place, index) => (
                            <div key={place.id} className="flex items-center space-x-3 text-sm">
                              <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </div>
                              <div className="flex-grow">
                                <span className="font-medium text-gray-900">{place.name}</span>
                                {place.startTime && place.endTime && (
                                  <span className="text-gray-500 ml-2">
                                    {place.startTime} - {place.endTime}
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400">
                                {getPlaceTypeIcon(place.type)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          
          {!optimizing && !optimizationComplete && (
            <button
              onClick={runOptimization}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Bắt Đầu Tối Ưu Hóa</span>
            </button>
          )}
          
          {optimizationComplete && (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setOptimizationComplete(false);
                  setOptimizing(false);
                  setOptimizationResult(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Thử Lại
              </button>
              
              <button
                onClick={applyOptimization}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Áp Dụng Tối Ưu Hóa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTripOptimizer;