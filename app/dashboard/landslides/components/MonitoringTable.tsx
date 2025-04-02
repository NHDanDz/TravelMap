'use client';

import { useState, useEffect, useRef } from 'react';
import { MonitoringArea } from '@/app/lib/types/landslide';
import { formatDate, formatDateTimeRelative } from '@/app/lib/utils';
import { toast } from 'react-hot-toast';

interface MonitoringTableProps {
  areas: MonitoringArea[];
}

// Tạo kiểu dữ liệu cho trạng thái giám sát
interface MonitoringStatus {
  areaId: string;
  status: 'idle' | 'checking' | 'success' | 'error';
  lastChecked?: string;
  message?: string;
}

// Caching mechanism for monitoring API responses
interface CacheItem {
  timestamp: number;
  data: any;
}

// Cache settings
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL
const responseCache = new Map<string, CacheItem>();

// Function to get cached response or fetch new one
async function getCachedOrFetch(url: string, options: RequestInit) {
  const cacheKey = `${url}:${JSON.stringify(options.body || {})}`;
  
  // Check if we have a cached response
  const cachedItem = responseCache.get(cacheKey);
  if (cachedItem && (Date.now() - cachedItem.timestamp) < CACHE_TTL) {
    console.log('Sử dụng dữ liệu cache cho:', url);
    return cachedItem.data;
  }
  
  // Fetch fresh data
  console.log('Đang lấy dữ liệu mới từ:', url);
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Lỗi HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    responseCache.set(cacheKey, {
      timestamp: Date.now(),
      data
    });
    
    return data;
  } catch (error) {
    console.error('Lỗi khi gọi API:', error);
    throw error;
  }
}

// Clean up expired cache items
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      responseCache.delete(key);
    }
  }
}

// Hàm chuyển đổi tần suất giám sát sang milliseconds
const frequencyToMilliseconds = (frequency: string): number => {
  switch (frequency) {
    case 'daily':
      return 24 * 60 * 60 * 1000; // 1 ngày
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000; // 1 tuần
    case 'biweekly':
      return 14 * 24 * 60 * 60 * 1000; // 2 tuần
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000; // 1 tháng
    default:
      return 24 * 60 * 60 * 1000; // Mặc định 1 ngày
  }
};

// Hàm chuyển đổi tần suất sang text tiếng Việt
const formatFrequency = (frequency: string): string => {
  switch (frequency) {
    case 'daily':
      return 'Hàng ngày';
    case 'weekly':
      return 'Hàng tuần';
    case 'biweekly':
      return 'Hai tuần/lần';
    case 'monthly':
      return 'Hàng tháng';
    default:
      return frequency;
  }
};

// Hàm tính thời gian cần kiểm tra tiếp theo
const getNextCheckTime = (lastChecked: string, frequency: string): Date => {
  const lastCheckedDate = new Date(lastChecked);
  const intervalMs = frequencyToMilliseconds(frequency);
  return new Date(lastCheckedDate.getTime() + intervalMs);
};

// Hàm kiểm tra xem đã đến thời gian giám sát tiếp theo chưa
const shouldCheckNow = (lastChecked: string, frequency: string): boolean => {
  const now = new Date();
  const nextCheckTime = getNextCheckTime(lastChecked, frequency);
  return now >= nextCheckTime;
};

