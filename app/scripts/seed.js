const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Dữ liệu mẫu từ file landslide.ts
const sampleLandslides = [
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

const sampleMonitoredAreas = [
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

const sampleAlerts = [
  {
    id: '1',
    type: 'danger',
    title: 'Cảnh báo sạt lở mới',
    description: 'Phát hiện điểm sạt lở mới tại Đèo Ô Quý Hồ (ID: LS004)',
    date: '2025-03-31T10:00:00',
    landslideId: 'LS001',
    read: false,
    userId: 'system'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Mưa lớn tại khu vực theo dõi',
    description: 'Dự báo mưa lớn tại Sa Pa trong 24 giờ tới',
    date: '2025-03-30T16:30:00',
    monitoringAreaId: 'MON001',
    read: true,
    userId: 'system'
  }
];

const sampleNotificationSettings = {
  email: true,
  emailAddress: 'admin@example.com',
  sms: false,
  phoneNumber: '',
  threshold: 'medium',
  updateFrequency: 'daily',
  weatherForecast: true,
  autoMonitor: false,
  monthlyReport: true,
  userId: 'default'
};

async function seed() {
  console.log('Seeding database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert landslides
    for (const landslide of sampleLandslides) {
      await client.query(
        `INSERT INTO landslides 
        (id, name, lat, lng, detected_at, status, affected_area, potential_impact, last_update, history, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          landslide.id,
          landslide.name,
          landslide.coordinates.lat.toString(),
          landslide.coordinates.lng.toString(),
          new Date(landslide.detectedAt),
          landslide.status,
          landslide.details.affectedArea,
          landslide.details.potentialImpact,
          new Date(landslide.details.lastUpdate),
          JSON.stringify(landslide.history)
        ]
      );
      console.log(`Inserted landslide: ${landslide.name}`);
    }

    // Insert monitoring areas
    for (const area of sampleMonitoredAreas) {
      await client.query(
        `INSERT INTO monitoring_areas 
        (id, name, north_bound, south_bound, east_bound, west_bound, created_at, monitor_frequency, last_checked, status, detected_points, risk_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          area.id,
          area.name,
          area.boundingBox.north.toString(),
          area.boundingBox.south.toString(),
          area.boundingBox.east.toString(),
          area.boundingBox.west.toString(),
          new Date(area.createdAt),
          area.monitorFrequency,
          new Date(area.lastChecked),
          area.status,
          area.detectedPoints,
          area.riskLevel
        ]
      );
      console.log(`Inserted monitoring area: ${area.name}`);
    }

    // Insert notification settings
    await client.query(
      `INSERT INTO notification_settings 
      (user_id, email, email_address, sms, phone_number, threshold, update_frequency, weather_forecast, auto_monitor, monthly_report)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        sampleNotificationSettings.userId,
        sampleNotificationSettings.email,
        sampleNotificationSettings.emailAddress,
        sampleNotificationSettings.sms,
        sampleNotificationSettings.phoneNumber,
        sampleNotificationSettings.threshold,
        sampleNotificationSettings.updateFrequency,
        sampleNotificationSettings.weatherForecast,
        sampleNotificationSettings.autoMonitor,
        sampleNotificationSettings.monthlyReport
      ]
    );
    console.log('Inserted notification settings');

    // Insert alerts
    for (const alert of sampleAlerts) {
      await client.query(
        `INSERT INTO alerts 
        (type, title, description, date, landslide_id, monitoring_area_id, read, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          alert.type,
          alert.title,
          alert.description,
          new Date(alert.date),
          alert.landslideId,
          alert.monitoringAreaId,
          alert.read,
          alert.userId
        ]
      );
      console.log(`Inserted alert: ${alert.title}`);
    }

    await client.query('COMMIT');
    console.log('Seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seed();