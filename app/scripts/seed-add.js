const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Dữ liệu mẫu mở rộng
const landslides = [
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
  // Dữ liệu mới thêm vào
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

const monitoredAreas = [
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
  // Dữ liệu mới thêm vào
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

const alerts = [
  {
    id: '1',
    type: 'danger',
    title: 'Cảnh báo sạt lở mới',
    description: 'Phát hiện điểm sạt lở mới tại Đèo Ô Quý Hồ (ID: LS003)',
    date: '2025-03-31T10:00:00',
    landslideId: 'LS003',
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
  },
  // Dữ liệu mới thêm vào
  {
    id: '3',
    type: 'info',
    title: 'Cập nhật trạng thái',
    description: 'Đã ổn định sạt lở tại Thung lũng Mai Châu',
    date: '2025-03-20T16:45:00',
    landslideId: 'LS004',
    read: true,
    userId: 'system'
  },
  {
    id: '4',
    type: 'success',
    title: 'Hoàn thành lắp đặt thiết bị',
    description: 'Hệ thống cảm biến đã được lắp đặt tại Đèo Ngang',
    date: '2025-03-28T12:00:00',
    landslideId: 'LS005',
    read: false,
    userId: 'system'
  },
  {
    id: '5',
    type: 'danger',
    title: 'Nguy cơ sạt lở cao',
    description: 'Phát hiện nhiều vết nứt mới tại Đèo Hải Vân, cần điều phối lực lượng kiểm tra ngay',
    date: '2025-03-31T08:15:00',
    landslideId: 'LS001',
    read: false,
    userId: 'system'
  }
];

const notificationSettings = {
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

async function truncateAllTables(client) {
  // Xóa dữ liệu cũ trước khi thêm mới để tránh lỗi khóa chính trùng lặp
  await client.query('TRUNCATE alerts, notification_settings, monitoring_areas, landslides RESTART IDENTITY CASCADE');
  console.log('🧹 Đã xóa dữ liệu cũ từ tất cả các bảng');
}

async function countRecords(client) {
  const tables = ['landslides', 'monitoring_areas', 'notification_settings', 'alerts'];
  console.log('\n📊 Số lượng bản ghi sau khi import:');
  
  for (const table of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
    console.log(`- ${table}: ${res.rows[0].count} bản ghi`);
  }
}

async function seed() {
  console.log('🔄 Đang tiến hành import dữ liệu vào PostgreSQL...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Xóa dữ liệu cũ
    await truncateAllTables(client);

    // Insert landslides
    for (const landslide of landslides) {
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
      console.log(`✅ Đã thêm điểm sạt lở: ${landslide.name} (${landslide.id})`);
    }

    // Insert monitoring areas
    for (const area of monitoredAreas) {
      await client.query(
        `INSERT INTO monitoring_areas 
        (id, name, north_bound, south_bound, east_bound, west_bound, created_at, monitor_frequency, last_checked, status, detected_points, risk_level, landslide_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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
          area.riskLevel,
          area.landslideId || null
        ]
      );
      console.log(`✅ Đã thêm khu vực theo dõi: ${area.name} (${area.id})`);
    }

    // Insert notification settings
    await client.query(
      `INSERT INTO notification_settings 
      (user_id, email, email_address, sms, phone_number, threshold, update_frequency, weather_forecast, auto_monitor, monthly_report)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        notificationSettings.userId,
        notificationSettings.email,
        notificationSettings.emailAddress,
        notificationSettings.sms,
        notificationSettings.phoneNumber,
        notificationSettings.threshold,
        notificationSettings.updateFrequency,
        notificationSettings.weatherForecast,
        notificationSettings.autoMonitor,
        notificationSettings.monthlyReport
      ]
    );
    console.log('✅ Đã thêm cài đặt thông báo');

    // Insert alerts
    for (const alert of alerts) {
      await client.query(
        `INSERT INTO alerts 
        (type, title, description, date, landslide_id, monitoring_area_id, read, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          alert.type,
          alert.title,
          alert.description,
          new Date(alert.date),
          alert.landslideId || null,
          alert.monitoringAreaId || null,
          alert.read,
          alert.userId
        ]
      );
      console.log(`✅ Đã thêm cảnh báo: ${alert.title}`);
    }

    await client.query('COMMIT');
    
    // Kiểm tra số lượng bản ghi sau khi import
    await countRecords(client);
    
    console.log('\n✨ Import dữ liệu thành công!');
    console.log('🌐 Bạn có thể truy cập ứng dụng để xem dữ liệu mới');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi import dữ liệu:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Thực hiện import dữ liệu
seed();