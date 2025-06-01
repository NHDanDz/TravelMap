// app/dashboard/Map/components/MapSettingsPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings,
  X,
  Moon,
  Sun,
  Globe,
  Map,
  Navigation,
  Bell,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  MapPin,
  Route,
  Layers,
  Filter,
  Palette,
  Zap,
  Shield,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';

interface MapSettings {
  // Display preferences
  theme: 'light' | 'dark' | 'auto';
  mapStyle: string;
  language: string;
  units: 'metric' | 'imperial';
  
  // Map behavior
  defaultZoom: number;
  enableGeolocation: boolean;
  autoFollowLocation: boolean;
  enableRotation: boolean;
  enablePitch: boolean;
  
  // UI preferences
  showTraffic: boolean;
  showLabels: boolean;
  showTransit: boolean;
  showSatellite: boolean;
  compactView: boolean;
  
  // Search & Discovery
  searchRadius: number;
  defaultPlaceType: string;
  showNearbyOnOpen: boolean;
  maxSearchResults: number;
  
  // Privacy & Data
  saveSearchHistory: boolean;
  savePlaces: boolean;
  shareLocation: boolean;
  enableAnalytics: boolean;
  
  // Notifications
  enableNotifications: boolean;
  soundEnabled: boolean;
  
  // Offline
  enableOfflineMode: boolean;
  offlineRadius: number;
  
  // Performance
  enableAnimations: boolean;
  highQuality: boolean;
  preloadTiles: boolean;
}

interface MapSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Partial<MapSettings>;
  onSettingsChange: (settings: Partial<MapSettings>) => void;
}

