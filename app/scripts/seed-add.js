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
  },
  {
    id: 'LS006',
    name: 'Đèo Khau Phạ, Mù Cang Chải',
    coordinates: { lat: 21.8512, lng: 104.1422 },
    detectedAt: '2025-02-18T09:45:00',
    status: 'active',
    details: {
      affectedArea: '1.48 km²',
      potentialImpact: 'Đường đèo và khu dân cư phía dưới',
      lastUpdate: '2025-03-25T11:20:00'
    },
    history: [
      { date: '2025-02-18', status: 'detected', note: 'Phát hiện qua ảnh vệ tinh sau mưa lớn' },
      { date: '2025-02-25', status: 'field_verified', note: 'Quan sát vết nứt dài 150m' },
      { date: '2025-03-10', status: 'active', note: 'Vết nứt mở rộng 10% sau trận mưa' }
    ]
  },
  {
    id: 'LS007',
    name: 'Làng Hầu Thào, Sa Pa',
    coordinates: { lat: 22.3265, lng: 103.8245 },
    detectedAt: '2025-03-05T16:22:00',
    status: 'high_risk',
    details: {
      affectedArea: '0.87 km²',
      potentialImpact: 'Khu dân cư đồng bào dân tộc H\'Mông',
      lastUpdate: '2025-03-29T08:40:00'
    },
    history: [
      { date: '2025-03-05', status: 'detected', note: 'Phát hiện qua báo cáo người dân' },
      { date: '2025-03-07', status: 'field_verified', note: 'Kiểm tra và xác nhận nguy cơ cao' },
      { date: '2025-03-15', status: 'high_risk', note: 'Đề xuất di dời 25 hộ dân' }
    ]
  },
  {
    id: 'LS008',
    name: 'Bản Phùng, Hoàng Su Phì',
    coordinates: { lat: 22.7425, lng: 104.6791 },
    detectedAt: '2025-01-25T10:35:00',
    status: 'remediated',
    details: {
      affectedArea: '0.65 km²',
      potentialImpact: 'Đường nông thôn và ruộng bậc thang',
      lastUpdate: '2025-03-15T09:30:00'
    },
    history: [
      { date: '2025-01-25', status: 'detected', note: 'Phát hiện cục bộ sau mưa lớn' },
      { date: '2025-02-01', status: 'field_verified', note: 'Đánh giá và lập kế hoạch gia cố' },
      { date: '2025-02-15', status: 'remediation', note: 'Thực hiện biện pháp gia cố và thoát nước' },
      { date: '2025-03-15', status: 'remediated', note: 'Hoàn tất các biện pháp xử lý' }
    ]
  },
  {
    id: 'LS009',
    name: 'Đường Hồ Chí Minh đoạn Đăk Nông',
    coordinates: { lat: 12.0045, lng: 107.6932 },
    detectedAt: '2025-03-18T11:05:00',
    status: 'active',
    details: {
      affectedArea: '1.15 km²',
      potentialImpact: 'Đường Hồ Chí Minh đoạn qua Đăk Nông',
      lastUpdate: '2025-03-30T15:10:00'
    },
    history: [
      { date: '2025-03-18', status: 'detected', note: 'Phát hiện từ hình ảnh UAV tuần tra' },
      { date: '2025-03-20', status: 'field_verified', note: 'Đo đạc khảo sát chi tiết' },
      { date: '2025-03-25', status: 'active', note: 'Đặt hệ thống cảm biến theo dõi' }
    ]
  },
  {
    id: 'LS010',
    name: 'Khu bảo tồn Kon Chư Răng',
    coordinates: { lat: 14.5031, lng: 108.5429 },
    detectedAt: '2025-02-28T14:50:00',
    status: 'monitored',
    details: {
      affectedArea: '2.15 km²',
      potentialImpact: 'Khu rừng đặc dụng và nguồn nước',
      lastUpdate: '2025-03-25T09:45:00'
    },
    history: [
      { date: '2025-02-28', status: 'detected', note: 'Phát hiện qua ảnh vệ tinh' },
      { date: '2025-03-10', status: 'field_verified', note: 'Kiểm tra thực địa' },
      { date: '2025-03-25', status: 'monitored', note: 'Thiết lập trạm quan trắc tự động' }
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
  },
  {
    id: 'MON004',
    name: 'Cao nguyên Mộc Châu',
    boundingBox: { north: 20.95, south: 20.75, east: 104.8, west: 104.6 },
    createdAt: '2025-02-10T09:45:00',
    monitorFrequency: 'biweekly',
    lastChecked: '2025-03-28T10:30:00',
    status: 'active',
    detectedPoints: 0,
    riskLevel: 'low'
  },
  {
    id: 'MON005',
    name: 'Khu bảo tồn Kon Chư Răng',
    boundingBox: { north: 14.55, south: 14.45, east: 108.6, west: 108.5 },
    createdAt: '2025-03-01T15:30:00',
    monitorFrequency: 'weekly',
    lastChecked: '2025-03-29T16:15:00',
    status: 'active',
    detectedPoints: 1,
    riskLevel: 'medium',
    landslideId: 'LS010'
  },
  {
    id: 'MON006',
    name: 'Đèo Khau Phạ',
    boundingBox: { north: 21.9, south: 21.8, east: 104.2, west: 104.1 },
    createdAt: '2025-02-20T11:00:00',
    monitorFrequency: 'daily',
    lastChecked: '2025-03-31T07:45:00',
    status: 'active',
    detectedPoints: 1,
    riskLevel: 'high',
    landslideId: 'LS006'
  },
  {
    id: 'MON007',
    name: 'Đường Hồ Chí Minh đoạn Đăk Nông',
    boundingBox: { north: 12.05, south: 11.95, east: 107.75, west: 107.65 },
    createdAt: '2025-03-19T13:30:00',
    monitorFrequency: 'daily',
    lastChecked: '2025-03-31T06:30:00',
    status: 'active',
    detectedPoints: 1,
    riskLevel: 'medium',
    landslideId: 'LS009'
  }
];

