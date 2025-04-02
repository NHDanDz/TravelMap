// app/dashboard/landslides/LandslidesContent.tsx
'use client';
import { Toaster } from 'react-hot-toast';

import { useEffect, useState } from 'react';
import LandslideTabs from './components/LandslideTabs';
import { 
  getAllLandslides, 
  getAllMonitoringAreas, 
  getNotificationSettings, 
  getAllAlerts,
  saveLandslide,
  saveMonitoringArea,
  saveNotificationSettings
} from '@/app/lib/actions/landslide';
import { 
  LandslidePoint, 
  MonitoringArea, 
  NotificationSettings, 
  Alert 
} from '@/app/lib/types/landslide';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';

// Sample data for testing (will be replaced with real data from database)
const sampleLandslides: LandslidePoint[] = [
  {
    id: 'LS001',
    name: 'Đèo Hải Vân',
    coordinates: { lat: 16.2185, lng: 108.1155 },
    detectedAt: '2025-02-15T08:30:00',
    status: 'high_risk',
    details: {
      affectedArea: '2.35 km²',
      potentialImpact: 'Đường Quốc lộ 1A',
      lastUpdate: '2025-03-30T14:22:00'
    },
    history: [
      { date: '2025-02-15', status: 'detected', note: 'Phát hiện ban đầu' },
      { date: '2025-02-20', status: 'field_verified', note: 'Xác minh tại hiện trường' },
      { date: '2025-03-15', status: 'monitored', note: 'Tăng diện tích ảnh hưởng 15%' }
    ]
  },
  // Thêm các điểm sạt lở mẫu khác nếu cần
];

const sampleMonitoredAreas: MonitoringArea[] = [
  {
    id: 'MON001',
    name: 'Khu vực Sa Pa',
    boundingBox: { north: 22.4, south: 22.2, east: 103.9, west: 103.6 },
    createdAt: '2025-01-10T08:00:00',
    monitorFrequency: 'daily',
    lastChecked: '2025-03-31T00:00:00',
    status: 'active',
    detectedPoints: 2,
    riskLevel: 'high'
  },
  // Thêm các khu vực theo dõi mẫu khác nếu cần
];

const sampleNotificationSettings: NotificationSettings = {
  email: true,
  emailAddress: 'admin@example.com',
  sms: false,
  phoneNumber: '',
  threshold: 'medium',
  updateFrequency: 'daily',
  weatherForecast: true,
  autoMonitor: false,
  monthlyReport: true
};

const sampleAlerts: Alert[] = [
  {
    id: '1',
    type: 'danger',
    title: 'Cảnh báo sạt lở mới',
    description: 'Phát hiện điểm sạt lở mới tại Đèo Ô Quý Hồ (ID: LS004)',
    date: '2025-03-31T10:00:00',
    landslideId: 'LS004',
    read: false
  },
  // Thêm các cảnh báo mẫu khác nếu cần
];

export default function LandslidesContent() {
  const [landslides, setLandslides] = useState<LandslidePoint[]>([]);
  const [monitoredAreas, setMonitoredAreas] = useState<MonitoringArea[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(sampleNotificationSettings);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from database
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch real data from database using server actions
        const [
          fetchedLandslides,
          fetchedMonitoredAreas,
          fetchedSettings,
          fetchedAlerts
        ] = await Promise.all([
          getAllLandslides(),
          getAllMonitoringAreas(),
          getNotificationSettings(),
          getAllAlerts()
        ]);
        
        // If there's data in the database, use it; otherwise, use sample data for demo
        setLandslides(fetchedLandslides.length > 0 ? fetchedLandslides : sampleLandslides);
        setMonitoredAreas(fetchedMonitoredAreas.length > 0 ? fetchedMonitoredAreas : sampleMonitoredAreas);
        setNotificationSettings(fetchedSettings || sampleNotificationSettings);
        setAlerts(fetchedAlerts.length > 0 ? fetchedAlerts : sampleAlerts);
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // Fallback to sample data if there's an error
        setLandslides(sampleLandslides);
        setMonitoredAreas(sampleMonitoredAreas);
        setNotificationSettings(sampleNotificationSettings);
        setAlerts(sampleAlerts);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Handler for saving landslide
  const handleSaveLandslide = async (landslide: LandslidePoint) => {
    // Call server action to save landslide
    const { success } = await saveLandslide(landslide);
    
    if (success) {
      // Update local state
      setLandslides(prev => {
        const index = prev.findIndex(l => l.id === landslide.id);
        if (index >= 0) {
          // Update existing landslide
          const updated = [...prev];
          updated[index] = landslide;
          return updated;
        } else {
          // Add new landslide
          return [...prev, landslide];
        }
      });
    }
    
    return success;
  };

  // Handler for saving monitoring area
  const handleSaveMonitoringArea = async (area: MonitoringArea) => {
    // Call server action to save monitoring area
    const { success } = await saveMonitoringArea(area);
    
    if (success) {
      // Update local state
      setMonitoredAreas(prev => {
        const index = prev.findIndex(a => a.id === area.id);
        if (index >= 0) {
          // Update existing area
          const updated = [...prev];
          updated[index] = area;
          return updated;
        } else {
          // Add new area
          return [...prev, area];
        }
      });
    }
    
    return success;
  };

  // Handler for saving notification settings
  const handleSaveNotificationSettings = async (settings: NotificationSettings) => {
    // Call server action to save notification settings
    const { success } = await saveNotificationSettings(settings);
    
    if (success) {
      // Update local state
      setNotificationSettings(settings);
    }
    
    // No return value needed for void promise
  };

  if (isLoading) {
    return <div className="p-4 rounded-lg bg-gray-50 animate-pulse h-96"></div>;
  }

  return (
    <>
    <DashboardLayout>
      <LandslideTabs
        initialLandslides={landslides}
        initialMonitoredAreas={monitoredAreas}
        initialNotificationSettings={notificationSettings}
        initialAlerts={alerts}
        onSaveLandslide={handleSaveLandslide}
        onSaveMonitoringArea={handleSaveMonitoringArea}
        onSaveNotificationSettings={handleSaveNotificationSettings}
      />
    </DashboardLayout>
    <Toaster position="top-right" />

    </>
  );
}