// Hàm định dạng thời gian còn lại
const formatTimeRemaining = (targetDate: Date): string => {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Đến hạn';
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return `${diffHours} giờ nữa`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày nữa`;
};

export default function MonitoringTable({ areas }: MonitoringTableProps) {
  // State để lưu trạng thái giám sát của từng khu vực
  const [monitoringStatus, setMonitoringStatus] = useState<Record<string, MonitoringStatus>>({});
  // State để lưu danh sách thông báo
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: string, timestamp: Date}>>([]);
  // State để theo dõi danh sách khu vực đã cập nhật
  const [updatedAreas, setUpdatedAreas] = useState<MonitoringArea[]>(areas);
  // State để hiển thị/ẩn notifications panel
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  // State để đếm số thông báo chưa đọc
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Refs to track current monitoring areas
  const activeMonitoringJobs = useRef<Map<string, { intervalId: NodeJS.Timeout, status: string }>>(new Map());
  const cacheCleanupInterval = useRef<NodeJS.Timeout | null>(null);

  // Khởi tạo trạng thái giám sát cho tất cả khu vực
  useEffect(() => {
    const initialStatus: Record<string, MonitoringStatus> = {};
    areas.forEach(area => {
      initialStatus[area.id] = {
        areaId: area.id,
        status: 'idle',
        lastChecked: area.lastChecked
      };
    });
    setMonitoringStatus(initialStatus);
    setUpdatedAreas(areas);
    
    // Start cache cleanup interval
    if (!cacheCleanupInterval.current) {
      cacheCleanupInterval.current = setInterval(() => {
        cleanupCache();
      }, 60000); // Clean up every minute
    }
    
    return () => {
      // Clean up all monitoring intervals
      activeMonitoringJobs.current.forEach(job => {
        clearInterval(job.intervalId);
      });
      activeMonitoringJobs.current.clear();
      
      // Clean up cache interval
      if (cacheCleanupInterval.current) {
        clearInterval(cacheCleanupInterval.current);
        cacheCleanupInterval.current = null;
      }
    };
  }, [areas]);

  // Hàm kiểm tra và gửi yêu cầu giám sát khi đến thời gian
  useEffect(() => {
    // Kiểm tra 1 lần khi component được mount
    checkAreasForMonitoring();
    
    // Set up interval để kiểm tra định kỳ (mỗi 5 phút)
    const intervalId = setInterval(() => {
      checkAreasForMonitoring();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [updatedAreas]);

  // Hàm kiểm tra tất cả khu vực và gửi yêu cầu khi cần
  const checkAreasForMonitoring = () => {
    updatedAreas.forEach(area => {
      // Kiểm tra nếu đã đến thời gian và không đang trong quá trình kiểm tra
      const status = monitoringStatus[area.id] || { status: 'idle' };
      
      if (
        area.status === 'active' &&
        shouldCheckNow(area.lastChecked, area.monitorFrequency) &&
        status.status !== 'checking'
      ) {
        monitorArea(area.id);
      }
    });
  };

  // Hàm gửi yêu cầu giám sát một khu vực cụ thể
  const monitorArea = async (areaId: string) => {
    // Kiểm tra xem đã có quá trình giám sát đang diễn ra cho khu vực này chưa
    if (activeMonitoringJobs.current.has(areaId) && 
        activeMonitoringJobs.current.get(areaId)?.status === 'checking') {
      console.log(`Đã đang giám sát khu vực ${areaId}, bỏ qua yêu cầu`);
      return;
    }
    
    // Tìm khu vực trong danh sách
    const area = updatedAreas.find(a => a.id === areaId);
    if (!area) return;
    
    // Cập nhật trạng thái thành "đang kiểm tra"
    setMonitoringStatus(prev => ({
      ...prev,
      [areaId]: {
        ...prev[areaId],
        status: 'checking',
        message: 'Đang kiểm tra...'
      }
    }));
    
    // Đánh dấu công việc đang thực hiện
    activeMonitoringJobs.current.set(areaId, { 
      intervalId: setTimeout(() => {}, 0), // Placeholder
      status: 'checking' 
    });
    
    // Hiển thị thông báo toast
    toast.loading(`Đang kiểm tra khu vực: ${area.name}`, {
      id: `monitoring-${areaId}`
    });
    
    try {
      // Gửi request tới server sử dụng cơ chế cache
      const data = await getCachedOrFetch('/api/monitoring/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || "10102003"}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          areaId: areaId,
          boundingBox: area.boundingBox
        })
      });
      
      // Cập nhật trạng thái khu vực
      const now = new Date().toISOString();
      const updatedArea = {
        ...area,
        lastChecked: now,
        detectedPoints: data.detectedPoints || area.detectedPoints
      };
      
      // Cập nhật danh sách khu vực
      setUpdatedAreas(prev => 
        prev.map(a => a.id === areaId ? updatedArea : a)
      );
      
      // Cập nhật trạng thái giám sát
      setMonitoringStatus(prev => ({
        ...prev,
        [areaId]: {
          ...prev[areaId],
          status: 'success',
          lastChecked: now,
          message: `Đã phát hiện ${data.detectedPoints || 0} điểm sạt lở`
        }
      }));
      
      // Thêm thông báo mới nếu có phát hiện mới
      if (data.newDetections > 0) {
        const newNotification = {
          id: `notification-${Date.now()}`,
          message: `Khu vực ${area.name}: Phát hiện ${data.newDetections} điểm sạt lở mới!`,
          type: 'warning',
          timestamp: new Date()
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
      } else {
        // Thông báo kiểm tra hoàn tất
        const successNotification = {
          id: `notification-${Date.now()}`,
          message: `Khu vực ${area.name}: Kiểm tra hoàn tất, không phát hiện sạt lở mới`,
          type: 'success',
          timestamp: new Date()
        };
        
        setNotifications(prev => [successNotification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
      }
      
      // Đánh dấu công việc đã hoàn thành
      activeMonitoringJobs.current.set(areaId, { 
        intervalId: setTimeout(() => {}, 0), // Placeholder
        status: 'success' 
      });
      
      // Hiển thị thông báo toast
      toast.success(`Đã kiểm tra khu vực: ${area.name}`, {
        id: `monitoring-${areaId}`
      });
      
    } catch (error) {
      console.error('Lỗi khi giám sát khu vực:', error);
      
      // Cập nhật trạng thái thành lỗi
      setMonitoringStatus(prev => ({
        ...prev,
        [areaId]: {
          ...prev[areaId],
          status: 'error',
          message: error instanceof Error ? error.message : 'Lỗi không xác định'
        }
      }));
      
      // Thêm thông báo lỗi
      const errorNotification = {
        id: `notification-${Date.now()}`,
        message: `Lỗi kiểm tra khu vực ${area.name}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        type: 'error',
        timestamp: new Date()
      };
      
      setNotifications(prev => [errorNotification, ...prev.slice(0, 19)]);
      setUnreadCount(prev => prev + 1);
      
      // Đánh dấu công việc bị lỗi
      activeMonitoringJobs.current.set(areaId, { 
        intervalId: setTimeout(() => {}, 0), // Placeholder
        status: 'error' 
      });
      
      // Hiển thị thông báo toast lỗi
      toast.error(`Lỗi kiểm tra: ${area.name}`, {
        id: `monitoring-${areaId}`
      });
    }
  };

  // Hàm xử lý khi nhấn nút giám sát thủ công
  const handleManualMonitoring = (areaId: string) => {
    monitorArea(areaId);
  };

  // Xử lý khi đọc thông báo
  const handleViewNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
    }
  };

  // Hiển thị mức độ rủi ro
  const renderRiskLevel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cao</span>;
      case 'medium':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Trung bình</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Thấp</span>;
    }
  };

  // Hiển thị số điểm phát hiện
  const renderDetectedPoints = (points: number) => {
    let bgColor = 'bg-green-100 text-green-800';
    if (points > 5) {
      bgColor = 'bg-red-100 text-red-800';
    } else if (points > 0) {
      bgColor = 'bg-orange-100 text-orange-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {points} điểm
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="py-4 px-6 border-b border-gray-200 flex justify-between items-center">
        <div className="flex space-x-2 items-center">
          <h2 className="text-lg font-semibold text-gray-900">Theo dõi liên tục</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {updatedAreas.length} khu vực
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Nút thông báo */}
          <div className="relative">
            <button 
              onClick={handleViewNotifications}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Panel thông báo */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto border border-gray-200">
                <div className="p-3 border-b border-gray-200 font-medium flex justify-between items-center">
                  <span>Thông báo</span>
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Xóa tất cả
                  </button>
                </div>
                <div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Không có thông báo
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-gray-100 text-sm ${
                          notification.type === 'error' ? 'bg-red-50' : 
                          notification.type === 'warning' ? 'bg-yellow-50' : 
                          'bg-white'
                        }`}
                      >
                        <div className="font-medium">
                          {notification.type === 'error' && (
                            <span className="text-red-600">Lỗi: </span>
                          )}
                          {notification.type === 'warning' && (
                            <span className="text-yellow-600">Cảnh báo: </span>
                          )}
                          {notification.message}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDateTimeRelative(notification.timestamp)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Nút thêm khu vực mới */}
          <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium rounded-lg text-sm px-4 py-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Thêm khu vực
          </button>
        </div>
      </div>

      <div className="overflow-x-auto"> 
<div className="overflow-x-auto w-full">
  <table className="min-w-full divide-y divide-gray-200 table-fixed">
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="py-3 px-3 text-center w-40 min-w-40">Tên khu vực</th>
        <th className="py-3 px-3 text-center w-36 min-w-36">Tọa độ</th>
        <th className="py-3 px-3 text-center w-28 min-w-28">Tần suất</th>
        <th className="py-3 px-3 text-center w-40 min-w-40">Kiểm tra gần nhất</th>
        <th className="py-3 px-3 text-center w-36 min-w-36">Kiểm tra tiếp theo</th>
        <th className="py-3 px-3 text-center w-32 min-w-32">Phát hiện</th>
        <th className="py-3 px-3 text-center w-24 min-w-24">Rủi ro</th>
        <th className="py-3 px-3 text-center w-32 min-w-32">Trạng thái</th>
        <th className="py-3 px-3 text-center w-40 min-w-40">Thao tác</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {updatedAreas.map((area) => {
        const status = monitoringStatus[area.id] || { status: 'idle' };
        const nextCheckTime = getNextCheckTime(area.lastChecked, area.monitorFrequency);
        const timeRemaining = formatTimeRemaining(nextCheckTime);
        
        let detectedText = '';
        if (status.status === 'success' && status.message && status.message.includes('phát hiện')) {
          const match = status.message.match(/phát hiện (\d+) điểm/i);
          if (match && match[1]) {
            detectedText = `Đã phát hiện ${match[1]} điểm sạt lở`;
          }
        }
        
        return (
          <tr key={area.id} className={`hover:bg-gray-50 ${status.status === 'checking' ? 'bg-blue-50' : ''}`}>
            <td className="py-2 px-3">
              <div className="font-medium text-gray-900 truncate" title={area.name}>{area.name}</div>
              <div className="text-xs text-gray-500 truncate">ID: {area.id}</div>
            </td>
            
            <td className="py-2 px-3 text-sm text-gray-500 text-center">
              <div className="text-xs whitespace-nowrap"> 
                {((area.boundingBox.north + area.boundingBox.south) / 2).toFixed(2)},{((area.boundingBox.east + area.boundingBox.west) / 2).toFixed(2)}
              </div>
            </td>
            
            <td className="py-2 px-3 text-sm text-gray-500 text-center whitespace-nowrap">
              {formatFrequency(area.monitorFrequency)}
            </td>
            
            <td className="py-2 px-3 text-sm text-gray-500 text-center">
              <div className="whitespace-nowrap">{formatDate(area.lastChecked)}</div>
              
              {status.status === 'checking' && (
                <div className="text-xs text-blue-600 flex items-center justify-center mt-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-1"></div>
                  <span className="whitespace-nowrap">Đang kiểm tra...</span>
                </div>
              )}
              
              {status.status === 'success' && detectedText && (
                <div className="text-xs text-green-600 mt-1 truncate" title={detectedText}>
                  {detectedText}
                </div>
              )}
              
              {status.status === 'error' && status.message && (
                <div className="text-xs text-red-600 mt-1 truncate" title={status.message}>
                  {status.message}
                </div>
              )}
            </td>
            
            <td className="py-2 px-3 text-sm text-gray-500 text-center">
              <div className={`truncate whitespace-nowrap ${shouldCheckNow(area.lastChecked, area.monitorFrequency) ? 'text-red-600 font-medium' : ''}`}>
                {shouldCheckNow(area.lastChecked, area.monitorFrequency) ? 'Đến hạn kiểm tra' : timeRemaining}
              </div>
            </td>
            
            <td className="py-2 px-3 text-center">
              <div className="truncate" title={typeof renderDetectedPoints === 'function' ? 'Chi tiết phát hiện' : ''}>
                {renderDetectedPoints(area.detectedPoints)}
              </div>
            </td>
            
            <td className="py-2 px-3 text-center">
              <div className="truncate">
                {renderRiskLevel(area.riskLevel)}
              </div>
            </td>
            
            <td className="py-2 px-3 text-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                ${area.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {area.status === 'active' ? 'Đang theo dõi' : 'Tạm dừng'}
              </span>
            </td>
            
            <td className="py-2 px-3 text-center">
              <div className="flex justify-center space-x-1">
                <button 
                  onClick={() => handleManualMonitoring(area.id)}
                  disabled={status.status === 'checking'}
                  className={`text-xs px-2 py-1 rounded 
                    ${status.status === 'checking' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                >
                  Kiểm tra
                </button>
                
                <button 
                  className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  Sửa
                </button>
                
                <button className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-700 hover:bg-gray-100">
                  {area.status === 'active' ? 'Dừng' : 'Kích hoạt'}
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
      </div>

      {updatedAreas.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có khu vực nào được giám sát</h3>
          <p className="mt-1 text-sm text-gray-500">Hãy thêm khu vực theo dõi để nhận được cảnh báo sớm.</p>
          <div className="mt-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Thêm khu vực mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}