const inspectionEvents = [
  {
    id: 'INS001',
    monitoringAreaId: 'MON001',
    name: 'Kiểm tra định kỳ vùng Sa Pa',
    description: 'Kiểm tra định kỳ hàng tháng khu vực Sa Pa sử dụng ảnh vệ tinh',
    method: 'satellite',
    status: 'completed',
    scheduledDate: '2025-03-15T08:00:00',
    startDate: '2025-03-15T08:00:00',
    endDate: '2025-03-15T14:30:00',
    findings: 'Phát hiện vết nứt mới ở phía đông Thác Bạc',
    landslideCount: 1,
    createdBy: 'system'
  },
  {
    id: 'INS002',
    monitoringAreaId: 'MON001',
    name: 'Kiểm tra hiện trường Thác Bạc',
    description: 'Kiểm tra hiện trường sau khi phát hiện vết nứt qua vệ tinh',
    method: 'ground',
    status: 'completed',
    scheduledDate: '2025-03-18T09:00:00',
    startDate: '2025-03-18T09:30:00',
    endDate: '2025-03-18T15:45:00',
    findings: 'Xác nhận vết nứt dài 75m, rộng 10-15cm. Độ sâu trung bình 30cm.',
    landslideCount: 1,
    createdBy: 'user_001'
  },
  {
    id: 'INS003',
    monitoringAreaId: 'MON006',
    name: 'Khảo sát UAV đèo Khau Phạ',
    description: 'Sử dụng UAV khảo sát chi tiết đèo Khau Phạ sau mưa lớn',
    method: 'drone',
    status: 'completed',
    scheduledDate: '2025-03-25T08:30:00',
    startDate: '2025-03-25T08:45:00',
    endDate: '2025-03-25T12:30:00',
    findings: 'Phát hiện vị trí tiềm ẩn nguy cơ sạt lở mới ở km12+500',
    landslideCount: 1,
    createdBy: 'user_002'
  },
  {
    id: 'INS004',
    monitoringAreaId: 'MON002',
    name: 'Kiểm tra thiết bị giám sát Mai Châu',
    description: 'Bảo trì định kỳ các thiết bị cảm biến tại Mai Châu',
    method: 'sensors',
    status: 'completed',
    scheduledDate: '2025-03-20T09:00:00',
    startDate: '2025-03-20T09:15:00',
    endDate: '2025-03-20T16:00:00',
    findings: 'Thay thế 2 cảm biến hết pin, hiệu chỉnh 3 cảm biến khác',
    landslideCount: 0,
    createdBy: 'user_003'
  },
  {
    id: 'INS005',
    monitoringAreaId: 'MON003',
    name: 'Giám sát sau mưa lớn tại Đèo Ngang',
    description: 'Đánh giá tác động sau đợt mưa kéo dài 48 giờ',
    method: 'mixed',
    status: 'completed',
    scheduledDate: '2025-03-26T10:00:00',
    startDate: '2025-03-26T10:30:00',
    endDate: '2025-03-26T17:45:00',
    findings: 'Nhiều điểm tràn nước, 1 điểm có dấu hiệu trượt nhẹ',
    landslideCount: 0,
    createdBy: 'user_001'
  },
  {
    id: 'INS006',
    monitoringAreaId: 'MON007',
    name: 'Lắp đặt cảm biến tại Đăk Nông',
    description: 'Lắp đặt hệ thống cảm biến giám sát liên tục',
    method: 'sensors',
    status: 'completed',
    scheduledDate: '2025-03-22T08:00:00',
    startDate: '2025-03-22T08:30:00',
    endDate: '2025-03-22T16:45:00',
    findings: 'Đã lắp đặt 8 cảm biến dọc đoạn đường có nguy cơ sạt lở',
    landslideCount: 0,
    createdBy: 'user_002'
  },
  {
    id: 'INS007',
    monitoringAreaId: 'MON001',
    name: 'Khảo sát thường niên Sa Pa',
    description: 'Khảo sát toàn diện khu vực Sa Pa',
    method: 'mixed',
    status: 'scheduled',
    scheduledDate: '2025-04-15T08:00:00',
    findings: '',
    landslideCount: 0,
    createdBy: 'user_001'
  }
];

