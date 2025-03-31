// app/dashboard/landslides/components/NotificationPanel.tsx
import { useState } from 'react';
import { NotificationSettings, Alert } from '@/app/lib/types/landslide';

interface NotificationPanelProps {
  settings: NotificationSettings;
  alerts: Alert[];
  onSettingsChange: (settings: NotificationSettings) => Promise<void>;
}

// Helper function to format date
function formatDate(dateString: string, locale: string = 'vi-VN'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export default function NotificationPanel({ settings, alerts, onSettingsChange }: NotificationPanelProps) {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(settings);
  
  const handleSettingChange = (field: keyof NotificationSettings, value: any) => {
    const updatedSettings = { ...notificationSettings, [field]: value };
    setNotificationSettings(updatedSettings);
  };

  const handleSaveSettings = async () => {
    await onSettingsChange(notificationSettings);
    // No need to handle return value since it's void
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Cấu hình thông báo</h2>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="text-md font-medium text-gray-900 mb-3">Phương thức thông báo</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="notification-email"
                  type="checkbox"
                  checked={notificationSettings.email}
                  onChange={(e) => handleSettingChange('email', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="notification-email" className="ml-2 text-sm text-gray-900">
                  Gửi email
                </label>
              </div>
              <input
                type="email"
                placeholder="example@domain.com"
                value={notificationSettings.emailAddress || ''}
                onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="notification-sms"
                  type="checkbox"
                  checked={notificationSettings.sms}
                  onChange={(e) => handleSettingChange('sms', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="notification-sms" className="ml-2 text-sm text-gray-900">
                  Gửi SMS
                </label>
              </div>
              <input
                type="tel"
                placeholder="+84 ..."
                value={notificationSettings.phoneNumber || ''}
                onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="text-md font-medium text-gray-900 mb-3">Ngưỡng cảnh báo</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="threshold" className="block text-sm text-gray-700 mb-1">Mức độ nguy hiểm kích hoạt cảnh báo:</label>
              <select
                id="threshold"
                value={notificationSettings.threshold}
                onChange={(e) => handleSettingChange('threshold', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
              >
                <option value="low">Thấp - Cảnh báo mọi phát hiện</option>
                <option value="medium">Trung bình - Chỉ cảnh báo mức độ trung bình trở lên</option>
                <option value="high">Cao - Chỉ cảnh báo mức độ nguy hiểm cao</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="update-frequency" className="block text-sm text-gray-700 mb-1">Tần suất thông báo cập nhật:</label>
              <select
                id="update-frequency"
                value={notificationSettings.updateFrequency}
                onChange={(e) => handleSettingChange('updateFrequency', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
              >
                <option value="immediate">Ngay lập tức</option>
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="notification-forecast"
                type="checkbox"
                checked={notificationSettings.weatherForecast}
                onChange={(e) => handleSettingChange('weatherForecast', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="notification-forecast" className="ml-2 text-sm text-gray-900">
                Thông báo dự báo thời tiết có nguy cơ gây sạt lở
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-md font-medium text-gray-900 mb-3">Cài đặt nâng cao</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Tự động thêm vào theo dõi khi phát hiện sạt lở mới</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  name="auto-monitor" 
                  id="auto-monitor" 
                  checked={notificationSettings.autoMonitor}
                  onChange={(e) => handleSettingChange('autoMonitor', e.target.checked)}
                  className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="auto-monitor" 
                  className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Gửi báo cáo phân tích hàng tháng</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox" 
                  name="monthly-report" 
                  id="monthly-report" 
                  checked={notificationSettings.monthlyReport}
                  onChange={(e) => handleSettingChange('monthlyReport', e.target.checked)}
                  className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label 
                  htmlFor="monthly-report" 
                  className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
              onClick={handleSaveSettings}
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Lịch sử cảnh báo</h2>
        
        <div className="bg-white rounded-lg border border-gray-200 h-96 overflow-y-auto">
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`border-l-4 p-4 m-4 rounded-r-md ${getAlertColorClass(alert.type)}`}
            >
              <div className="flex justify-between">
                <p className={`font-medium ${getAlertTextColorClass(alert.type)}`}>{alert.title}</p>
                <span className="text-xs text-gray-500">{formatDate(alert.date)}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
              <button className="text-xs text-blue-600 mt-1">Xem chi tiết</button>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có cảnh báo nào</h3>
              <p className="mt-1 text-sm text-gray-500">Các cảnh báo sẽ hiển thị ở đây khi có.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function for alert coloring
function getAlertColorClass(type: string): string {
  switch(type) {
    case 'danger': return 'border-red-500 bg-red-50';
    case 'warning': return 'border-orange-500 bg-orange-50';
    case 'info': return 'border-yellow-500 bg-yellow-50';
    case 'success': return 'border-green-500 bg-green-50';
    default: return 'border-blue-500 bg-blue-50';
  }
}

function getAlertTextColorClass(type: string): string {
  switch(type) {
    case 'danger': return 'text-red-800';
    case 'warning': return 'text-orange-800';
    case 'info': return 'text-yellow-800';
    case 'success': return 'text-green-800';
    default: return 'text-blue-800';
  }
}