'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, Download, Printer, QrCode, Share, 
  Calendar, Clock, MapPin, ArrowLeft, ArrowRight
} from 'lucide-react';
import ItineraryTimeline from '../../components/ItineraryTimeline';

// Type definitions (same as in ItineraryTimeline.tsx)
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
  duration?: number; // in minutes
  notes?: string;
  openingHours?: string;
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
  status: 'draft' | 'planned' | 'completed';
  description?: string;
}

// Dummy place data (same as in the trip detail page)
const savedPlaces: Place[] = [
  {
    id: 'place1',
    name: 'Hồ Hoàn Kiếm',
    type: 'tourist_attraction',
    address: 'Phố Đinh Tiên Hoàng, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0278',
    longitude: '105.8523',
    image: '/images/place-3.jpg',
    openingHours: '6:00 - 20:00',
    duration: 90
  },
  {
    id: 'place2',
    name: 'Văn Miếu - Quốc Tử Giám',
    type: 'tourist_attraction',
    address: '58 Phố Quốc Tử Giám, Quận Đống Đa, Hà Nội',
    latitude: '21.0274',
    longitude: '105.8354',
    image: '/images/place-1.jpg',
    openingHours: '8:00 - 17:00',
    duration: 120
  },
  {
    id: 'place3',
    name: 'Chùa Trấn Quốc',
    type: 'tourist_attraction',
    address: 'Thanh Niên, Quận Tây Hồ, Hà Nội',
    latitude: '21.0492',
    longitude: '105.8350',
    image: '/images/pagoda-1.jpg',
    openingHours: '7:30 - 18:00',
    duration: 60
  },
  {
    id: 'place4',
    name: 'Nhà hàng Chả Cá Lã Vọng',
    type: 'restaurant',
    address: '14 Chả Cá, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0323',
    longitude: '105.8508',
    image: '/images/restaurant-1.jpg',
    openingHours: '10:00 - 22:00',
    duration: 90
  },
  {
    id: 'place5',
    name: 'Lăng Chủ tịch Hồ Chí Minh',
    type: 'tourist_attraction',
    address: '2 Hùng Vương, Điện Bàn, Ba Đình, Hà Nội',
    latitude: '21.0369',
    longitude: '105.8353',
    image: '/images/place-2.jpg',
    openingHours: '7:30 - 10:30, 14:00 - 16:00',
    duration: 60
  },
  {
    id: 'place6',
    name: 'Phố cổ Hà Nội',
    type: 'tourist_attraction',
    address: 'Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0340',
    longitude: '105.8500',
    image: '/images/place-4.jpg',
    openingHours: '24/7',
    duration: 180
  },
  {
    id: 'place7',
    name: 'Bảo tàng Lịch sử Quốc gia',
    type: 'tourist_attraction',
    address: '1 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0243',
    longitude: '105.8583',
    image: '/images/museum-1.jpg',
    openingHours: '8:00 - 17:00',
    duration: 120
  },
  {
    id: 'place8',
    name: 'Highlands Coffee - Nhà hát Lớn',
    type: 'cafe',
    address: '1 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
    latitude: '21.0244',
    longitude: '105.8573',
    image: '/images/cafe-1.jpg',
    openingHours: '7:00 - 22:00',
    duration: 60
  }
];