const sensors = [
  {
    id: 'SEN001',
    name: 'Cảm biến độ dịch chuyển #1 - Thác Bạc',
    type: 'displacement',
    model: 'GP-DS100',
    lat: '22.3545',
    lng: '103.7780',
    elevation: '1250',
    monitoringAreaId: 'MON001',
    landslideId: 'LS002',
    status: 'active',
    batteryLevel: 87,
    lastReading: '2025-03-31T06:00:00',
    readingFrequency: 'hourly',
    installationDate: '2025-03-10T14:30:00'
  },
  {
    id: 'SEN002',
    name: 'Cảm biến độ ẩm #1 - Thác Bạc',
    type: 'moisture',
    model: 'GP-MS200',
    lat: '22.3547',
    lng: '103.7781',
    elevation: '1248',
    monitoringAreaId: 'MON001',
    landslideId: 'LS002',
    status: 'active',
    batteryLevel: 92,
    lastReading: '2025-03-31T06:00:00',
    readingFrequency: 'hourly',
    installationDate: '2025-03-10T15:15:00'
  },
  {
    id: 'SEN003',
    name: 'Cảm biến độ rung #1 - Thác Bạc',
    type: 'vibration',
    model: 'GP-VB100',
    lat: '22.3546',
    lng: '103.7779',
    elevation: '1249',
    monitoringAreaId: 'MON001',
    landslideId: 'LS002',
    status: 'active',
    batteryLevel: 85,
    lastReading: '2025-03-31T06:00:00',
    readingFrequency: 'hourly',
    installationDate: '2025-03-10T16:00:00'
  },
  {
    id: 'SEN004',
    name: 'Mưa kế #1 - Đỉnh Đèo Khau Phạ',
    type: 'rainfall',
    model: 'GP-RG300',
    lat: '21.8512',
    lng: '104.1425',
    elevation: '1350',
    monitoringAreaId: 'MON006',
    landslideId: 'LS006',
    status: 'active',
    batteryLevel: 76,
    lastReading: '2025-03-31T06:00:00',
    readingFrequency: 'hourly',
    installationDate: '2025-03-01T09:45:00'
  },
  {
    id: 'SEN005',
    name: 'Cảm biến độ dịch chuyển #1 - Đèo Khau Phạ',
    type: 'displacement',
    model: 'GP-DS100',
    lat: '21.8514',
    lng: '104.1423',
    elevation: '1345',
    monitoringAreaId: 'MON006',
    landslideId: 'LS006',
    status: 'active',
    batteryLevel: 81,
    lastReading: '2025-03-31T06:00:00',
    readingFrequency: 'hourly',
    installationDate: '2025-03-01T10:30:00'
  },
  {
    id: 'SEN006',
    name: 'Mưa kế #1 - Làng Hầu Thào',
    type: 'rainfall',
    model: 'GP-RG300',
    lat: '22.3267',
    lng: '103.8248',
    elevation: '1100',
    monitoringAreaId: 'MON001',
    landslideId: 'LS007',
    status: 'active',
    batteryLevel: 95,
    lastReading: '2025-03-31T06:00:00',
    readingFrequency: 'hourly',
    installationDate: '2025-03-15T09:00:00'
  },
  {
    id: 'SEN007',
    name: 'Cảm biến độ ẩm #1 - Làng Hầu Thào',
    type: 'moisture',
    model: 'GP-MS200',
    lat: '22.3266',
    lng: '103.8246',
    elevation: '1098',
    monitoringAreaId: 'MON001',
    landslideId: 'LS007',
    status: 'active',
    batteryLevel: 94,
    lastReading: '2025-03-31T06:00:00',
    readingFrequency: 'hourly',
    installationDate: '2025-03-15T10:15:00'
  },
  {
    id: 'SEN008',
    name: 'Cảm biến độ dịch chuyển #1 - Đường HCM Đăk Nông',
    type: 'displacement',
    model: 'GP-DS100',
    lat: '12.0046',
    lng: '107.6933',
    elevation: '750',
    monitoringAreaId: 'MON007',
    landslideId: 'LS009',
    status: 'active',
    batteryLevel: 98,
    lastReading: '2025-03-31T06:00:00',
    readingFrequency: 'hourly',
    installationDate: '2025-03-22T09:30:00'
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
  },
  {
    id: '6',
    type: 'warning',
    title: 'Cảm biến báo vượt ngưỡng',
    description: 'Cảm biến độ dịch chuyển tại Đèo Khau Phạ đo được chuyển vị 2.5cm trong 24h qua',
    date: '2025-03-29T07:30:00',
    landslideId: 'LS006',
    read: true,
    userId: 'system'
  },
  {
    id: '7',
    type: 'danger',
    title: 'Cảnh báo di dời khẩn cấp',
    description: 'Yêu cầu di dời 25 hộ dân tại làng Hầu Thào do nguy cơ sạt lở cao',
    date: '2025-03-30T15:45:00',
    landslideId: 'LS007',
    read: false,
    userId: 'system'
  },
  {
    id: '8',
    type: 'info',
    title: 'Lịch kiểm tra định kỳ',
    description: 'Đã lên lịch kiểm tra định kỳ cho khu vực Sa Pa vào ngày 15/04/2025',
    date: '2025-03-31T09:20:00',
    monitoringAreaId: 'MON001',
    read: true,
    userId: 'system'
  },
  {
    id: '9',
    type: 'warning',
    title: 'Cần bảo trì thiết bị',
    description: 'Cảm biến độ ẩm tại Đèo Khau Phạ có dấu hiệu pin yếu, cần thay pin trong 7 ngày tới',
    date: '2025-03-28T14:15:00',
    landslideId: 'LS006',
    read: false,
    userId: 'system'
  },
  {
    id: '10',
    type: 'success',
    title: 'Xử lý sạt lở thành công',
    description: 'Hoàn tất các biện pháp gia cố tại Bản Phùng, Hoàng Su Phì',
    date: '2025-03-15T16:30:00',
    landslideId: 'LS008',
    read: true,
    userId: 'system'
  }
];

