// app/dashboard/landslides/components/LandslideTabs.tsx
'use client';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import LandslideList from './LandslideList';
import MonitoringTable from './MonitoringTable';
import NotificationPanel from './NotificationPanel';
import LandslideDetail from './LandslideDetail';
import AddMonitoringModal from './AddMonitoringModal';
import { LandslidePoint, MonitoringArea, NotificationSettings, Alert } from '@/app/lib/types/landslide';

interface LandslideTabsProps {
  initialLandslides: LandslidePoint[];
  initialMonitoredAreas: MonitoringArea[];
  initialNotificationSettings: NotificationSettings;
  initialAlerts: Alert[];
  onSaveLandslide: (landslide: LandslidePoint) => Promise<boolean>;
  onSaveMonitoringArea: (area: MonitoringArea) => Promise<boolean>;
  onSaveNotificationSettings: (settings: NotificationSettings) => Promise<void>;
}

export default function LandslideTabs({
  initialLandslides,
  initialMonitoredAreas,
  initialNotificationSettings,
  initialAlerts,
  onSaveLandslide,
  onSaveMonitoringArea,
  onSaveNotificationSettings
}: LandslideTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [landslides, setLandslides] = useState<LandslidePoint[]>(initialLandslides);
  const [monitoredAreas, setMonitoredAreas] = useState<MonitoringArea[]>(initialMonitoredAreas);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [alerts] = useState<Alert[]>(initialAlerts);
  const [selectedLandslide, setSelectedLandslide] = useState<LandslidePoint | null>(null);
  const [showAddMonitorModal, setShowAddMonitorModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleLandslideSelect = (landslide: LandslidePoint) => {
    setSelectedLandslide(landslide);
  };

  const handleAddToMonitoring = (landslide: LandslidePoint) => {
    setSelectedLandslide(landslide);
    setShowAddMonitorModal(true);
  };

  const handleCreateMonitoringArea = async (data: Partial<MonitoringArea>) => {
    // Create a new monitoring area
    const newArea: MonitoringArea = {
      id: `MON00${monitoredAreas.length + 1}`,
      name: data.name || 'New Monitoring Area',
      boundingBox: data.boundingBox || { north: 0, south: 0, east: 0, west: 0 },
      createdAt: data.createdAt || new Date().toISOString(),
      monitorFrequency: data.monitorFrequency || 'daily',
      lastChecked: new Date().toISOString(),
      status: 'active',
      detectedPoints: 1,
      riskLevel: 'medium',
      landslideId: data.landslideId,
      autoVerify: data.autoVerify
    };
    
    // Save to database via server action
    const success = await onSaveMonitoringArea(newArea);
    
    // Update local state
    if (success) {
      setMonitoredAreas([...monitoredAreas, newArea]);
      setShowAddMonitorModal(false);
      
      // Thay thế alert bằng toast
      toast.success(
        `Đã thêm "${selectedLandslide?.name}" vào danh sách theo dõi liên tục!`, 
        {
          style: {
            background: '#4ade80', // Màu xanh lá nhẹ
            color: 'white',
            fontWeight: 'bold',
            padding: '12px 20px',
            borderRadius: '8px'
          },
          iconTheme: {
            primary: 'white',
            secondary: '#16a34a'
          },
          duration: 3000 // Hiển thị trong 3 giây
        }
      );
    }
  };

  const handleSettingsChange = async (settings: NotificationSettings) => {
    // Save to database via server action
    await onSaveNotificationSettings(settings);
    
    // Update local state directly since we don't have a success flag
    setNotificationSettings(settings);
    
    // Thay thế alert bằng toast
    toast.success('Đã lưu cài đặt thông báo!', {
      style: {
        background: '#4ade80',
        color: 'white',
        fontWeight: 'bold',
        padding: '12px 20px',
        borderRadius: '8px'
      },
      iconTheme: {
        primary: 'white',
        secondary: '#16a34a'
      },
      duration: 3000
    });
  };
  return (
    <>
      <Tab.Group onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1">
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
            ${selected 
              ? 'bg-white shadow text-blue-700' 
              : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-700'}`
          }>
            Các điểm sạt lở đã phát hiện
          </Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
            ${selected 
              ? 'bg-white shadow text-blue-700' 
              : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-700'}`
          }>
            Theo dõi liên tục
          </Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
            ${selected 
              ? 'bg-white shadow text-blue-700' 
              : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-700'}`
          }>
            Thông báo & Cảnh báo
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-4">
          {/* Panel 1: Các điểm sạt lở đã phát hiện */}
          <Tab.Panel className="rounded-xl bg-white p-4 shadow">
            <LandslideList 
              landslides={landslides}
              onSelectLandslide={handleLandslideSelect}
              selectedLandslide={selectedLandslide}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
            />
          </Tab.Panel>

          {/* Panel 2: Theo dõi liên tục */}
          <Tab.Panel className="rounded-xl bg-white p-4 shadow">
            <MonitoringTable 
              areas={monitoredAreas}
              // No need to pass onUpdateArea prop since we're calling the API directly
            />
          </Tab.Panel>

          {/* Panel 3: Thông báo & Cảnh báo */}
          <Tab.Panel className="rounded-xl bg-white p-4 shadow">
            <NotificationPanel 
              settings={notificationSettings} 
              alerts={alerts} 
              onSettingsChange={handleSettingsChange}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Chi tiết khi chọn một điểm sạt lở */}
      {selectedLandslide && !showAddMonitorModal && (
        <LandslideDetail 
          landslide={selectedLandslide} 
          onClose={() => setSelectedLandslide(null)}
          onAddToMonitoring={handleAddToMonitoring}
        />
      )}

      {/* Modal thêm vào theo dõi liên tục */}
      {showAddMonitorModal && selectedLandslide && (
        <AddMonitoringModal
          landslide={selectedLandslide}
          onClose={() => setShowAddMonitorModal(false)}
          onAddMonitoring={handleCreateMonitoringArea}
        />
      )}
    </>
  );
}