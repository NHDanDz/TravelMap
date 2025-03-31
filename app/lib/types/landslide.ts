// Các kiểu dữ liệu cho điểm sạt lở
export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  export interface LandslideDetails {
    affectedArea: string;
    potentialImpact: string;
    lastUpdate: string;
  }
  
  export interface LandslideHistoryEvent {
    date: string;
    status: string;
    note: string;
  }
  
  export interface LandslidePoint {
    id: string;
    name: string;
    coordinates: Coordinates;
    detectedAt: string;
    status: 'high_risk' | 'active' | 'stabilized' | 'monitored';
    details: LandslideDetails;
    history: LandslideHistoryEvent[];
  }
  
  // Các kiểu dữ liệu cho khu vực theo dõi
  export interface BoundingBox {
    north: number;
    south: number;
    east: number;
    west: number;
  }
  
  export interface MonitoringArea {
    id: string;
    name: string;
    boundingBox: BoundingBox;
    createdAt: string;
    monitorFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    lastChecked: string;
    status: 'active' | 'paused';
    detectedPoints: number;
    riskLevel: 'high' | 'medium' | 'low';
    landslideId?: string;
    autoVerify?: boolean;
  }
  
  // Các kiểu dữ liệu cho thông báo và cảnh báo
  export interface NotificationSettings {
    email: boolean;
    emailAddress?: string;
    sms: boolean;
    phoneNumber?: string;
    threshold: 'low' | 'medium' | 'high';
    updateFrequency: 'immediate' | 'daily' | 'weekly';
    weatherForecast: boolean;
    autoMonitor: boolean;
    monthlyReport: boolean;
  }
  
  export interface Alert {
    id: string;
    type: 'danger' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
    date: string;
    landslideId?: string;
    monitoringAreaId?: string;
    read: boolean;
  }
  
  // Các kiểu dữ liệu cho API response
  export interface DetectionResult {
    id: string;
    status: string;
    landslideDetected: boolean;
    landslide_coordinates?: {
      coordinates: Array<{
        segment_id: string;
        east: number;
        north: number;
      }>;
    };
    model_processing_completed: boolean;
  }