const notificationSettings = [
  {
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
  },
  {
    email: true,
    emailAddress: 'field_engineer@example.com',
    sms: true,
    phoneNumber: '+84123456789',
    threshold: 'low',
    updateFrequency: 'immediate',
    weatherForecast: true,
    autoMonitor: true,
    monthlyReport: true,
    userId: 'user_001'
  },
  {
    email: true,
    emailAddress: 'manager@example.com',
    sms: true,
    phoneNumber: '+84987654321',
    threshold: 'high',
    updateFrequency: 'daily',
    weatherForecast: false,
    autoMonitor: false,
    monthlyReport: true,
    userId: 'user_002'
  }
];

const landslideObservations = [
  {
    landslideId: 'LS002',
    inspectionEventId: 'INS001',
    observationDate: '2025-03-15T10:30:00',
    status: 'active',
    movementDetected: true,
    movementRate: 1.8,
    affectedAreaChange: 5.2,
    stabilityChange: -0.15,
    riskLevel: 'high',
    riskFactors: JSON.stringify({
      rainfall: 'high',
      slope: 'steep',
      vegetation: 'sparse',
      soilType: 'loose'
    }),
    notes: 'Phát hiện vết nứt mới dài khoảng 75m, có dấu hiệu chuyển động tích cực',
    observedBy: 'user_001',
    verifiedBy: 'user_002'
  },
  {
    landslideId: 'LS002',
    inspectionEventId: 'INS002',
    observationDate: '2025-03-18T11:45:00',
    status: 'active',
    movementDetected: true,
    movementRate: 2.1,
    affectedAreaChange: 3.5,
    stabilityChange: -0.1,
    riskLevel: 'high',
    riskFactors: JSON.stringify({
      rainfall: 'medium',
      slope: 'steep',
      vegetation: 'sparse',
      groundwater: 'high'
    }),
    notes: 'Vết nứt mở rộng thêm khoảng 5cm so với quan sát từ ảnh vệ tinh',
    recommendedActions: 'Lắp đặt hệ thống cảm biến và theo dõi liên tục. Cảnh báo khu du lịch.',
    observedBy: 'user_001',
    verifiedBy: 'user_002'
  },
  {
    landslideId: 'LS006',
    inspectionEventId: 'INS003',
    observationDate: '2025-03-25T10:15:00',
    status: 'active',
    movementDetected: true,
    movementRate: 1.5,
    affectedAreaChange: 2.3,
    stabilityChange: -0.05,
    riskLevel: 'medium',
    riskFactors: JSON.stringify({
      rainfall: 'high',
      slope: 'moderate',
      vegetation: 'moderate',
      previousEvent: true
    }),
    notes: 'Điểm tiềm ẩn sạt lở mới cách điểm cũ khoảng 150m về phía Tây, có vết nứt kích thước nhỏ',
    recommendedActions: 'Theo dõi thêm, lắp đặt biển cảnh báo cho người tham gia giao thông',
    observedBy: 'user_002',
    verifiedBy: 'user_003'
  },
  {
    landslideId: 'LS005',
    inspectionEventId: 'INS005',
    observationDate: '2025-03-26T13:20:00',
    status: 'monitored',
    movementDetected: false,
    movementRate: 0.2,
    affectedAreaChange: 0.0,
    stabilityChange: 0.0,
    riskLevel: 'medium',
    riskFactors: JSON.stringify({
      rainfall: 'high',
      slope: 'moderate',
      vegetation: 'good',
      drainage: 'poor'
    }),
    notes: 'Chưa phát hiện chuyển động đáng kể. Hệ thống thoát nước bị tắc nghẽn cục bộ.',
    recommendedActions: 'Khơi thông hệ thống thoát nước, tiếp tục theo dõi',
    observedBy: 'user_001',
    verifiedBy: 'user_002'
  }
];

