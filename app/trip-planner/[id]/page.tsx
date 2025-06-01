// app/trip-planner/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { 
  Calendar, Clock, MapPin, ChevronLeft, Share, Edit, 
  Plus, Download, ArrowLeft, ArrowRight, MoreHorizontal,
  Save, Compass, Star, Users, DollarSign, Camera,
  Cloud, Sun, CloudRain, Zap, Heart, MessageCircle,
  Navigation, Coffee, Utensils, Building, Landmark,
  Thermometer, Droplets, Wind, Eye, CheckCircle2,
  AlertCircle, Info, Trash2, Settings, Filter,
  Search, SortAsc, Map, List, Grid, TrendingUp, 
  Award, Target, Sparkles, Timer, Route, Activity, 
  Globe, RefreshCw, Bell, Bookmark, ExternalLink, Building2, 
  ShoppingBag, Umbrella, Trees, Music2, ChevronDown,
  X
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EnhancedPlaceSearchPanel from '@/app/trip-planner/components/EnhancedPlaceSearchPanel';
import EnhancedTripOptimizer from '@/app/trip-planner/components/EnhancedTripOptimizer';

// Types
interface Photo {
  id: number;
  url: string;
  caption?: string;
  isPrimary: boolean;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  visitDate: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

interface Category {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}

interface City {
  id: number;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

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
  notes?: string;
  openingHours?: string;
  rating?: number;
  category?: Category;
  photos?: Photo[];
  reviews?: Review[];
  website?: string;
  contactInfo?: string;
  priceLevel?: number;
  avgDurationMinutes?: number;
  description?: string;
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
  city?: City;
  user?: {
    id: number;
    username: string;
    fullName?: string;
  };
  tags?: string[];
  estimatedBudget?: number;
  travelCompanions?: number;
}

// Weather icon mapping
const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
    case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />;
    case 'rain': return <CloudRain className="w-5 h-5 text-blue-500" />;
    case 'thunderstorm': return <Zap className="w-5 h-5 text-purple-500" />;
    default: return <Sun className="w-5 h-5 text-yellow-500" />;
  }
};

// Place type configuration with fallback for missing icons
const placeTypeConfig = {
  tourist_attraction: { icon: Landmark, color: 'bg-green-100 text-green-800', label: 'Địa điểm tham quan du lịch' },
  restaurant: { icon: Utensils, color: 'bg-red-100 text-red-800', label: 'Nhà hàng và quán ăn' },
  cafe: { icon: Coffee, color: 'bg-amber-100 text-amber-800', label: 'Quán cà phê' },
  hotel: { icon: Building2, color: 'bg-blue-100 text-blue-800', label: 'Khách sạn và nơi lưu trú' },
  shopping: { icon: ShoppingBag, color: 'bg-purple-100 text-purple-800', label: 'Trung tâm mua sắm và chợ' },
  museum: { icon: Building, color: 'bg-indigo-100 text-indigo-800', label: 'Bảo tàng và triển lãm' },
  beach: { icon: Umbrella, color: 'bg-cyan-100 text-cyan-800', label: 'Bãi biển' },
  nature: { icon: Trees, color: 'bg-emerald-100 text-emerald-800', label: 'Công viên và thiên nhiên' },
  entertainment: { icon: Music2, color: 'bg-pink-100 text-pink-800', label: 'Giải trí và vui chơi' }
};

// Helper function to get place type info with fallback
const getPlaceTypeInfo = (place: Place) => {
  // First try to use the category from the place
  if (place.category?.name) {
    const categoryName = place.category.name.toLowerCase().replace(/\s+/g, '_');
    if (categoryName in placeTypeConfig) {
      return placeTypeConfig[categoryName as keyof typeof placeTypeConfig];
    }
  }
  
  // Fallback to place.type
  if (place.type && place.type in placeTypeConfig) {
    return placeTypeConfig[place.type as keyof typeof placeTypeConfig];
  }
  
  // Default fallback
  return placeTypeConfig.tourist_attraction;
};

// Price level indicators
const getPriceLevelIndicator = (level?: number) => {
  if (!level) return null;
  return (
    <div className="flex items-center">
      {Array.from({ length: 4 }, (_, i) => (
        <DollarSign
          key={i}
          className={`w-3 h-3 ${i < level ? 'text-green-600' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

// Toast notification system
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transform transition-all duration-300 flex items-center space-x-2 ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  }`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

// Modern loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-4"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Compass className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Đang tải lịch trình</h3>
      <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
    </div>
  </div>
);

// Enhanced Status Badge Component
const StatusBadge = ({ status, isEditing, onStatusChange, quickChange = false }: {
  status: 'draft' | 'planned' | 'completed';
  isEditing: boolean;
  onStatusChange?: (status: 'draft' | 'planned' | 'completed') => void;
  quickChange?: boolean;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const getStatusConfig = (status: 'draft' | 'planned' | 'completed') => {
    switch (status) {
      case 'draft':
        return { 
          label: 'Bản nháp', 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Edit className="w-4 h-4" />
        };
      case 'planned':
        return { 
          label: 'Đã lên kế hoạch', 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Calendar className="w-4 h-4" />
        };
      case 'completed':
        return { 
          label: 'Đã hoàn thành', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle2 className="w-4 h-4" />
        };
    }
  };

  const config = getStatusConfig(status);
  
  if (!isEditing && !quickChange) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${config.color}`}>
        {config.icon}
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => !isUpdating && setShowDropdown(!showDropdown)}
        disabled={isUpdating}
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${config.color} hover:shadow-md transition-all disabled:opacity-50`}
      >
        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : config.icon}
        <span className="text-sm font-medium">{config.label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {showDropdown && !isUpdating && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
          {(['draft', 'planned', 'completed'] as const).map(statusOption => {
            const optionConfig = getStatusConfig(statusOption);
            return (
              <button
                key={statusOption}
                onClick={async () => {
                  if (quickChange && onStatusChange) {
                    setIsUpdating(true);
                    try {
                      await onStatusChange(statusOption);
                    } finally {
                      setIsUpdating(false);
                    }
                  } else {
                    onStatusChange?.(statusOption);
                  }
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                  statusOption === status ? 'bg-blue-50' : ''
                }`}
              >
                {optionConfig.icon}
                <span className="text-sm">{optionConfig.label}</span>
                {statusOption === status && (
                  <CheckCircle2 className="w-3 h-3 text-blue-600 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Enhanced place card component
const PlaceCard = ({ place, dayNumber, isEditing, onUpdate, onRemove }: {
  place: Place;
  dayNumber: number;
  isEditing: boolean;
  onUpdate: (placeId: string, dayNumber: number, field: string, value: any) => void;
  onRemove: (placeId: string, dayNumber: number) => void;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const typeConfig = getPlaceTypeInfo(place);
  const TypeIcon = typeConfig.icon;

  const photos = place.photos || [{ id: 1, url: place.image, isPrimary: true, caption: place.name }];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Gallery */}
      <div className="relative h-48 group">
        <Image
          src={photos[currentPhotoIndex]?.url || place.image}
          alt={place.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Photo navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : photos.length - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPhotoIndex(prev => prev < photos.length - 1 ? prev + 1 : 0)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick actions overlay */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Rating badge */}
        {place.rating && (
          <div className="absolute top-3 left-3 bg-white/95 rounded-full px-2 py-1 flex items-center space-x-1 backdrop-blur-sm">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-xs font-semibold text-gray-800">{place.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <div className={`p-1.5 rounded-lg ${typeConfig.color}`}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{place.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-1">{place.address}</p>
          </div>
          
          {isEditing && (
            <button
              onClick={() => onRemove(place.id, dayNumber)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Time and duration */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {isEditing ? (
            <>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Giờ bắt đầu</label>
                <input
                  type="time"
                  value={place.startTime || ''}
                  onChange={(e) => onUpdate(place.id, dayNumber, 'startTime', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Thời lượng (phút)</label>
                <input
                  type="number"
                  value={place.duration || ''}
                  onChange={(e) => onUpdate(place.id, dayNumber, 'duration', parseInt(e.target.value) || 0)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  min="15"
                  step="15"
                />
              </div>
            </>
          ) : (
            <>
              {place.startTime && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{place.startTime}</span>
                  {place.endTime && <span> - {place.endTime}</span>}
                </div>
              )}
              {place.duration && (
                <div className="flex items-center text-sm text-gray-600">
                  <Timer className="w-4 h-4 mr-1" />
                  <span>{Math.floor(place.duration / 60)}h {place.duration % 60}m</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {place.openingHours && (
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{place.openingHours}</span>
            </div>
          )}
          {place.priceLevel && getPriceLevelIndicator(place.priceLevel)}
        </div>

        {/* Notes */}
        {isEditing ? (
          <textarea
            placeholder="Ghi chú..."
            value={place.notes || ''}
            onChange={(e) => onUpdate(place.id, dayNumber, 'notes', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            rows={2}
          />
        ) : place.notes && (
          <div className="text-sm bg-blue-50 text-blue-800 p-2 rounded-lg">
            {place.notes}
          </div>
        )}

        {/* Quick links */}
        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
          {place.website && (
            <a 
              href={place.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-1 text-xs bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Website</span>
            </a>
          )}
          <button className="flex-1 flex items-center justify-center space-x-1 text-xs bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Navigation className="w-3 h-3" />
            <span>Chỉ đường</span>
          </button>
        </div>
      </div>

      {/* Detailed view modal overlay */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-64">
              <Image src={place.image} alt={place.name} fill className="object-cover" />
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{place.name}</h2>
              <p className="text-gray-600 mb-4">{place.description || place.address}</p>
              
              {place.reviews && place.reviews.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Đánh giá gần đây</h3>
                  <div className="space-y-3">
                    {place.reviews.slice(0, 3).map(review => (
                      <div key={review.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-800">
                                {review.user.username[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{review.user.username}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Weather card component
const WeatherCard = ({ weather, date }: { weather?: WeatherData; date: string }) => {
  if (!weather) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Thời tiết hôm nay</p>
            <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="text-gray-400">
            <Cloud className="w-8 h-8" />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Không có dữ liệu thời tiết</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-800">Thời tiết hôm nay</p>
          <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString('vi-VN')}</p>
        </div>
        {getWeatherIcon(weather.condition)}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Thermometer className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-sm font-semibold">{weather.temperatureHigh}°</span>
            <span className="text-sm text-gray-500 ml-1">/ {weather.temperatureLow}°</span>
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-600">
          <Droplets className="w-3 h-3 mr-1" />
          <span>{weather.precipitationChance}%</span>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function ModernTripDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'list'>('timeline');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
 
  // Load trip data with enhanced weather handling
  useEffect(() => {
    const loadTripData = async () => {
      try {
        setLoading(true);
        
        // Load trip data
        const tripData = await fetch(`/api/trips/${tripId}`)
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch trip');
            return response.json();
          });

        console.log('Trip data loaded:', tripData);

        // Load weather data for each day if city exists
        if (tripData.city?.id) {
          console.log(`Loading weather data for city: ${tripData.city.name} (ID: ${tripData.city.id})`);
          
          try {
            // Load individual weather data for each day
            const daysWithWeather = await Promise.all(
              tripData.days.map(async (day: any) => {
                try {
                  const weatherResponse = await fetch(
                    `/api/cities/${tripData.city!.id}/weather?date=${day.date}`
                  );
                  
                  if (weatherResponse.ok) {
                    const weatherData = await weatherResponse.json();
                    console.log(`Weather data loaded for ${day.date}:`, weatherData);
                    return { ...day, weather: weatherData };
                  } else {
                    console.warn(`Failed to load weather for ${day.date}:`, weatherResponse.status);
                    return day;
                  }
                } catch (error) {
                  console.error(`Error loading weather for day ${day.dayNumber}:`, error);
                  return day;
                }
              })
            );
            
            setTrip({ ...tripData, days: daysWithWeather });
          } catch (weatherError) {
            console.error('Error with weather data handling:', weatherError);
            setTrip(tripData);
          }
        } else {
          console.log('No city data available, loading trip without weather');
          setTrip(tripData);
        }
      } catch (error) {
        console.error('Error loading trip:', error);
        setTrip(null);
        showToast('Không thể tải dữ liệu lịch trình', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (tripId) {
      loadTripData();
    }
  }, [tripId]);

  // Handle status change
  const handleStatusChange = (newStatus: 'draft' | 'planned' | 'completed') => {
    if (!trip) return;
    setTrip({ ...trip, status: newStatus });
  };

  // Handle quick status change (with API call)
  const handleQuickStatusChange = async (newStatus: 'draft' | 'planned' | 'completed') => {
    if (!trip) return;
    
    try {
      const response = await fetch(`/api/trips/${tripId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setTrip({ ...trip, status: newStatus });
        showToast('Trạng thái đã được cập nhật!', 'success');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Lỗi khi cập nhật trạng thái!', 'error');
      throw error; // Re-throw to handle in StatusBadge
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination || !trip) return;
    
    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within same day
      const dayIndex = trip.days.findIndex(day => day.dayNumber === parseInt(source.droppableId));
      if (dayIndex === -1) return;
      
      const newPlaces = [...trip.days[dayIndex].places];
      const [removed] = newPlaces.splice(source.index, 1);
      newPlaces.splice(destination.index, 0, removed);
      
      const newDays = [...trip.days];
      newDays[dayIndex] = { ...newDays[dayIndex], places: newPlaces };
      
      setTrip({ ...trip, days: newDays });
    } else {
      // Moving between days
      const sourceDayIndex = trip.days.findIndex(day => day.dayNumber === parseInt(source.droppableId));
      const destDayIndex = trip.days.findIndex(day => day.dayNumber === parseInt(destination.droppableId));
      
      if (sourceDayIndex === -1 || destDayIndex === -1) return;
      
      const newSourcePlaces = [...trip.days[sourceDayIndex].places];
      const newDestPlaces = [...trip.days[destDayIndex].places];
      
      const [removed] = newSourcePlaces.splice(source.index, 1);
      newDestPlaces.splice(destination.index, 0, removed);
      
      const newDays = [...trip.days];
      newDays[sourceDayIndex] = { ...newDays[sourceDayIndex], places: newSourcePlaces };
      newDays[destDayIndex] = { ...newDays[destDayIndex], places: newDestPlaces };
      
      setTrip({ ...trip, days: newDays });
    }
  };

  // Handle place updates
  const handleUpdatePlace = (placeId: string, dayNumber: number, field: string, value: any) => {
    if (!trip) return;
    
    const dayIndex = trip.days.findIndex(day => day.dayNumber === dayNumber);
    if (dayIndex === -1) return;
    
    const placeIndex = trip.days[dayIndex].places.findIndex(p => p.id === placeId);
    if (placeIndex === -1) return;
    
    const newDays = [...trip.days];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      places: newDays[dayIndex].places.map((p, idx) => 
        idx === placeIndex ? { ...p, [field]: value } : p
      )
    };
    
    setTrip({ ...trip, days: newDays });
  };

  // Handle remove place
  const handleRemovePlace = (placeId: string, dayNumber: number) => {
    if (!trip) return;
    
    const dayIndex = trip.days.findIndex(day => day.dayNumber === dayNumber);
    if (dayIndex === -1) return;
    
    const newDays = [...trip.days];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      places: newDays[dayIndex].places.filter(p => p.id !== placeId)
    };
    
    setTrip({ ...trip, days: newDays });
  };

  // Handle save
  const handleSave = async () => {
    if (!trip) return;
    
    try {
      setSaving(true);
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip)
      });
      
      if (!response.ok) throw new Error('Failed to save trip');
      
      setIsEditing(false);
      showToast('Lịch trình đã được lưu thành công!', 'success');
    } catch (error) {
      console.error('Error saving trip:', error);
      showToast('Lỗi khi lưu lịch trình!', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle share
  const handleShare = (type: 'link' | 'pdf') => {
    if (type === 'link') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết!', 'success');
    } else {
      // Navigate to print page
      router.push(`/trip-planner/${tripId}/print`);
    }
    setShowShareModal(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy lịch trình</h2>
          <p className="text-gray-600 mb-6">Lịch trình bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/trip-planner"
            className="inline-flex items-center py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentDay = trip.days.find(day => day.dayNumber === activeDay);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <Link href="/trip-planner" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(trip.startDate).toLocaleDateString('vi-VN')} - {new Date(trip.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{trip.numDays} ngày</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View mode selector */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <Route className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Quick status change for non-editing mode */}
              {!isEditing && (
                <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
                  <StatusBadge 
                    status={trip.status} 
                    isEditing={false}
                    onStatusChange={handleQuickStatusChange}
                    quickChange={true}
                  />
                </div>
              )}

              {/* Action buttons */}
              <button
                onClick={() => setShowOptimizerModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                title="Tối ưu hóa lịch trình"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Share className="w-5 h-5" />
              </button>
              
              <Link
                href={`/trip-planner/${tripId}/print`}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Download className="w-5 h-5" />
              </Link>
              
              {isEditing ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Trip Hero Section */}
      {trip.city?.imageUrl && (
        <div className="relative h-64 lg:h-80 overflow-hidden">
          <Image
            src={trip.city.imageUrl}
            alt={trip.destination}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">{trip.destination}</h2>
              {trip.description && (
                <p className="text-white/90 text-lg max-w-2xl">{trip.description}</p>
              )}
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center text-white/80">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{trip.travelCompanions || 1} người</span>
                </div>
                {trip.estimatedBudget && (
                  <div className="flex items-center text-white/80">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span>{trip.estimatedBudget.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
                <div className="flex items-center text-white/80">
                  <Sparkles className="w-5 h-5 mr-2" />
                  <StatusBadge 
                    status={trip.status} 
                    isEditing={isEditing}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Days Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Lịch trình theo ngày
                </h3>
              </div>
              <div className="p-2">
                {trip.days.map(day => (
                  <button
                    key={day.dayNumber}
                    className={`w-full flex items-center justify-between p-3 text-left text-sm rounded-xl transition-all mb-2 ${
                      activeDay === day.dayNumber
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveDay(day.dayNumber)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        activeDay === day.dayNumber ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {day.dayNumber}
                      </div>
                      <div>
                        <div className="font-medium">Ngày {day.dayNumber}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-100 text-gray-700 text-xs rounded-full py-1 px-2">
                        {day.places.length}
                      </span>
                      {day.weather && (
                        <div className="flex items-center">
                          {getWeatherIcon(day.weather.condition)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weather for active day */}
            {currentDay && (
              <WeatherCard weather={currentDay.weather} date={currentDay.date} />
            )}

            {/* Trip Statistics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Thống kê chuyến đi
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tổng số ngày</span>
                  <span className="font-semibold">{trip.numDays}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số địa điểm</span>
                  <span className="font-semibold">{trip.days.reduce((sum, day) => sum + day.places.length, 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trung bình/ngày</span>
                  <span className="font-semibold">{(trip.days.reduce((sum, day) => sum + day.places.length, 0) / trip.numDays).toFixed(1)}</span>
                </div>
                
                {/* Status display in statistics */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <StatusBadge 
                    status={trip.status} 
                    isEditing={false}
                  />
                </div>
                
                {trip.estimatedBudget && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ngân sách</span>
                    <span className="font-semibold">{trip.estimatedBudget.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {currentDay && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Day Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Ngày {currentDay.dayNumber}</h2>
                      <p className="text-blue-100">{new Date(currentDay.date).toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{currentDay.places.length}</div>
                      <div className="text-sm text-blue-100">địa điểm</div>
                    </div>
                  </div>
                </div>

                {/* Places Content */}
                <div className="p-6">
                  {currentDay.places.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có địa điểm nào</h3>
                      <p className="text-gray-600 mb-6">Thêm địa điểm để bắt đầu lên kế hoạch cho ngày này</p>
                      <button
                        onClick={() => setShowAddPlaceModal(true)}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        <span>Thêm địa điểm</span>
                      </button>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId={currentDay.dayNumber.toString()}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-6 ${
                              viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0' : 
                              viewMode === 'list' ? 'space-y-3' : 'space-y-6'
                            }`}
                          >
                            {currentDay.places.map((place, index) => (
                              <Draggable
                                key={place.id}
                                draggableId={place.id}
                                index={index}
                                isDragDisabled={!isEditing}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`transition-all duration-200 ${
                                      snapshot.isDragging ? 'scale-105 shadow-xl' : ''
                                    }`}
                                  >
                                    <PlaceCard
                                      place={place}
                                      dayNumber={currentDay.dayNumber}
                                      isEditing={isEditing}
                                      onUpdate={handleUpdatePlace}
                                      onRemove={handleRemovePlace}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {isEditing && (
                              <div className="flex justify-center pt-6">
                                <button
                                  onClick={() => setShowAddPlaceModal(true)}
                                  className="inline-flex items-center px-6 py-3 bg-dashed border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                >
                                  <Plus className="w-5 h-5 mr-2" />
                                  <span>Thêm địa điểm mới</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Place Modal */}
      {showAddPlaceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh]">
            <EnhancedPlaceSearchPanel
              onAddPlace={(place, dayNumber) => {
                // Find the day and add the place
                const dayIndex = trip!.days.findIndex(day => day.dayNumber === dayNumber);
                if (dayIndex !== -1) {
                  const newDays = [...trip!.days];
                  newDays[dayIndex] = {
                    ...newDays[dayIndex],
                    places: [...newDays[dayIndex].places, place]
                  };
                  setTrip({ ...trip!, days: newDays });
                  showToast('Đã thêm địa điểm thành công!', 'success');
                }
                setShowAddPlaceModal(false);
              }}
              currentDayNumber={activeDay}
              allDays={trip.days.map(day => day.dayNumber)}
              cityId={trip.city?.id}
              onClose={() => setShowAddPlaceModal(false)}
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Chia sẻ lịch trình</h2>
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                onClick={() => setShowShareModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => handleShare('link')}
                className="w-full flex items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Share className="w-6 h-6 text-blue-600 mr-4" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Sao chép liên kết</h3>
                  <p className="text-sm text-gray-500">Chia sẻ qua liên kết công khai</p>
                </div>
              </button>
              
              <button 
                onClick={() => handleShare('pdf')}
                className="w-full flex items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Download className="w-6 h-6 text-green-600 mr-4" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Tải xuống PDF</h3>
                  <p className="text-sm text-gray-500">Lưu lịch trình dưới dạng PDF</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Optimizer Modal */}
      {showOptimizerModal && trip && (
        <EnhancedTripOptimizer
          trip={trip}
          onUpdateTrip={(updatedTrip) => {
            setTrip(updatedTrip);
            setShowOptimizerModal(false);
            showToast('Lịch trình đã được tối ưu hóa!', 'success');
          }}
          onClose={() => setShowOptimizerModal(false)}
        />
      )}
    </div>
  );
}