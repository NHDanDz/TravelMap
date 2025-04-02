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
import { eq, and } from 'drizzle-orm';

// Configuration for retries
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 300; // ms

// Check for database connection error types
function isDatabaseConnectionError(error: unknown): boolean {
  // If it's an object
  if (error && typeof error === 'object') {
    // Check for code (e.g., ECONNRESET)
    if ('code' in error && typeof (error as { code: string }).code === 'string') {
      const errorCode = (error as { code: string }).code;
      if (errorCode === 'ECONNRESET') {
        return true;
      }
    }
    
    // Check for message
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

// Helper function to retry database operations when encountering ECONNRESET errors
async function withRetry<T>(operation: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    console.error(`Database error (${retries} retries left):`, error);
    
    if (retries <= 0) {
      throw error;
    }
    
    // Check if it's a connection error (ECONNRESET, socket hang up, timeout...)
    if (isDatabaseConnectionError(error)) {
      console.log(`⏱️ Waiting ${delay}ms before retrying...`);
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
  // Additional samples...
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
  // Additional samples...
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
  // Additional samples...
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

// Convert LandslidePoint object to database format
function convertLandslideToDBFormat(landslide: LandslidePoint) {
  return {
    id: landslide.id,
    name: landslide.name,
    lat: landslide.coordinates.lat.toString(),
    lng: landslide.coordinates.lng.toString(),
    first_detected_at: new Date(landslide.detectedAt),
    status: landslide.status,
    affected_area: landslide.details.affectedArea,
    potential_impact: landslide.details.potentialImpact,
    last_update: new Date(landslide.details.lastUpdate),
    history: JSON.stringify(landslide.history),
    created_at: new Date(),
    updated_at: new Date()
  };
}

// Convert from database format to LandslidePoint
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
  
  // Handle column name discrepancies between schema and actual DB
  return {
    id: dbLandslide.id,
    name: dbLandslide.name,
    coordinates: {
      lat: parseFloat(dbLandslide.lat),
      lng: parseFloat(dbLandslide.lng)
    },
    // Handle column name differences: first_detected_at vs detected_at
    detectedAt: dbLandslide.first_detected_at?.toISOString() || 
                dbLandslide.detected_at?.toISOString() || 
                new Date().toISOString(),
    status: dbLandslide.status,
    details: {
      affectedArea: dbLandslide.affected_area || dbLandslide.affectedArea || '',
      potentialImpact: dbLandslide.potential_impact || dbLandslide.potentialImpact || '',
      lastUpdate: dbLandslide.last_update?.toISOString() || 
                  dbLandslide.lastUpdate?.toISOString() || 
                  new Date().toISOString()
    },
    history: parsedHistory
  };
}

// Convert MonitoringArea object to database format
// Convert MonitoringArea object to database format
function convertMonitoringAreaToDBFormat(area: MonitoringArea) {
  return {
    id: area.id,
    name: area.name,
    northBound: area.boundingBox.north.toString(),  // Use camelCase to match schema
    southBound: area.boundingBox.south.toString(),  // Use camelCase to match schema
    eastBound: area.boundingBox.east.toString(),    // Use camelCase to match schema
    westBound: area.boundingBox.west.toString(),    // Use camelCase to match schema
    createdAt: new Date(area.createdAt),            // Use camelCase to match schema
    monitorFrequency: area.monitorFrequency,
    lastChecked: new Date(area.lastChecked),        // Use camelCase to match schema
    status: area.status,
    detectedPoints: area.detectedPoints,           // Use camelCase to match schema
    riskLevel: area.riskLevel,                     // Use camelCase to match schema
    landslideId: area.landslideId,                 // Use camelCase to match schema
    autoVerify: area.autoVerify                    // Use camelCase to match schema
  };
}
// Convert from database format to MonitoringArea
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
    console.log('💬 Using mock database');
  }
  return usingMockDb;
};

// Create/update a landslide point
export async function saveLandslide(landslideData: LandslidePoint) {
  console.log(`🔄 Saving landslide information: ${landslideData.name} (${landslideData.id})`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Mock save successful');
      return { success: true };
    }
    
    const dbLandslide = convertLandslideToDBFormat(landslideData);
    
    return await withRetry(async () => {
      // Check if the landslide point already exists
      const existingLandslide = await db.select().from(landslides).where(eq(landslides.id, landslideData.id));
      
      if (existingLandslide.length > 0) {
        console.log(`📝 Updating landslide point: ${landslideData.name}`);
        // Update if it already exists
        await db.update(landslides)
          .set({ 
            ...dbLandslide,
            updated_at: new Date()
          })
          .where(eq(landslides.id, landslideData.id));
      } else {
        console.log(`➕ Adding new landslide point: ${landslideData.name}`);
        // Add new if it doesn't exist
        await db.insert(landslides).values(dbLandslide);
        
        // Create an alert for the new landslide
        await db.insert(alerts).values({
          type: 'danger',
          title: 'Cảnh báo sạt lở mới',
          description: `Phát hiện điểm sạt lở mới tại ${landslideData.name} (ID: ${landslideData.id})`,
          date: new Date(),
          landslide_id: landslideData.id,
          read: false,
          user_id: 'system',
          created_at: new Date()
        });
      }
      
      revalidatePath('/dashboard/landslides');
      console.log('✅ Save successful');
      return { success: true };
    });
  } catch (error: unknown) {
    console.error('❌ Error saving landslide information:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Get all landslide points
export async function getAllLandslides() {
  console.log('🔄 Retrieving landslide list');
  
  try {
    if (isMockDb()) {
      console.log(`✅ Returning ${sampleLandslides.length} sample landslide points`);
      return sampleLandslides;
    }
    
    return await withRetry(async () => {
      const dbLandslides = await db.select().from(landslides);
      const result = dbLandslides.map(convertDBToLandslideFormat);
      console.log(`✅ Retrieved ${result.length} landslide points from database`);
      return result;
    });
  } catch (error: unknown) {
    console.error('❌ Error retrieving landslide list:', error);
    console.log(`⚠️ Returning sample data due to error: ${sampleLandslides.length} points`);
    return sampleLandslides; 
  }
}

// Get a landslide point by ID
export async function getLandslideById(id: string) {
  console.log(`🔄 Retrieving landslide point info ID: ${id}`);
  
  try {
    if (isMockDb()) {
      const mockLandslide = sampleLandslides.find(l => l.id === id);
      console.log(mockLandslide ? '✅ Found in sample data' : '⚠️ Not found in sample data');
      return mockLandslide || null;
    }
    
    return await withRetry(async () => {
      const dbLandslide = await db.select().from(landslides).where(eq(landslides.id, id));
      
      if (dbLandslide.length === 0) {
        console.log(`⚠️ Landslide point not found ID: ${id}`);
        return null;
      }
      
      console.log(`✅ Found landslide point ID: ${id}`);
      return convertDBToLandslideFormat(dbLandslide[0]);
    });
  } catch (error: unknown) {
    console.error(`❌ Error retrieving landslide point info ID: ${id}:`, error);
    return null;
  }
}

// Delete a landslide point
export async function deleteLandslide(id: string) {
  console.log(`🔄 Deleting landslide point ID: ${id}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Mock delete successful');
      return { success: true };
    }
    
    return await withRetry(async () => {
      // Delete related alerts first
      await db.delete(alerts).where(eq(alerts.landslideId, id));
      console.log(`🗑️ Deleted alerts related to landslide point ID: ${id}`);
      
      // Delete the landslide point
      await db.delete(landslides).where(eq(landslides.id, id));
      console.log(`✅ Deleted landslide point ID: ${id}`);
      
      revalidatePath('/dashboard/landslides');
      return { success: true };
    });
  } catch (error: unknown) {
    console.error(`❌ Error deleting landslide point ID: ${id}:`, error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Save/update monitoring area
export async function saveMonitoringArea(areaData: MonitoringArea) {
  console.log(`🔄 Saving monitoring area: ${areaData.name} (${areaData.id})`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Mock save successful');
      return { success: true };
    }
    
    // Validate that boundingBox values exist
    if (!areaData.boundingBox || 
        areaData.boundingBox.north === undefined || 
        areaData.boundingBox.south === undefined ||
        areaData.boundingBox.east === undefined ||
        areaData.boundingBox.west === undefined) {
      console.error('❌ Invalid boundingBox data:', areaData.boundingBox);
      return { 
        success: false, 
        error: 'Missing boundingBox coordinates'
      };
    }
    
    const dbArea = convertMonitoringAreaToDBFormat(areaData);
    
    // Log the converted data to verify it's correct
    console.log('Converting to DB format:', dbArea);
    
    return await withRetry(async () => {
      // Check if the area already exists
      const existingArea = await db.select().from(monitoringAreas).where(eq(monitoringAreas.id, areaData.id));
      
      if (existingArea.length > 0) {
        console.log(`📝 Updating monitoring area: ${areaData.name}`);
        // Update if it already exists
        await db.update(monitoringAreas)
          .set(dbArea)
          .where(eq(monitoringAreas.id, areaData.id));
      } else {
        console.log(`➕ Adding new monitoring area: ${areaData.name}`);
        // Add new if it doesn't exist
        await db.insert(monitoringAreas).values(dbArea);
        
        // Create an alert for the new monitoring area
        await db.insert(alerts).values({
          type: 'info',
          title: 'New area being monitored',
          description: `Area ${areaData.name} (${areaData.id}) has been added to the continuous monitoring list.`,
          date: new Date(),
          monitoringAreaId: areaData.id,
          read: false,
          userId: 'system',  // Thêm giá trị mặc định 'system' cho userId
          createdAt: new Date()
        });
      }
      
      revalidatePath('/dashboard/landslides');
      console.log('✅ Save successful');
      return { success: true };
    });
  } catch (error: unknown) {
    console.error('❌ Error saving monitoring area:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Get all monitoring areas
export async function getAllMonitoringAreas() {
  console.log('🔄 Retrieving monitoring area list');
  
  try {
    if (isMockDb()) {
      console.log(`✅ Returning ${sampleMonitoredAreas.length} sample monitoring areas`);
      return sampleMonitoredAreas;
    }
    
    return await withRetry(async () => {
      const dbAreas = await db.select().from(monitoringAreas);
      const result = dbAreas.map(convertDBToMonitoringAreaFormat);
      console.log(`✅ Retrieved ${result.length} monitoring areas from database`);
      return result;
    });
  } catch (error: unknown) {
    console.error('❌ Error retrieving monitoring area list:', error);
    console.log(`⚠️ Returning sample data due to error: ${sampleMonitoredAreas.length} areas`);
    return sampleMonitoredAreas;
  }
}

// Save/update notification settings
export async function saveNotificationSettings(settings: NotificationSettingsType, userId: string = 'default') {
  console.log(`🔄 Saving notification settings for user: ${userId}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Mock save successful');
      return { success: true };
    }
    
    return await withRetry(async () => {
      // Check if settings already exist
      const existingSettings = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
      
      if (existingSettings.length > 0) {
        console.log(`📝 Updating notification settings for user: ${userId}`);
        // Update if they already exist
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
        console.log(`➕ Adding new notification settings for user: ${userId}`);
        // Add new if they don't exist
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
      console.log('✅ Save successful');
      return { success: true };
    });
  } catch (error: unknown) {
    console.error('❌ Error saving notification settings:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Get notification settings for a user
export async function getNotificationSettings(userId: string = 'default') {
  console.log(`🔄 Retrieving notification settings for user: ${userId}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Returning sample notification settings');
      return sampleNotificationSettings;
    }
    
    return await withRetry(async () => {
      const dbSettings = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
      
      if (dbSettings.length === 0) {
        console.log(`⚠️ Notification settings not found for user: ${userId}, returning defaults`);
        return sampleNotificationSettings;
      }
      
      console.log(`✅ Retrieved notification settings for user: ${userId}`);
      const settings = dbSettings[0];
      
      return {
        email: settings.email,
        emailAddress: settings.email_address,
        sms: settings.sms,
        phoneNumber: settings.phone_number,
        threshold: settings.threshold,
        updateFrequency: settings.update_frequency,
        weatherForecast: settings.weather_forecast,
        autoMonitor: settings.auto_monitor,
        monthlyReport: settings.monthly_report
      } as NotificationSettingsType;
    });
  } catch (error: unknown) {
    console.error('❌ Error retrieving notification settings:', error);
    console.log('⚠️ Returning sample notification settings due to error');
    return sampleNotificationSettings;
  }
}

// Get all alerts
export async function getAllAlerts(userId: string = 'default') {
  console.log(`🔄 Retrieving alert list for user: ${userId}`);
  
  try {
    if (isMockDb()) {
      console.log(`✅ Returning ${sampleAlerts.length} sample alerts`);
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
        landslideId: alert.landslide_id,
        monitoringAreaId: alert.monitoring_area_id,
        read: alert.read
      })) as AlertType[];
      
      console.log(`✅ Retrieved ${result.length} alerts from database`);
      return result;
    });
  } catch (error: unknown) {
    console.error('❌ Error retrieving alert list:', error);
    console.log(`⚠️ Returning sample data due to error: ${sampleAlerts.length} alerts`);
    return sampleAlerts;
  }
}

// Mark an alert as read
export async function markAlertAsRead(alertId: string) {
  console.log(`🔄 Marking alert as read ID: ${alertId}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Mock mark as read successful');
      return { success: true };
    }
    
    return await withRetry(async () => {
      // Convert alertId to number since it's a serial in the database
      const numericAlertId = parseInt(alertId, 10);
      
      // Check if conversion was successful
      if (isNaN(numericAlertId)) {
        throw new Error(`Invalid alert ID format: ${alertId}`);
      }
      
      await db.update(alerts)
        .set({ read: true })
        .where(eq(alerts.id, numericAlertId));
      
      console.log(`✅ Marked alert as read ID: ${alertId}`);
      revalidatePath('/dashboard/landslides');
      return { success: true };
    });
  } catch (error) {
    console.error(`❌ Error marking alert as read ID: ${alertId}:`, error);
    return { success: false, error };
  }
}

// Create a new alert
export async function createAlert(alertData: Omit<AlertType, 'id'>) {
  console.log(`🔄 Creating new alert: ${alertData.title}`);
  
  try {
    if (isMockDb()) {
      console.log('✅ Mock create successful');
      return { success: true };
    }
    
    return await withRetry(async () => {
      await db.insert(alerts).values({
        type: alertData.type,
        title: alertData.title,
        description: alertData.description,
        date: new Date(alertData.date),
        landslide_id: alertData.landslideId,
        monitoring_area_id: alertData.monitoringAreaId,
        read: alertData.read,
        user_id: 'default',
        created_at: new Date()
      });
      
      console.log(`✅ Created new alert: ${alertData.title}`);
      revalidatePath('/dashboard/landslides');
      return { success: true };
    });
  } catch (error) {
    console.error('❌ Error creating alert:', error);
    return { success: false, error };
  }
}