const sensorData = [
  {
    sensorId: 'SEN001',
    timestamp: '2025-03-31T06:00:00',
    data: JSON.stringify({
      displacement: 2.15,
      direction: 'southeast',
      velocity: 0.12
    }),
    status: 'normal',
    anomalyDetected: false
  },
  {
    sensorId: 'SEN002',
    timestamp: '2025-03-31T06:00:00',
    data: JSON.stringify({
      moisture: 42.5,
      temperature: 18.3
    }),
    status: 'normal',
    anomalyDetected: false
  },
  {
    sensorId: 'SEN003',
    timestamp: '2025-03-31T06:00:00',
    data: JSON.stringify({
      vibration: 0.32,
      frequency: 12.5
    }),
    status: 'normal',
    anomalyDetected: false
  },
  {
    sensorId: 'SEN004',
    timestamp: '2025-03-31T06:00:00',
    data: JSON.stringify({
      rainfall: 0.0,
      accumulation24h: 25.4
    }),
    status: 'normal',
    anomalyDetected: false
  },
  {
    sensorId: 'SEN005',
    timestamp: '2025-03-31T06:00:00',
    data: JSON.stringify({
      displacement: 2.78,
      direction: 'east',
      velocity: 0.16
    }),
    status: 'warning',
    anomalyDetected: true,
    anomalyType: 'higher_rate'
  }
];

async function truncateAllTables(client) {
  // Xóa dữ liệu cũ trước khi thêm mới để tránh lỗi khóa chính trùng lặp
  try {
    await client.query(`
      DO $$ 
      BEGIN
        TRUNCATE alerts, notification_settings, sensor_data, sensors, landslide_observations, 
        inspection_events, monitoring_areas, landslides RESTART IDENTITY CASCADE;
      EXCEPTION
        WHEN undefined_table THEN
        RAISE NOTICE 'Một số bảng không tồn tại, bỏ qua';
      END $$;
    `);
    console.log('🧹 Đã xóa dữ liệu cũ từ tất cả các bảng');
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu cũ:', error);
    console.log('Tiếp tục với quá trình import...');
  }
}

async function countRecords(client) {
  const tables = [
    'landslides', 
    'monitoring_areas', 
    'inspection_events', 
    'landslide_observations', 
    'sensors', 
    'sensor_data', 
    'notification_settings', 
    'alerts'
  ];
  
  console.log('\n📊 Số lượng bản ghi sau khi import:');
  
  for (const table of tables) {
    try {
      const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`- ${table}: ${res.rows[0].count} bản ghi`);
    } catch (error) {
      console.log(`- ${table}: Bảng không tồn tại hoặc lỗi truy vấn`);
    }
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
    console.log('Đang import điểm sạt lở...');
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
    console.log('Đang import khu vực giám sát...');
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
      console.log(`✅ Đã thêm khu vực giám sát: ${area.name} (${area.id})`);
    }

    // Thêm các sự kiện kiểm tra
    console.log('Đang import sự kiện kiểm tra...');
    for (const event of inspectionEvents) {
      await client.query(
        `INSERT INTO inspection_events 
        (id, monitoring_area_id, name, description, method, status, scheduled_date, start_date, end_date, findings, landslide_count, created_at, updated_at, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), $12)`,
        [
          event.id,
          event.monitoringAreaId,
          event.name,
          event.description,
          event.method,
          event.status,
          new Date(event.scheduledDate),
          event.startDate ? new Date(event.startDate) : null,
          event.endDate ? new Date(event.endDate) : null,
          event.findings,
          event.landslideCount,
          event.createdBy
        ]
      );
      console.log(`✅ Đã thêm sự kiện kiểm tra: ${event.name} (${event.id})`);
    }

    // Thêm các cảm biến
    console.log('Đang import thông tin cảm biến...');
    for (const sensor of sensors) {
      await client.query(
        `INSERT INTO sensors 
        (id, name, type, model, lat, lng, elevation, monitoring_area_id, landslide_id, status, battery_level, last_reading, reading_frequency, installation_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
        [
          sensor.id,
          sensor.name,
          sensor.type,
          sensor.model,
          sensor.lat,
          sensor.lng,
          sensor.elevation,
          sensor.monitoringAreaId,
          sensor.landslideId,
          sensor.status,
          sensor.batteryLevel,
          sensor.lastReading ? new Date(sensor.lastReading) : null,
          sensor.readingFrequency,
          sensor.installationDate ? new Date(sensor.installationDate) : null
        ]
      );
      console.log(`✅ Đã thêm cảm biến: ${sensor.name} (${sensor.id})`);
    }

    // Thêm quan sát sạt lở
    console.log('Đang import dữ liệu quan sát sạt lở...');
    for (const observation of landslideObservations) {
      await client.query(
        `INSERT INTO landslide_observations 
        (id, landslide_id, inspection_event_id, observation_date, status, movement_detected, movement_rate, affected_area_change, 
        stability_change, risk_level, risk_factors, notes, recommended_actions, observed_by, verified_by, created_at, updated_at)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
        [
          observation.landslideId,
          observation.inspectionEventId,
          new Date(observation.observationDate),
          observation.status,
          observation.movementDetected,
          observation.movementRate,
          observation.affectedAreaChange,
          observation.stabilityChange,
          observation.riskLevel,
          observation.riskFactors,
          observation.notes,
          observation.recommendedActions || null,
          observation.observedBy,
          observation.verifiedBy || null
        ]
      );
      console.log(`✅ Đã thêm quan sát sạt lở cho: ${observation.landslideId} (${observation.inspectionEventId})`);
    }

    // Thêm dữ liệu cảm biến
    console.log('Đang import dữ liệu cảm biến...');
    for (const data of sensorData) {
      await client.query(
        `INSERT INTO sensor_data 
        (id, sensor_id, timestamp, data, status, anomaly_detected, anomaly_type, created_at)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, NOW())`,
        [
          data.sensorId,
          new Date(data.timestamp),
          data.data,
          data.status,
          data.anomalyDetected,
          data.anomalyType || null
        ]
      );
      console.log(`✅ Đã thêm dữ liệu cho cảm biến: ${data.sensorId}`);
    }

    // Insert notification settings
    console.log('Đang import cài đặt thông báo...');
    for (const setting of notificationSettings) {
      await client.query(
        `INSERT INTO notification_settings 
        (user_id, email, email_address, sms, phone_number, threshold, update_frequency, weather_forecast, auto_monitor, monthly_report, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          setting.userId,
          setting.email,
          setting.emailAddress,
          setting.sms,
          setting.phoneNumber,
          setting.threshold,
          setting.updateFrequency,
          setting.weatherForecast,
          setting.autoMonitor,
          setting.monthlyReport
        ]
      );
      console.log(`✅ Đã thêm cài đặt thông báo cho người dùng: ${setting.userId}`);
    }

    // Insert alerts
    console.log('Đang import cảnh báo...');
    for (const alert of alerts) {
      await client.query(
        `INSERT INTO alerts 
        (type, title, description, date, landslide_id, monitoring_area_id, read, user_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
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