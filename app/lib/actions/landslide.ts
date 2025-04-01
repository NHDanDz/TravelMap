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

// Cấu hình retry
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 300; // ms

// Kiểm tra kiểu lỗi database
function isDatabaseConnectionError(error: unknown): boolean {
  // Nếu là object
  if (error && typeof error === 'object') {
    // Kiểm tra code (ví dụ như ECONNRESET)
    if ('code' in error && typeof (error as { code: string }).code === 'string') {
      const errorCode = (error as { code: string }).code;
      if (errorCode === 'ECONNRESET') {
        return true;
      }
    }
    
    // Kiểm tra message
    if ('message' in error && typeof (error as { message: string }).message === 'string') {
      const errorMessage = (error as { message: string }).message.toLowerCase();
      return (
        errorMessage.includes('socket') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout')
      );
    }
  }
  
  return false;
}

// Hàm trợ giúp để retry các hàm gọi database khi gặp lỗi ECONNRESET
async function withRetry<T>(operation: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    console.error(`Lỗi database (còn ${retries} lần thử lại):`, error);
    
    if (retries <= 0) {
      throw error;
    }
    
    // Kiểm tra nếu là lỗi kết nối (ECONNRESET, socket hang up, timeout...)
    if (isDatabaseConnectionError(error)) {
      console.log(`⏱️ Chờ ${delay}ms trước khi thử lại...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 1.5);
    }
    
    throw error;
  }
}

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
  },
  {
    id: 'LS003',
    name: 'Đèo Ô Quý Hồ',
    coordinates: { lat: 22.3476, lng: 103.7692 },
    detectedAt: '2025-03-25T14:30:00',
    status: 'high_risk',
    details: {
      affectedArea: '1.78 km²',
      potentialImpact: 'Đường tỉnh lộ 4D',
      lastUpdate: '2025-03-31T10:15:00'
    },
    history: [
      { date: '2025-03-25', status: 'detected', note: 'Phát hiện qua ảnh vệ tinh' },
      { date: '2025-03-29', status: 'field_verified', note: 'Xác minh tại hiện trường - nguy cơ cao' }
    ]
  },
  {
    id: 'LS004',
    name: 'Thung lũng Mai Châu',
    coordinates: { lat: 20.6634, lng: 104.9964 },
    detectedAt: '2025-01-05T09:15:00',
    status: 'stabilized',
    details: {
      affectedArea: '0.75 km²',
      potentialImpact: 'Khu dân cư gần đồi',
      lastUpdate: '2025-03-20T16:45:00'
    },
    history: [
      { date: '2025-01-05', status: 'detected', note: 'Phát hiện qua ảnh vệ tinh' },
      { date: '2025-01-10', status: 'field_verified', note: 'Xác minh tại hiện trường' },
      { date: '2025-02-15', status: 'remediation', note: 'Áp dụng biện pháp gia cố' },
      { date: '2025-03-20', status: 'stabilized', note: 'Đã ổn định sau các biện pháp xử lý' }
    ]
  },
  {
    id: 'LS005',
    name: 'Đèo Ngang',
    coordinates: { lat: 18.0676, lng: 106.0225 },
    detectedAt: '2025-03-15T07:30:00',
    status: 'monitored',
    details: {
      affectedArea: '1.25 km²',
      potentialImpact: 'Đường Quốc lộ 1A đoạn qua đèo',
      lastUpdate: '2025-03-28T11:30:00'
    },
    history: [
      { date: '2025-03-15', status: 'detected', note: 'Phát hiện các vết nứt' },
      { date: '2025-03-20', status: 'field_verified', note: 'Kiểm tra hiện trường' },
      { date: '2025-03-28', status: 'monitored', note: 'Lắp đặt thiết bị quan trắc' }
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
  },
  {
    id: 'MON002',
    name: 'Thung lũng Mai Châu',
    boundingBox: { north: 20.7, south: 20.6, east: 105.1, west: 104.9 },
    createdAt: '2025-01-15T10:30:00',
    monitorFrequency: 'weekly',
    lastChecked: '2025-03-29T08:15:00',
    status: 'active',
    detectedPoints: 1,
    riskLevel: 'medium',
    landslideId: 'LS004'
  },
  {
    id: 'MON003',
    name: 'Đèo Ngang và phụ cận',
    boundingBox: { north: 18.1, south: 18.0, east: 106.1, west: 106.0 },
    createdAt: '2025-03-16T14:20:00',
    monitorFrequency: 'daily',
    lastChecked: '2025-03-31T06:00:00',
    status: 'active',
    detectedPoints: 1,
    riskLevel: 'medium',
    landslideId: 'LS005'
  }
];

const sampleAlerts: AlertType[] = [
  {
    id: '1',
    type: 'danger',
    title: 'Cảnh báo sạt lở mới',
    description: 'Phát hiện điểm sạt lở mới tại Đèo Ô Quý Hồ (ID: LS003)',
    date: '2025-03-31T10:00:00',
    landslideId: 'LS003',
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
  },
  {
    id: '3',
    type: 'info',
    title: 'Cập nhật trạng thái',
    description: 'Đã ổn định sạt lở tại Thung lũng Mai Châu',
    date: '2025-03-20T16:45:00',
    landslideId: 'LS004',
    read: true
  },
  {
    id: '4',
    type: 'success',
    title: 'Hoàn thành lắp đặt thiết bị',
    description: 'Hệ thống cảm biến đã được lắp đặt tại Đèo Ngang',
    date: '2025-03-28T12:00:00',
    landslideId: 'LS005',
    read: false
  },
  {
    id: '5',
    type: 'danger',
    title: 'Nguy cơ sạt lở cao',
    description: 'Phát hiện nhiều vết nứt mới tại Đèo Hải Vân, cần điều phối lực lượng kiểm tra ngay',
    date: '2025-03-31T08:15:00',
    landslideId: 'LS001',
    read: false
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
      : dbLandslide.history || [];
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
  const usingMockDb = !process.env.POSTGRES_URL;
  if (usingMockDb) {
    console.log('💬 Sử dụng cơ sở dữ liệu giả lập');
  }
  return usingMockDb;
};

// Tạo/cập nhật một điểm sạt lở
export async function saveLandslide(landslideData: LandslidePoint) {
  console.log(`🔄 Lưu thông tin sạt lở: ${landslideData.name} (${landslideData.id})`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Giả lập lưu thành công');
      return { success: true };
    }
    
    const dbLandslide = convertLandslideToDBFormat(landslideData);
    
    return await withRetry(async () => {
      // Kiểm tra xem điểm sạt lở đã tồn tại chưa
      const existingLandslide = await db.select().from(landslides).where(eq(landslides.id, landslideData.id));
      
      if (existingLandslide.length > 0) {
        console.log(`📝 Cập nhật điểm sạt lở: ${landslideData.name}`);
        // Cập nhật nếu đã tồn tại
        await db.update(landslides)
          .set({ 
            ...dbLandslide,
            updatedAt: new Date()
          })
          .where(eq(landslides.id, landslideData.id));
      } else {
        console.log(`➕ Thêm điểm sạt lở mới: ${landslideData.name}`);
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
          userId: 'system',
          createdAt: new Date()
        });
      }
      
      revalidatePath('/dashboard/landslides');
      console.log('✅ Lưu thành công');
      return { success: true };
    });
  } catch (error: unknown) {
    console.error('❌ Lỗi khi lưu thông tin sạt lở:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Lấy tất cả các điểm sạt lở
export async function getAllLandslides() {
  console.log('🔄 Đang lấy danh sách điểm sạt lở');
  
  try {
    if (isMockDb()) {
      console.log(`✅ Trả về ${sampleLandslides.length} điểm sạt lở mẫu`);
      return sampleLandslides;
    }
    
    return await withRetry(async () => {
      const dbLandslides = await db.select().from(landslides);
      const result = dbLandslides.map(convertDBToLandslideFormat);
      console.log(`✅ Đã lấy ${result.length} điểm sạt lở từ database`);
      return result;
    });
  } catch (error: unknown) {
    console.error('❌ Lỗi khi lấy danh sách điểm sạt lở:', error);
    console.log(`⚠️ Trả về dữ liệu mẫu do lỗi: ${sampleLandslides.length} điểm`);
    return sampleLandslides; 
  }
}

// Lấy một điểm sạt lở theo ID
export async function getLandslideById(id: string) {
  console.log(`🔄 Đang lấy thông tin điểm sạt lở ID: ${id}`);
  
  try {
    if (isMockDb()) {
      const mockLandslide = sampleLandslides.find(l => l.id === id);
      console.log(mockLandslide ? '✅ Đã tìm thấy trong dữ liệu mẫu' : '⚠️ Không tìm thấy trong dữ liệu mẫu');
      return mockLandslide || null;
    }
    
    return await withRetry(async () => {
      const dbLandslide = await db.select().from(landslides).where(eq(landslides.id, id));
      
      if (dbLandslide.length === 0) {
        console.log(`⚠️ Không tìm thấy điểm sạt lở ID: ${id}`);
        return null;
      }
      
      console.log(`✅ Đã tìm thấy điểm sạt lở ID: ${id}`);
      return convertDBToLandslideFormat(dbLandslide[0]);
    });
  } catch (error: unknown) {
    console.error(`❌ Lỗi khi lấy thông tin điểm sạt lở ID: ${id}:`, error);
    return null;
  }
}

// Xóa một điểm sạt lở
export async function deleteLandslide(id: string) {
  console.log(`🔄 Đang xóa điểm sạt lở ID: ${id}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Giả lập xóa thành công');
      return { success: true };
    }
    
    return await withRetry(async () => {
      // Xóa các cảnh báo liên quan
      await db.delete(alerts).where(eq(alerts.landslideId, id));
      console.log(`🗑️ Đã xóa các cảnh báo liên quan đến điểm sạt lở ID: ${id}`);
      
      // Xóa điểm sạt lở
      await db.delete(landslides).where(eq(landslides.id, id));
      console.log(`✅ Đã xóa điểm sạt lở ID: ${id}`);
      
      revalidatePath('/dashboard/landslides');
      return { success: true };
    });
  } catch (error: unknown) {
    console.error(`❌ Lỗi khi xóa điểm sạt lở ID: ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Lưu/cập nhật khu vực theo dõi
export async function saveMonitoringArea(areaData: MonitoringArea) {
  console.log(`🔄 Lưu khu vực theo dõi: ${areaData.name} (${areaData.id})`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Giả lập lưu thành công');
      return { success: true };
    }
    
    const dbArea = convertMonitoringAreaToDBFormat(areaData);
    
    return await withRetry(async () => {
      // Kiểm tra xem khu vực đã tồn tại chưa
      const existingArea = await db.select().from(monitoringAreas).where(eq(monitoringAreas.id, areaData.id));
      
      if (existingArea.length > 0) {
        console.log(`📝 Cập nhật khu vực theo dõi: ${areaData.name}`);
        // Cập nhật nếu đã tồn tại
        await db.update(monitoringAreas)
          .set(dbArea)
          .where(eq(monitoringAreas.id, areaData.id));
      } else {
        console.log(`➕ Thêm khu vực theo dõi mới: ${areaData.name}`);
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
          userId: 'system',
          createdAt: new Date()
        });
      }
      
      revalidatePath('/dashboard/landslides');
      console.log('✅ Lưu thành công');
      return { success: true };
    });
  } catch (error: unknown) {
    console.error('❌ Lỗi khi lưu khu vực theo dõi:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Lấy tất cả các khu vực theo dõi
export async function getAllMonitoringAreas() {
  console.log('🔄 Đang lấy danh sách khu vực theo dõi');
  
  try {
    if (isMockDb()) {
      console.log(`✅ Trả về ${sampleMonitoredAreas.length} khu vực theo dõi mẫu`);
      return sampleMonitoredAreas;
    }
    
    return await withRetry(async () => {
      const dbAreas = await db.select().from(monitoringAreas);
      const result = dbAreas.map(convertDBToMonitoringAreaFormat);
      console.log(`✅ Đã lấy ${result.length} khu vực theo dõi từ database`);
      return result;
    });
  } catch (error: unknown) {
    console.error('❌ Lỗi khi lấy danh sách khu vực theo dõi:', error);
    console.log(`⚠️ Trả về dữ liệu mẫu do lỗi: ${sampleMonitoredAreas.length} khu vực`);
    return sampleMonitoredAreas;
  }
}

// Lưu/cập nhật cài đặt thông báo
export async function saveNotificationSettings(settings: NotificationSettingsType, userId: string = 'default') {
  console.log(`🔄 Lưu cài đặt thông báo cho người dùng: ${userId}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Giả lập lưu thành công');
      return { success: true };
    }
    
    return await withRetry(async () => {
      // Kiểm tra xem cài đặt đã tồn tại chưa
      const existingSettings = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
      
      if (existingSettings.length > 0) {
        console.log(`📝 Cập nhật cài đặt thông báo cho người dùng: ${userId}`);
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
        console.log(`➕ Thêm cài đặt thông báo mới cho người dùng: ${userId}`);
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
      console.log('✅ Lưu thành công');
      return { success: true };
    });
  } catch (error: unknown) {
    console.error('❌ Lỗi khi lưu cài đặt thông báo:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Lấy cài đặt thông báo của người dùng
export async function getNotificationSettings(userId: string = 'default') {
  console.log(`🔄 Đang lấy cài đặt thông báo cho người dùng: ${userId}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Trả về cài đặt thông báo mẫu');
      return sampleNotificationSettings;
    }
    
    return await withRetry(async () => {
      const dbSettings = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
      
      if (dbSettings.length === 0) {
        console.log(`⚠️ Không tìm thấy cài đặt thông báo cho người dùng: ${userId}, trả về mặc định`);
        return sampleNotificationSettings;
      }
      
      console.log(`✅ Đã lấy cài đặt thông báo cho người dùng: ${userId}`);
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
    });
  } catch (error: unknown) {
    console.error('❌ Lỗi khi lấy cài đặt thông báo:', error);
    console.log('⚠️ Trả về cài đặt thông báo mẫu do lỗi');
    return sampleNotificationSettings;
  }
}

// Lấy tất cả các cảnh báo
export async function getAllAlerts(userId: string = 'default') {
  console.log(`🔄 Đang lấy danh sách cảnh báo cho người dùng: ${userId}`);
  
  try {
    if (isMockDb()) {
      console.log(`✅ Trả về ${sampleAlerts.length} cảnh báo mẫu`);
      return sampleAlerts;
    }
    
    return await withRetry(async () => {
      const dbAlerts = await db.select().from(alerts)
        .where(eq(alerts.userId, userId))
        .orderBy(alerts.date);
      
      const result = dbAlerts.map((alert: any) => ({
        id: alert.id.toString(),
        type: alert.type,
        title: alert.title,
        description: alert.description,
        date: alert.date.toISOString(),
        landslideId: alert.landslideId,
        monitoringAreaId: alert.monitoringAreaId,
        read: alert.read
      })) as AlertType[];
      
      console.log(`✅ Đã lấy ${result.length} cảnh báo từ database`);
      return result;
    });
  } catch (error: unknown) {
    console.error('❌ Lỗi khi lấy danh sách cảnh báo:', error);
    console.log(`⚠️ Trả về dữ liệu mẫu do lỗi: ${sampleAlerts.length} cảnh báo`);
    return sampleAlerts;
  }
}

// Đánh dấu cảnh báo đã đọc
export async function markAlertAsRead(alertId: number) {
  console.log(`🔄 Đánh dấu đã đọc cảnh báo ID: ${alertId}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Giả lập đánh dấu thành công');
      return { success: true };
    }
    
    return await withRetry(async () => {
      await db.update(alerts)
        .set({ read: true })
        .where(eq(alerts.id, alertId));
      
      console.log(`✅ Đã đánh dấu đã đọc cảnh báo ID: ${alertId}`);
      revalidatePath('/dashboard/landslides');
      return { success: true };
    });
  } catch (error) {
    console.error(`❌ Lỗi khi đánh dấu đã đọc cảnh báo ID: ${alertId}:`, error);
    return { success: false, error };
  }
}

// Tạo một cảnh báo mới
export async function createAlert(alertData: Omit<AlertType, 'id'>) {
  console.log(`🔄 Tạo cảnh báo mới: ${alertData.title}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Giả lập tạo thành công');
      return { success: true };
    }
    
    return await withRetry(async () => {
      await db.insert(alerts).values({
        type: alertData.type,
        title: alertData.title,
        description: alertData.description,
        date: new Date(alertData.date),
        landslideId: alertData.landslideId,
        monitoringAreaId: alertData.monitoringAreaId,
        read: alertData.read,
        userId: 'default',
        createdAt: new Date()
      });
      
      console.log(`✅ Đã tạo cảnh báo mới: ${alertData.title}`);
      revalidatePath('/dashboard/landslides');
      return { success: true };
    });
  } catch (error) {
    console.error('❌ Lỗi khi tạo cảnh báo:', error);
    return { success: false, error };
  }
}