// Sample trip data
const sampleTrip: Trip = {
  id: 'trip1',
  name: 'Khám phá Hà Nội',
  destination: 'Hà Nội',
  startDate: '2025-04-20',
  endDate: '2025-04-23',
  coverImage: '/images/ha-noi.jpg',
  numDays: 4,
  status: 'planned',
  description: 'Khám phá các địa điểm nổi tiếng và ẩm thực đặc sắc của thủ đô nghìn năm văn hiến.',
  days: [
    {
      dayNumber: 1,
      date: '2025-04-20',
      places: [savedPlaces[0], savedPlaces[3]]
    },
    {
      dayNumber: 2,
      date: '2025-04-21',
      places: [savedPlaces[1], savedPlaces[7]]
    },
    {
      dayNumber: 3,
      date: '2025-04-22',
      places: [savedPlaces[4], savedPlaces[2]]
    },
    {
      dayNumber: 4,
      date: '2025-04-23',
      places: [savedPlaces[5]]
    }
  ]
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export default function TripPrintPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'compact' | 'table'>('timeline');
  const [showQrCode, setShowQrCode] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Fetch trip data (simulated)
  useEffect(() => {
    // In a real application, you would fetch the trip data from an API
    setTimeout(() => {
      setTrip(sampleTrip);
      setLoading(false);
    }, 500);
  }, [tripId]);
  
  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  // Handle download as PDF
  const handleDownload = () => {
    // In a real application, you would implement PDF generation here
    alert('Tính năng đang phát triển. Bạn có thể sử dụng chức năng in và lưu dưới dạng PDF.');
  };
  
  // Calculate total duration in minutes
  const calculateTotalDuration = (days: Day[]): number => {
    return days.reduce(
      (total, day) => total + day.places.reduce(
        (dayTotal, place) => dayTotal + (place.duration || 0), 0
      ), 0
    );
  };
  
  // Format time duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours} giờ ` : ''}${mins > 0 ? `${mins} phút` : ''}`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy lịch trình</h2>
          <p className="text-gray-600 mb-6">Lịch trình bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link
            href="/trip-planner"
            className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (hidden when printing) */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Link href={`/trip-planner/${tripId}`} className="mr-4">
                <ChevronLeft className="h-6 w-6 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Xuất lịch trình</h1>
                <p className="text-gray-600">{trip.name} - {trip.destination}</p>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={() => setShowQrCode(!showQrCode)}
                className="flex items-center py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <QrCode className="w-5 h-5 mr-2" />
                <span>Mã QR</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-5 h-5 mr-2" />
                <span>In</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                <span>Tải xuống PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* View Mode Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 print:hidden">
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'timeline' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'compact' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Compact
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'table' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Bảng
          </button>
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Mã QR của lịch trình</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowQrCode(false)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-56 h-56 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {/* Placeholder for QR code - would be a real QR code in production */}
                <div className="w-48 h-48 bg-white p-4">
                  <div className="w-full h-full border-8 border-gray-800 rounded-xl relative">
                    <div className="absolute inset-4 border-4 border-gray-800 rounded"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-gray-500">QR Code for Trip</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Quét mã QR này để xem lịch trình trên thiết bị di động hoặc chia sẻ với người khác.
              </p>
              
              <button
                onClick={() => {
                  // In a real app, this would copy the trip URL to clipboard
                  alert('Đã sao chép liên kết lịch trình vào bộ nhớ tạm.');
                }}
                className="inline-flex items-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share className="w-5 h-5 mr-2" />
                <span>Sao chép liên kết</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Printable Content */}
      <div 
        ref={printRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8 print:p-0 print:max-w-none"
      >
        {/* Print Header (only visible when printing) */}
        <div className="hidden print:block mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{trip.name}</h1>
              <p className="text-gray-600">{trip.destination}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="w-4 h-4 mr-1.5" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Tổng cộng:</div>
              <div className="font-medium">{trip.numDays} ngày</div>
              <div className="font-medium">{trip.days.reduce((total, day) => total + day.places.length, 0)} địa điểm</div>
              {calculateTotalDuration(trip.days) > 0 && (
                <div className="font-medium">{formatDuration(calculateTotalDuration(trip.days))}</div>
              )}
            </div>
          </div>
          <div className="border-b border-gray-300 mt-4 mb-6"></div>
        </div>
        
        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="mb-8">
            <ItineraryTimeline 
              trip={trip} 
              showDetailed={true}
              onPrint={handlePrint}
              onDownload={handleDownload}
            />
          </div>
        )}
        
        {/* Compact View */}
        {viewMode === 'compact' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="bg-blue-600 text-white p-6">
              <h1 className="text-2xl font-bold">{trip.name}</h1>
              <p className="text-blue-100">{trip.destination}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  <span>{trip.numDays} ngày</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  <span>{trip.days.reduce((total, day) => total + day.places.length, 0)} địa điểm</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {trip.days.map((day) => (
                <div key={day.dayNumber} className="mb-8 last:mb-0">
                  <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mr-3">
                      {day.dayNumber}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800">Ngày {day.dayNumber}</h2>
                      <p className="text-sm text-gray-600">{formatDate(day.date)}</p>
                    </div>
                  </div>
                  
                  {day.places.length === 0 ? (
                    <p className="text-gray-500 italic">
                      Chưa có địa điểm nào cho ngày này
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {day.places.map((place, index) => (
                        <div key={place.id} className="flex items-start">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-medium mr-3 mt-1">
                            {index + 1}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-gray-800">{place.name}</h3>
                            <p className="text-sm text-gray-500 mb-1">{place.address}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                              {place.startTime && place.endTime && (
                                <span>
                                  ⏱️ {place.startTime} - {place.endTime}
                                </span>
                              )}
                              {place.duration && (
                                <span>
                                  ⌛ {formatDuration(place.duration)}
                                </span>
                              )}
                              {place.openingHours && (
                                <span>
                                  🕒 Mở cửa: {place.openingHours}
                                </span>
                              )}
                            </div>
                            {place.notes && (
                              <p className="text-xs italic mt-1">
                                {place.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
              Lịch trình này được tạo bởi ứng dụng TravelSense. Thời gian và giờ mở cửa có thể thay đổi.
            </div>
          </div>
        )}
        
        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="bg-blue-600 text-white p-6">
              <h1 className="text-2xl font-bold">{trip.name}</h1>
              <p className="text-blue-100">{trip.destination}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  <span>{trip.numDays} ngày</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                      <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa điểm</th>
                      <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                      <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời lượng</th>
                      <th className="px-4 py-3 border text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trip.days.map((day) => (
                      <React.Fragment key={day.dayNumber}>
                        {day.places.length === 0 ? (
                          <tr>
                            <td className="px-4 py-4 border">
                              <div className="font-medium text-gray-800">Ngày {day.dayNumber}</div>
                              <div className="text-sm text-gray-500">{formatDate(day.date)}</div>
                            </td>
                            <td className="px-4 py-4 border italic text-gray-500" colSpan={4}>
                              Chưa có địa điểm nào cho ngày này
                            </td>
                          </tr>
                        ) : (
                          day.places.map((place, index) => (
                            <tr key={place.id} className="hover:bg-gray-50">
                              {index === 0 && (
                                <td className="px-4 py-4 border" rowSpan={day.places.length}>
                                  <div className="font-medium text-gray-800">Ngày {day.dayNumber}</div>
                                  <div className="text-sm text-gray-500">{formatDate(day.date)}</div>
                                </td>
                              )}
                              <td className="px-4 py-4 border">
                                <div className="font-medium text-gray-800">{place.name}</div>
                                <div className="text-sm text-gray-500">{place.address}</div>
                                {place.openingHours && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Mở cửa: {place.openingHours}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 border">
                                {place.startTime && place.endTime ? (
                                  <div className="text-sm">
                                    {place.startTime} - {place.endTime}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-4 border">
                                {place.duration ? (
                                  <div className="text-sm">
                                    {formatDuration(place.duration)}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-4 border">
                                {place.notes ? (
                                  <div className="text-sm">
                                    {place.notes}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
              Lịch trình này được tạo bởi ứng dụng TravelSense. Thời gian và giờ mở cửa có thể thay đổi.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}