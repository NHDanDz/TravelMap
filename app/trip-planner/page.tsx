// app/trip-planner/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, MapPin, Plus, Trash2, Clock, Edit, Star, 
  Save, Share, Download, MoveVertical, ChevronDown, 
  ChevronUp, Compass, ArrowRight, Coffee, Hotel, 
  Utensils, Landmark
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Interface for Place type
interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  image: string;
  rating: number;
  duration?: number; // in minutes
  notes?: string;
}

// Interface for Day type
interface Day {
  id: string;
  date: string;
  places: Place[];
}

const TripPlannerPage = () => {
  const [tripName, setTripName] = useState('Chuyến đi Đà Lạt');
  const [startDate, setStartDate] = useState('2025-06-15');
  const [endDate, setEndDate] = useState('2025-06-20');
  const [days, setDays] = useState<Day[]>([]);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editingTripDetails, setEditingTripDetails] = useState(false);
  
  // Mock search results
  const searchResults: Place[] = [
    {
      id: 'p1',
      name: 'Hồ Xuân Hương',
      type: 'tourist_attraction',
      address: 'Đường Trần Quốc Toản, Phường 1, Đà Lạt',
      image: '/images/place-1.jpg',
      rating: 4.6
    },
    {
      id: 'p2',
      name: 'Nhà thờ Con Gà',
      type: 'tourist_attraction',
      address: '15 Trần Phú, Phường 3, Đà Lạt',
      image: '/images/place-2.jpg',
      rating: 4.5
    },
    {
      id: 'p3',
      name: 'Quán Cà phê Túi Mơ To',
      type: 'cafe',
      address: '10 Phan Đình Phùng, Phường 1, Đà Lạt',
      image: '/images/place-3.jpg',
      rating: 4.3
    },
    {
      id: 'p4',
      name: 'Nhà hàng Vườn Tiên',
      type: 'restaurant',
      address: '65 Phan Đình Phùng, Phường 2, Đà Lạt',
      image: '/images/place-4.jpg',
      rating: 4.7
    },
    {
      id: 'p5',
      name: 'La Vie En Rose Hotel',
      type: 'hotel',
      address: '18 Nguyễn Chí Thanh, Phường 1, Đà Lạt',
      image: '/images/place-5.jpg',
      rating: 4.8
    }
  ];
  
  // Initialize days based on trip dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const newDays: Day[] = [];
      
      for (let i = 0; i < daysDiff; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        
        newDays.push({
          id: `day-${i + 1}`,
          date: currentDate.toISOString().split('T')[0],
          places: i === 0 ? [
            {
              id: 'p5',
              name: 'La Vie En Rose Hotel',
              type: 'hotel',
              address: '18 Nguyễn Chí Thanh, Phường 1, Đà Lạt',
              image: '/images/place-5.jpg',
              rating: 4.8,
              duration: 60,
              notes: 'Check-in lúc 14:00'
            }
          ] : []
        });
      }
      
      setDays(newDays);
      if (newDays.length > 0) {
        setActiveDayId(newDays[0].id);
      }
    }
  }, [startDate, endDate]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };
  
  const handleAddPlace = (place: Place) => {
    if (!activeDayId) return;
    
    setDays(prevDays => {
      return prevDays.map(day => {
        if (day.id === activeDayId) {
          return {
            ...day,
            places: [...day.places, { ...place, duration: 120, notes: '' }]
          };
        }
        return day;
      });
    });
    
    setShowSearchResults(false);
    setSearchQuery('');
  };
  
  const handleRemovePlace = (dayId: string, placeId: string) => {
    setDays(prevDays => {
      return prevDays.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            places: day.places.filter(place => place.id !== placeId)
          };
        }
        return day;
      });
    });
  };
  
  const onDragEnd = (result: any) => {
    const { destination, source } = result;
    
    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Reordering in the same day
    if (destination.droppableId === source.droppableId) {
      setDays(prevDays => {
        return prevDays.map(day => {
          if (day.id === source.droppableId) {
            const newPlaces = Array.from(day.places);
            const [removed] = newPlaces.splice(source.index, 1);
            newPlaces.splice(destination.index, 0, removed);
            
            return {
              ...day,
              places: newPlaces
            };
          }
          return day;
        });
      });
    } else {
      // Moving from one day to another
      setDays(prevDays => {
        const sourceDay = prevDays.find(day => day.id === source.droppableId);
        const destDay = prevDays.find(day => day.id === destination.droppableId);
        
        if (!sourceDay || !destDay) return prevDays;
        
        const sourcePlaces = Array.from(sourceDay.places);
        const destPlaces = Array.from(destDay.places);
        
        const [removed] = sourcePlaces.splice(source.index, 1);
        destPlaces.splice(destination.index, 0, removed);
        
        return prevDays.map(day => {
          if (day.id === source.droppableId) {
            return {
              ...day,
              places: sourcePlaces
            };
          }
          if (day.id === destination.droppableId) {
            return {
              ...day,
              places: destPlaces
            };
          }
          return day;
        });
      });
    }
  };
  
  const getPlaceTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <Utensils className="w-4 h-4" />;
      case 'cafe':
        return <Coffee className="w-4 h-4" />;
      case 'hotel':
        return <Hotel className="w-4 h-4" />;
      case 'tourist_attraction':
        return <Landmark className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };
  
  const getPlaceTypeLabel = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'Nhà hàng';
      case 'cafe':
        return 'Quán cà phê';
      case 'hotel':
        return 'Khách sạn';
      case 'tourist_attraction':
        return 'Điểm tham quan';
      default:
        return type;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const dayOfWeek = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
    
    return `${dayOfWeek}, ${day}/${month}/${year}`;
  };
  
  const getActiveDayPlaces = () => {
    if (!activeDayId) return [];
    
    const activeDay = days.find(day => day.id === activeDayId);
    return activeDay ? activeDay.places : [];
  };
  
  // Calculate total duration for active day
  const calculateTotalDuration = () => {
    const places = getActiveDayPlaces();
    return places.reduce((total, place) => total + (place.duration || 0), 0);
  };
  
  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours > 0 ? `${hours}h` : ''}${mins > 0 ? ` ${mins}m` : ''}`;
  };
  
  const handleDaySelect = (dayId: string) => {
    setActiveDayId(dayId);
  };
  
  const handleSaveTrip = () => {
    console.log('Saving trip:', { tripName, startDate, endDate, days });
    // Add logic to save the trip to the database
    alert('Đã lưu lịch trình thành công!');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-6">
                <Compass className="h-6 w-6 text-blue-600" />
              </Link>
              
              {editingTripDetails ? (
                <div className="flex items-center space-x-4">
                  <div>
                    <input
                      type="text"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="border-b border-gray-300 focus:border-blue-500 focus:outline-none text-xl font-bold"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 rounded-md p-1 text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 rounded-md p-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setEditingTripDetails(false)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                  >
                    Xong
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center">
                  <h1 className="text-xl font-bold text-gray-800 mr-4">{tripName}</h1>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
                    <button
                      onClick={() => setEditingTripDetails(true)}
                      className="ml-2 text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                onClick={handleSaveTrip}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Share className="h-4 w-4 mr-2" />
                Chia sẻ
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Xuất PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Days sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Lịch trình</h2>
              </div>
              
              <div className="p-4 space-y-4">
                {days.map((day, index) => (
                  <button
                    key={day.id}
                    onClick={() => handleDaySelect(day.id)}
                    className={`w-full text-left p-3 rounded-lg border ${
                      activeDayId === day.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Ngày {index + 1}</div>
                        <div className="text-sm text-gray-500">{formatDate(day.date)}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {day.places.length} địa điểm
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Center: Places list for selected day */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    {activeDayId && `Ngày ${days.findIndex(day => day.id === activeDayId) + 1}`}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Tổng thời gian: {formatDuration(calculateTotalDuration())}</span>
                  </div>
                </div>
                
                <div className="mt-4 relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Tìm kiếm địa điểm..."
                      className="w-full px-10 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {showSearchResults && (
                    <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
                      {searchResults.filter(place => 
                        place.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map(place => (
                        <div
                          key={place.id}
                          className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleAddPlace(place)}
                        >
                          <div className="flex items-start">
                            <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={place.image}
                                alt={place.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-3 flex-grow min-w-0">
                              <div className="font-medium text-gray-800 truncate">{place.name}</div>
                              <div className="flex items-center mt-1">
                                <div className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full flex items-center">
                                  {getPlaceTypeIcon(place.type)}
                                  <span className="ml-1">{getPlaceTypeLabel(place.type)}</span>
                                </div>
                                <div className="flex items-center ml-2 text-gray-500 text-xs">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="ml-1">{place.rating}</span>
                                </div>
                              </div>
                              <div className="flex items-start mt-1 text-xs text-gray-500 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5 mr-1" />
                                <span className="truncate">{place.address}</span>
                              </div>
                            </div>
                            <button className="flex-shrink-0 ml-2 text-blue-600">
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {searchResults.filter(place => 
                        place.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          Không tìm thấy địa điểm phù hợp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <DragDropContext onDragEnd={onDragEnd}>
                {activeDayId && (
                  <Droppable droppableId={activeDayId}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="py-4 px-4 min-h-[400px]"
                      >
                        {getActiveDayPlaces().length === 0 ? (
                          <div className="text-center py-16">
                            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có địa điểm nào</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                              Tìm kiếm và thêm các địa điểm bạn muốn đến trong ngày này
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {getActiveDayPlaces().map((place, index) => (
                              <Draggable key={place.id} draggableId={place.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`border rounded-lg overflow-hidden ${
                                      snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                    }`}
                                  >
                                    <div className="flex items-start p-4">
                                      <div {...provided.dragHandleProps} className="flex-shrink-0 mr-3 mt-1 text-gray-400 cursor-move">
                                        <MoveVertical className="h-5 w-5" />
                                      </div>
                                      
                                      <div className="flex-shrink-0 relative h-20 w-20 rounded overflow-hidden">
                                        <Image
                                          src={place.image}
                                          alt={place.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      
                                      <div className="ml-4 flex-grow min-w-0">
                                        <div className="flex items-center justify-between">
                                          <h3 className="font-medium text-gray-800">{place.name}</h3>
                                          <div className="flex items-center space-x-2">
                                            <button className="text-gray-400 hover:text-gray-600">
                                              <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() => handleRemovePlace(activeDayId, place.id)}
                                              className="text-gray-400 hover:text-red-600"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center mt-1 space-x-2">
                                          <div className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full flex items-center">
                                            {getPlaceTypeIcon(place.type)}
                                            <span className="ml-1">{getPlaceTypeLabel(place.type)}</span>
                                          </div>
                                          
                                          <div className="flex items-center text-gray-500 text-xs">
                                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                            <span className="ml-1">{place.rating}</span>
                                          </div>
                                          
                                          <div className="flex items-center text-gray-500 text-xs">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>{formatDuration(place.duration || 0)}</span>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-start mt-1 text-xs text-gray-500 truncate">
                                          <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5 mr-1" />
                                          <span className="truncate">{place.address}</span>
                                        </div>
                                        
                                        {place.notes && (
                                          <div className="mt-2 text-xs text-gray-600 border-t border-gray-100 pt-2">
                                            {place.notes}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg z-10 lg:hidden">
        <div className="grid grid-cols-3 h-16">
          <Link
            href="/dashboard/Map"
            className="flex flex-col items-center justify-center"
          >
            <MapPin className="h-6 w-6 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Bản đồ</span>
          </Link>
          
          <button className="flex flex-col items-center justify-center relative">
            <div className="absolute -top-5 rounded-full bg-blue-600 w-14 h-14 flex items-center justify-center shadow-lg">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <span className="text-xs mt-8 text-gray-500">Thêm địa điểm</span>
          </button>
          
          <Link
            href="/account"
            className="flex flex-col items-center justify-center"
          >
            <Save className="h-6 w-6 text-gray-500" />
            <span className="text-xs mt-1 text-gray-500">Lưu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripPlannerPage;