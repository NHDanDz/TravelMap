// app/lib/actions/landslide.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '../db';
import { landslides, monitoringAreas, alerts, notificationSettings } from '../db/schema';
import { v4 as uuidv4 } from 'uuid';
import { 
  LandslidePoint, 
  MonitoringArea, 
  NotificationSettings as NotificationSettingsType,
  Alert as AlertType
} from '../types/landslide';
import { eq } from 'drizzle-orm';

// Sample data for when database is not available
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
  {
    id: 'LS002',
    name: 'Thác Bạc, Sa Pa',
    coordinates: { lat: 22.3545, lng: 103.7778 },
    detectedAt: '2025-03-10T11:45:00',
    status: 'active',
    details: {
      affectedArea: '1.15 km²',
      potentialImpact: 'Khu du lịch Thác Bạc',
      lastUpdate: '2025-03-28T09:10:00'
    },
    history: [
      { date: '2025-03-10', status: 'detected', note: 'Phát hiện ban đầu' },
      { date: '2025-03-15', status: 'field_verified', note: 'Xác minh tại hiện trường' }
    ]
  }
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
  }
];

const sampleAlerts: AlertType[] = [
  {
    id: '1',
    type: 'danger',
    title: 'Cảnh báo sạt lở mới',
    description: 'Phát hiện điểm sạt lở mới tại Đèo Ô Quý Hồ (ID: LS004)',
    date: '2025-03-31T10:00:00',
    landslideId: 'LS004',
    read: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Mưa lớn tại khu vực theo dõi',
    description: 'Dự báo mưa lớn tại Sa Pa trong 24 giờ tới',
    date: '2025-03-30T16:30:00',
    monitoringAreaId: 'MON001',
    read: true
  }
];

const sampleNotificationSettings: NotificationSettingsType = {
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

// Chuyển đổi đối tượng LandslidePoint thành định dạng database
function convertLandslideToDBFormat(landslide: LandslidePoint) {
  return {
    id: landslide.id,
    name: landslide.name,
    lat: landslide.coordinates.lat.toString(),
    lng: landslide.coordinates.lng.toString(),
    detectedAt: new Date(landslide.detectedAt),
    status: landslide.status,
    affectedArea: landslide.details.affectedArea,
    potentialImpact: landslide.details.potentialImpact,
    lastUpdate: new Date(landslide.details.lastUpdate),
    history: JSON.stringify(landslide.history),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Chuyển đổi từ định dạng database sang LandslidePoint
function convertDBToLandslideFormat(dbLandslide: any): LandslidePoint {
  let parsedHistory;
  try {
    parsedHistory = typeof dbLandslide.history === 'string' 
      ? JSON.parse(dbLandslide.history) 
      : dbLandslide.history;
  } catch (e) {
    console.error('Error parsing history:', e);
    parsedHistory = [];
  }
  
  return {
    id: dbLandslide.id,
    name: dbLandslide.name,
    coordinates: {
      lat: parseFloat(dbLandslide.lat),
      lng: parseFloat(dbLandslide.lng)
    },
    detectedAt: dbLandslide.detected_at?.toISOString() || dbLandslide.detectedAt?.toISOString(),
    status: dbLandslide.status,
    details: {
      affectedArea: dbLandslide.affected_area || dbLandslide.affectedArea || '',
      potentialImpact: dbLandslide.potential_impact || dbLandslide.potentialImpact || '',
      lastUpdate: dbLandslide.last_update?.toISOString() || dbLandslide.lastUpdate?.toISOString()
    },
    history: parsedHistory
  };
}

// Chuyển đổi đối tượng MonitoringArea thành định dạng database
function convertMonitoringAreaToDBFormat(area: MonitoringArea) {
  return {
    id: area.id,
    name: area.name,
    northBound: area.boundingBox.north.toString(),
    southBound: area.boundingBox.south.toString(),
    eastBound: area.boundingBox.east.toString(),
    westBound: area.boundingBox.west.toString(),
    createdAt: new Date(area.createdAt),
    monitorFrequency: area.monitorFrequency,
    lastChecked: new Date(area.lastChecked),
    status: area.status,
    detectedPoints: area.detectedPoints,
    riskLevel: area.riskLevel,
    landslideId: area.landslideId,
    autoVerify: area.autoVerify
  };
}

// Chuyển đổi từ định dạng database sang MonitoringArea
function convertDBToMonitoringAreaFormat(dbArea: any): MonitoringArea {
  return {
    id: dbArea.id,
    name: dbArea.name,
    boundingBox: {
      north: parseFloat(dbArea.north_bound || dbArea.northBound),
      south: parseFloat(dbArea.south_bound || dbArea.southBound),
      east: parseFloat(dbArea.east_bound || dbArea.eastBound),
      west: parseFloat(dbArea.west_bound || dbArea.westBound)
    },
    createdAt: dbArea.created_at?.toISOString() || dbArea.createdAt?.toISOString(),
    monitorFrequency: dbArea.monitor_frequency || dbArea.monitorFrequency,
    lastChecked: dbArea.last_checked?.toISOString() || dbArea.lastChecked?.toISOString(),
    status: dbArea.status,
    detectedPoints: dbArea.detected_points || dbArea.detectedPoints,
    riskLevel: dbArea.risk_level || dbArea.riskLevel,
    landslideId: dbArea.landslide_id || dbArea.landslideId,
    autoVerify: dbArea.auto_verify || dbArea.autoVerify
  };
}

// Helper to check if we're using the mock database
const isMockDb = () => {
  return !process.env.POSTGRES_URL;
};

// Tạo/cập nhật một điểm sạt lở
export async function saveLandslide(landslideData: LandslidePoint) {
  try {
    if (isMockDb()) {
      console.log('Using mock database, simulating successful save');
      return { success: true };
    }
    
    const dbLandslide = convertLandslideToDBFormat(landslideData);
    
    // Kiểm tra xem điểm sạt lở đã tồn tại chưa
    const existingLandslide = await db.select().from(landslides).where(eq(landslides.id, landslideData.id));
    
    if (existingLandslide.length > 0) {
      // Cập nhật nếu đã tồn tại
      await db.update(landslides)
        .set({ 
          ...dbLandslide,
          updatedAt: new Date()
        })
        .where(eq(landslides.id, landslideData.id));
    } else {
      // Thêm mới nếu chưa tồn tại
      await db.insert(landslides).values(dbLandslide);
      
      // Tạo cảnh báo cho sạt lở mới
      await db.insert(alerts).values({
        type: 'danger',
        title: 'Cảnh báo sạt lở mới',
        description: `Phát hiện điểm sạt lở mới tại ${landslideData.name} (ID: ${landslideData.id})`,
        date: new Date(),
        landslideId: landslideData.id,
        read: false,
        userId: 'system', // Hoặc một userId cụ thể
        createdAt: new Date()
      });
    }
    
    revalidatePath('/dashboard/landslides');
    return { success: true };
  } catch (error) {
    console.error('Error saving landslide:', error);
    return { success: false, error };
  }
}

// Lấy tất cả các điểm sạt lở
export async function getAllLandslides() {
  try {
    if (isMockDb()) {
      console.log('Using mock database, returning sample landslides');
      return sampleLandslides;
    }
    
    const dbLandslides = await db.select().from(landslides);
    return dbLandslides.map(convertDBToLandslideFormat);
  } catch (error) {
    console.error('Error getting all landslides:', error);
    return sampleLandslides; // Return sample data on error
  }
}

// Lấy một điểm sạt lở theo ID
export async function getLandslideById(id: string) {
  try {
    if (isMockDb()) {
      const mockLandslide = sampleLandslides.find(l => l.id === id);
      return mockLandslide || null;
    }
    
    const dbLandslide = await db.select().from(landslides).where(eq(landslides.id, id));
    
    if (dbLandslide.length === 0) {
      return null;
    }
    
    return convertDBToLandslideFormat(dbLandslide[0]);
  } catch (error) {
    console.error(`Error getting landslide with ID ${id}:`, error);
    return null;
  }
}

// Xóa một điểm sạt lở
export async function deleteLandslide(id: string) {
  try {
    if (isMockDb()) {
      console.log('Using mock database, simulating successful delete');
      return { success: true };
    }
    
    // Xóa các cảnh báo liên quan
    await db.delete(alerts).where(eq(alerts.landslideId, id));
    
    // Xóa điểm sạt lở
    await db.delete(landslides).where(eq(landslides.id, id));
    
    revalidatePath('/dashboard/landslides');
    return { success: true };
  } catch (error) {
    console.error(`Error deleting landslide with ID ${id}:`, error);
    return { success: false, error };
  }
}

// Lưu/cập nhật khu vực theo dõi
export async function saveMonitoringArea(areaData: MonitoringArea) {
  try {
    if (isMockDb()) {
      console.log('Using mock database, simulating successful save');
      return { success: true };
    }
    
    const dbArea = convertMonitoringAreaToDBFormat(areaData);
    
    // Kiểm tra xem khu vực đã tồn tại chưa
    const existingArea = await db.select().from(monitoringAreas).where(eq(monitoringAreas.id, areaData.id));
    
    if (existingArea.length > 0) {
      // Cập nhật nếu đã tồn tại
      await db.update(monitoringAreas)
        .set(dbArea)
        .where(eq(monitoringAreas.id, areaData.id));
    } else {
      // Thêm mới nếu chưa tồn tại
      await db.insert(monitoringAreas).values(dbArea);
      
      // Tạo cảnh báo cho khu vực theo dõi mới
      await db.insert(alerts).values({
        type: 'info',
        title: 'Khu vực mới được giám sát',
        description: `Khu vực ${areaData.name} (${areaData.id}) đã được thêm vào danh sách theo dõi liên tục.`,
        date: new Date(),
        monitoringAreaId: areaData.id,
        read: false,
        userId: 'system', // Hoặc một userId cụ thể
        createdAt: new Date()
      });
    }
    
    revalidatePath('/dashboard/landslides');
    return { success: true };
  } catch (error) {
    console.error('Error saving monitoring area:', error);
    return { success: false, error };
  }
}

// Lấy tất cả các khu vực theo dõi
export async function getAllMonitoringAreas() {
  try {
    if (isMockDb()) {
      console.log('Using mock database, returning sample monitoring areas');
      return sampleMonitoredAreas;
    }
    
    const dbAreas = await db.select().from(monitoringAreas);
    return dbAreas.map(convertDBToMonitoringAreaFormat);
  } catch (error) {
    console.error('Error getting all monitoring areas:', error);
    return sampleMonitoredAreas; // Return sample data on error
  }
}

// Lưu/cập nhật cài đặt thông báo
export async function saveNotificationSettings(settings: NotificationSettingsType, userId: string = 'default') {
  try {
    if (isMockDb()) {
      console.log('Using mock database, simulating successful save');
      return { success: true };
    }
    
    // Kiểm tra xem cài đặt đã tồn tại chưa
    const existingSettings = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
    
    if (existingSettings.length > 0) {
      // Cập nhật nếu đã tồn tại
      await db.update(notificationSettings)
        .set({
          email: settings.email,
          emailAddress: settings.emailAddress,
          sms: settings.sms,
          phoneNumber: settings.phoneNumber,
          threshold: settings.threshold,
          updateFrequency: settings.updateFrequency,
          weatherForecast: settings.weatherForecast,
          autoMonitor: settings.autoMonitor,
          monthlyReport: settings.monthlyReport,
          updatedAt: new Date()
        })
        .where(eq(notificationSettings.userId, userId));
    } else {
      // Thêm mới nếu chưa tồn tại
      await db.insert(notificationSettings).values({
        userId,
        email: settings.email,
        emailAddress: settings.emailAddress,
        sms: settings.sms,
        phoneNumber: settings.phoneNumber,
        threshold: settings.threshold,
        updateFrequency: settings.updateFrequency,
        weatherForecast: settings.weatherForecast,
        autoMonitor: settings.autoMonitor,
        monthlyReport: settings.monthlyReport,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    revalidatePath('/dashboard/landslides');
    return { success: true };
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return { success: false, error };
  }
}

// Lấy cài đặt thông báo của người dùng
export async function getNotificationSettings(userId: string = 'default') {
  try {
    if (isMockDb()) {
      console.log('Using mock database, returning sample notification settings');
      return sampleNotificationSettings;
    }
    
    const dbSettings = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
    
    if (dbSettings.length === 0) {
      // Trả về cài đặt mặc định nếu không tìm thấy
      return sampleNotificationSettings;
    }
    
    const settings = dbSettings[0];
    
    return {
      email: settings.email,
      emailAddress: settings.emailAddress,
      sms: settings.sms,
      phoneNumber: settings.phoneNumber,
      threshold: settings.threshold,
      updateFrequency: settings.updateFrequency,
      weatherForecast: settings.weatherForecast,
      autoMonitor: settings.autoMonitor,
      monthlyReport: settings.monthlyReport
    } as NotificationSettingsType;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    
    // Trả về cài đặt mặc định nếu có lỗi
    return sampleNotificationSettings;
  }
}

// Lấy tất cả các cảnh báo
// Lấy tất cả các cảnh báo
export async function getAllAlerts(userId: string = 'default') {
    try {
      if (isMockDb()) {
        console.log('Using mock database, returning sample alerts');
        return sampleAlerts;
      }
      
      const dbAlerts = await db.select().from(alerts)
        .where(eq(alerts.userId, userId))
        .orderBy(alerts.date);
      
      // Thêm kiểu dữ liệu tường minh cho tham số alert
      return dbAlerts.map((alert: any) => ({
        id: alert.id.toString(),
        type: alert.type,
        title: alert.title,
        description: alert.description,
        date: alert.date.toISOString(),
        landslideId: alert.landslideId,
        monitoringAreaId: alert.monitoringAreaId,
        read: alert.read
      })) as AlertType[];
    } catch (error) {
      console.error('Error getting all alerts:', error);
      return sampleAlerts; // Return sample data on error
    }
  }

// Đánh dấu cảnh báo đã đọc
export async function markAlertAsRead(alertId: number) {
  try {
    if (isMockDb()) {
      console.log('Using mock database, simulating successful update');
      return { success: true };
    }
    
    await db.update(alerts)
      .set({ read: true })
      .where(eq(alerts.id, alertId));
    
    revalidatePath('/dashboard/landslides');
    return { success: true };
  } catch (error) {
    console.error(`Error marking alert ${alertId} as read:`, error);
    return { success: false, error };
  }
}

// Tạo một cảnh báo mới
export async function createAlert(alertData: Omit<AlertType, 'id'>) {
  try {
    if (isMockDb()) {
      console.log('Using mock database, simulating successful create');
      return { success: true };
    }
    
    await db.insert(alerts).values({
      type: alertData.type,
      title: alertData.title,
      description: alertData.description,
      date: new Date(alertData.date),
      landslideId: alertData.landslideId,
      monitoringAreaId: alertData.monitoringAreaId,
      read: alertData.read,
      userId: 'default', // Hoặc một userId cụ thể
      createdAt: new Date()
    });
    
    revalidatePath('/dashboard/landslides');
    return { success: true };
  } catch (error) {
    console.error('Error creating alert:', error);
    return { success: false, error };
  }
}