const MapSettingsPanel: React.FC<MapSettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'behavior' | 'privacy' | 'advanced'>('display');
  const [localSettings, setLocalSettings] = useState<Partial<MapSettings>>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Default settings
  const defaultSettings: MapSettings = {
    theme: 'auto',
    mapStyle: 'streets-v12',
    language: 'vi',
    units: 'metric',
    defaultZoom: 13,
    enableGeolocation: true,
    autoFollowLocation: false,
    enableRotation: true,
    enablePitch: true,
    showTraffic: false,
    showLabels: true,
    showTransit: false,
    showSatellite: false,
    compactView: false,
    searchRadius: 1000,
    defaultPlaceType: 'restaurant',
    showNearbyOnOpen: false,
    maxSearchResults: 20,
    saveSearchHistory: true,
    savePlaces: true,
    shareLocation: true,
    enableAnalytics: true,
    enableNotifications: true,
    soundEnabled: true,
    enableOfflineMode: false,
    offlineRadius: 5000,
    enableAnimations: true,
    highQuality: true,
    preloadTiles: false
  };

  useEffect(() => {
    setLocalSettings({ ...defaultSettings, ...settings });
  }, [settings]);

  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify({ ...defaultSettings, ...settings });
    setHasChanges(changed);
  }, [localSettings, settings]);

  const updateSetting = <K extends keyof MapSettings>(key: K, value: MapSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    onSettingsChange(localSettings);
    setHasChanges(false);
    
    // Save to localStorage
    try {
      localStorage.setItem('map_settings', JSON.stringify(localSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = () => {
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    setHasChanges(false);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'map-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setLocalSettings({ ...defaultSettings, ...imported });
      } catch (error) {
        console.error('Error importing settings:', error);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const SettingToggle = ({ 
    label, 
    description, 
    value, 
    onChange, 
    icon: Icon,
    disabled = false 
  }: {
    label: string;
    description?: string;
    value: boolean;
    onChange: (value: boolean) => void;
    icon?: React.ComponentType<any>;
    disabled?: boolean;
  }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        {Icon && <Icon className="w-5 h-5 text-gray-500" />}
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${value ? 'bg-blue-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${value ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );

  const SettingSelect = ({ 
    label, 
    value, 
    options, 
    onChange,
    icon: Icon 
  }: {
    label: string;
    value: string | number;
    options: Array<{ value: string | number; label: string }>;
    onChange: (value: string | number) => void;
    icon?: React.ComponentType<any>;
  }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-5 h-5 text-gray-500" />}
        <p className="font-medium text-gray-900">{label}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const SettingSlider = ({ 
    label, 
    value, 
    min, 
    max, 
    step, 
    onChange,
    format,
    icon: Icon 
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    format?: (value: number) => string;
    icon?: React.ComponentType<any>;
  }) => (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <p className="font-medium text-gray-900">{label}</p>
        </div>
        <span className="text-sm text-gray-600">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cài đặt bản đồ</h2>
              <p className="text-sm text-gray-600">Tùy chỉnh trải nghiệm bản đồ của bạn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4 space-y-1">
              {[
                { id: 'display', icon: Palette, label: 'Hiển thị' },
                { id: 'behavior', icon: Navigation, label: 'Hành vi' },
                { id: 'privacy', icon: Shield, label: 'Quyền riêng tư' },
                { id: 'advanced', icon: Zap, label: 'Nâng cao' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left
                    ${activeTab === id 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'display' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao diện & Hiển thị</h3>
                    
                    <div className="space-y-2">
                      <SettingSelect
                        icon={localSettings.theme === 'dark' ? Moon : Sun}
                        label="Chủ đề"
                        value={localSettings.theme || 'auto'}
                        options={[
                          { value: 'light', label: 'Sáng' },
                          { value: 'dark', label: 'Tối' },
                          { value: 'auto', label: 'Tự động' }
                        ]}
                        onChange={(value) => updateSetting('theme', value as any)}
                      />
                      
                      <SettingSelect
                        icon={Map}
                        label="Kiểu bản đồ"
                        value={localSettings.mapStyle || 'streets-v12'}
                        options={[
                          { value: 'streets-v12', label: 'Đường phố' },
                          { value: 'satellite-v9', label: 'Vệ tinh' },
                          { value: 'outdoors-v12', label: 'Ngoài trời' },
                          { value: 'dark-v11', label: 'Tối' },
                          { value: 'light-v11', label: 'Sáng' }
                        ]}
                        onChange={(value) => updateSetting('mapStyle', value as string)}
                      />
                      
                      <SettingSelect
                        icon={Globe}
                        label="Ngôn ngữ"
                        value={localSettings.language || 'vi'}
                        options={[
                          { value: 'vi', label: 'Tiếng Việt' },
                          { value: 'en', label: 'English' },
                          { value: 'zh', label: '中文' },
                          { value: 'ja', label: '日本語' }
                        ]}
                        onChange={(value) => updateSetting('language', value as string)}
                      />
                      
                      <SettingToggle
                        icon={Eye}
                        label="Hiển thị nhãn"
                        description="Hiển thị tên đường và địa điểm"
                        value={localSettings.showLabels ?? true}
                        onChange={(value) => updateSetting('showLabels', value)}
                      />
                      
                      <SettingToggle
                        icon={Route}
                        label="Hiển thị giao thông"
                        description="Hiển thị tình trạng giao thông theo thời gian thực"
                        value={localSettings.showTraffic ?? false}
                        onChange={(value) => updateSetting('showTraffic', value)}
                      />
                      
                      <SettingToggle
                        icon={Smartphone}
                        label="Chế độ compact"
                        description="Giao diện thu gọn cho thiết bị nhỏ"
                        value={localSettings.compactView ?? false}
                        onChange={(value) => updateSetting('compactView', value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'behavior' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành vi bản đồ</h3>
                    
                    <div className="space-y-2">
                      <SettingSlider
                        icon={MapPin}
                        label="Zoom mặc định"
                        value={localSettings.defaultZoom || 13}
                        min={8}
                        max={18}
                        step={1}
                        onChange={(value) => updateSetting('defaultZoom', value)}
                      />
                      
                      <SettingToggle
                        icon={Navigation}
                        label="Định vị tự động"
                        description="Tự động xác định vị trí của bạn khi mở bản đồ"
                        value={localSettings.enableGeolocation ?? true}
                        onChange={(value) => updateSetting('enableGeolocation', value)}
                      />
                      
                      <SettingToggle
                        icon={Navigation}
                        label="Theo dõi vị trí"
                        description="Tự động cập nhật vị trí khi di chuyển"
                        value={localSettings.autoFollowLocation ?? false}
                        onChange={(value) => updateSetting('autoFollowLocation', value)}
                      />
                      
                      <SettingToggle
                        icon={RotateCcw}
                        label="Cho phép xoay bản đồ"
                        value={localSettings.enableRotation ?? true}
                        onChange={(value) => updateSetting('enableRotation', value)}
                      />
                      
                      <SettingSlider
                        icon={Filter}
                        label="Bán kính tìm kiếm (m)"
                        value={localSettings.searchRadius || 1000}
                        min={500}
                        max={10000}
                        step={500}
                        format={(value) => value >= 1000 ? `${value/1000}km` : `${value}m`}
                        onChange={(value) => updateSetting('searchRadius', value)}
                      />
                      
                      <SettingSlider
                        icon={Database}
                        label="Số kết quả tìm kiếm tối đa"
                        value={localSettings.maxSearchResults || 20}
                        min={5}
                        max={50}
                        step={5}
                        onChange={(value) => updateSetting('maxSearchResults', value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền riêng tư & Dữ liệu</h3>
                    
                    <div className="space-y-2">
                      <SettingToggle
                        icon={Database}
                        label="Lưu lịch sử tìm kiếm"
                        description="Lưu các tìm kiếm gần đây để gợi ý"
                        value={localSettings.saveSearchHistory ?? true}
                        onChange={(value) => updateSetting('saveSearchHistory', value)}
                      />
                      
                      <SettingToggle
                        icon={MapPin}
                        label="Lưu địa điểm yêu thích"
                        description="Lưu các địa điểm đã đánh dấu"
                        value={localSettings.savePlaces ?? true}
                        onChange={(value) => updateSetting('savePlaces', value)}
                      />
                      
                      <SettingToggle
                        icon={Navigation}
                        label="Chia sẻ vị trí"
                        description="Cho phép chia sẻ vị trí để cải thiện dịch vụ"
                        value={localSettings.shareLocation ?? true}
                        onChange={(value) => updateSetting('shareLocation', value)}
                      />
                      
                      <SettingToggle
                        icon={Shield}
                        label="Phân tích sử dụng"
                        description="Gửi dữ liệu phân tích để cải thiện ứng dụng"
                        value={localSettings.enableAnalytics ?? true}
                        onChange={(value) => updateSetting('enableAnalytics', value)}
                      />
                      
                      <SettingToggle
                        icon={Bell}
                        label="Thông báo"
                        description="Nhận thông báo về cập nhật và tính năng mới"
                        value={localSettings.enableNotifications ?? true}
                        onChange={(value) => updateSetting('enableNotifications', value)}
                      />
                      
                      <SettingToggle
                        icon={localSettings.soundEnabled ? Volume2 : VolumeX}
                        label="Âm thanh"
                        description="Phát âm thanh cho thông báo và điều hướng"
                        value={localSettings.soundEnabled ?? true}
                        onChange={(value) => updateSetting('soundEnabled', value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt nâng cao</h3>
                    
                    <div className="space-y-2">
                      <SettingToggle
                        icon={Zap}
                        label="Hiệu ứng động"
                        description="Hiển thị hiệu ứng và hoạt hình"
                        value={localSettings.enableAnimations ?? true}
                        onChange={(value) => updateSetting('enableAnimations', value)}
                      />
                      
                      <SettingToggle
                        icon={Monitor}
                        label="Chất lượng cao"
                        description="Sử dụng hình ảnh độ phân giải cao (tốn băng thông)"
                        value={localSettings.highQuality ?? true}
                        onChange={(value) => updateSetting('highQuality', value)}
                      />
                      
                      <SettingToggle
                        icon={localSettings.enableOfflineMode ? WifiOff : Wifi}
                        label="Chế độ offline"
                        description="Tải trước bản đồ để sử dụng offline"
                        value={localSettings.enableOfflineMode ?? false}
                        onChange={(value) => updateSetting('enableOfflineMode', value)}
                      />
                      
                      {localSettings.enableOfflineMode && (
                        <SettingSlider
                          label="Bán kính offline (km)"
                          value={(localSettings.offlineRadius || 5000) / 1000}
                          min={1}
                          max={50}
                          step={1}
                          format={(value) => `${value}km`}
                          onChange={(value) => updateSetting('offlineRadius', value * 1000)}
                        />
                      )}
                      
                      <SettingToggle
                        icon={Download}
                        label="Tải trước tiles"
                        description="Tải trước dữ liệu bản đồ cho trải nghiệm mượt mà hơn"
                        value={localSettings.preloadTiles ?? false}
                        onChange={(value) => updateSetting('preloadTiles', value)}
                      />
                    </div>
                  </div>
                  
                  {/* Data Management */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý dữ liệu</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={exportSettings}
                        className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Xuất cài đặt</span>
                      </button>
                      
                      <label className="flex items-center justify-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Nhập cài đặt</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={importSettings}
                          className="hidden"
                        />
                      </label>
                      
                      <button
                        onClick={resetSettings}
                        className="flex items-center justify-center space-x-2 p-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Đặt lại</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          localStorage.clear();
                          resetSettings();
                        }}
                        className="flex items-center justify-center space-x-2 p-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa tất cả</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Database className="w-4 h-4" />
            <span>Cài đặt được lưu tự động</span>
            {hasChanges && (
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className={`
                px-4 py-2 rounded-lg transition-colors flex items-center space-x-2
                ${hasChanges 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSettingsPanel;