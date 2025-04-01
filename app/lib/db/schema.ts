// app/lib/db/schema.ts
import { pgTable, serial, text, timestamp, integer, boolean, pgEnum, real, uuid, jsonb, unique, foreignKey } from 'drizzle-orm/pg-core';

// ======= ENUMS =======

// Trạng thái sạt lở
export const landslideStatusEnum = pgEnum('landslide_status', [
  'high_risk',    // Nguy cơ cao
  'active',       // Đang hoạt động
  'stabilized',   // Đã ổn định
  'monitored',    // Đang theo dõi
  'remediated'    // Đã xử lý
]);

// Tần suất giám sát
export const monitorFrequencyEnum = pgEnum('monitor_frequency', [
  'daily',        // Hàng ngày
  'weekly',       // Hàng tuần
  'biweekly',     // Hai tuần một lần
  'monthly',      // Hàng tháng
  'quarterly',    // Hàng quý
  'custom'        // Tùy chỉnh
]);

// Mức độ rủi ro
export const riskLevelEnum = pgEnum('risk_level', [
  'critical',     // Nguy cấp
  'high',         // Cao
  'medium',       // Trung bình
  'low',          // Thấp
  'negligible'    // Không đáng kể
]);

// Loại theo dõi
export const monitoringMethodEnum = pgEnum('monitoring_method', [
  'satellite',    // Vệ tinh
  'drone',        // Máy bay không người lái
  'ground',       // Quan sát mặt đất
  'sensors',      // Cảm biến
  'mixed'         // Kết hợp
]);

// Trạng thái kiểm tra
export const inspectionStatusEnum = pgEnum('inspection_status', [
  'scheduled',    // Đã lên lịch
  'in_progress',  // Đang thực hiện
  'completed',    // Hoàn thành
  'cancelled',    // Hủy bỏ
  'delayed'       // Trì hoãn
]);

// Loại cảnh báo
export const alertTypeEnum = pgEnum('alert_type', [
  'danger',       // Nguy hiểm
  'warning',      // Cảnh báo
  'info',         // Thông tin
  'success'       // Thành công
]);

// ======= TABLES =======

// 1. Bảng VÙNG GIÁM SÁT
export const monitoringAreas = pgTable('monitoring_areas', {
  id: text('id').primaryKey(),                                         // ID vùng giám sát
  name: text('name').notNull(),                                        // Tên vùng giám sát
  description: text('description'),                                    // Mô tả
  
  // Ranh giới vùng giám sát (bounding box)
  northBound: real('north_bound').notNull(),                           // Giới hạn phía Bắc
  southBound: real('south_bound').notNull(),                           // Giới hạn phía Nam
  eastBound: real('east_bound').notNull(),                             // Giới hạn phía Đông
  westBound: real('west_bound').notNull(),                             // Giới hạn phía Tây
  
  // Thông tin về polygon chi tiết (có thể là GeoJSON)
  boundaryPolygon: jsonb('boundary_polygon'),                          // Ranh giới chi tiết dạng polygon
  
  // Thiết lập theo dõi
  monitorFrequency: monitorFrequencyEnum('monitor_frequency')
    .notNull()
    .default('monthly'),                                               // Tần suất theo dõi
  monitoringMethod: monitoringMethodEnum('monitoring_method')
    .notNull()
    .default('satellite'),                                             // Phương pháp theo dõi
  autoVerify: boolean('auto_verify').default(false),                   // Tự động xác minh
  
  // Thông tin trạng thái
  riskLevel: riskLevelEnum('risk_level').notNull().default('medium'),  // Mức độ rủi ro
  status: text('status').notNull().default('active'),                  // Trạng thái vùng
  
  // Thông tin thống kê
  totalInspections: integer('total_inspections').default(0),           // Tổng số lần kiểm tra
  latestInspectionId: text('latest_inspection_id'),                    // ID của lần kiểm tra gần nhất
  landslideCount: integer('landslide_count').default(0),               // Số điểm sạt lở đã phát hiện
  
  // Thông tin thời gian
  createdAt: timestamp('created_at').notNull().defaultNow(),           // Thời gian tạo
  updatedAt: timestamp('updated_at').notNull().defaultNow(),           // Thời gian cập nhật
  createdBy: text('created_by').default('system')                      // Người tạo
});

// 2. Bảng ĐỢT KIỂM TRA
export const inspectionEvents = pgTable('inspection_events', {
  id: text('id').primaryKey(),                                         // ID đợt kiểm tra
  monitoringAreaId: text('monitoring_area_id')
    .notNull()
    .references(() => monitoringAreas.id, { onDelete: 'cascade' }),    // ID vùng giám sát
  
  // Thông tin đợt kiểm tra
  name: text('name').notNull(),                                        // Tên đợt kiểm tra
  description: text('description'),                                    // Mô tả đợt kiểm tra
  method: monitoringMethodEnum('method').notNull(),                    // Phương pháp kiểm tra
  
  // Trạng thái và thời gian
  status: inspectionStatusEnum('status').notNull(),                    // Trạng thái kiểm tra
  scheduledDate: timestamp('scheduled_date').notNull(),                // Ngày dự kiến
  startDate: timestamp('start_date'),                                  // Ngày bắt đầu
  endDate: timestamp('end_date'),                                      // Ngày kết thúc
  
  // Thông tin kết quả
  findings: text('findings'),                                          // Phát hiện tổng quát
  landslideCount: integer('landslide_count').default(0),               // Số điểm sạt lở phát hiện
  reportUrl: text('report_url'),                                       // Đường dẫn báo cáo
  
  // Dữ liệu bổ sung
  metadata: jsonb('metadata'),                                         // Metadata bổ sung (JSON)
  
  // Thông tin thời gian hệ thống
  createdAt: timestamp('created_at').notNull().defaultNow(),           // Thời gian tạo
  updatedAt: timestamp('updated_at').notNull().defaultNow(),           // Thời gian cập nhật
  createdBy: text('created_by').default('system')                      // Người tạo
});

// 3. Bảng ĐIỂM SẠT LỞ
export const landslides = pgTable('landslides', {
  id: text('id').primaryKey(),                                         // ID điểm sạt lở
  
  // Thông tin cơ bản
  name: text('name').notNull(),                                        // Tên điểm sạt lở
  
  // Tọa độ chính xác
  lat: real('lat').notNull(),                                          // Vĩ độ - kiểu real để lưu số thập phân chính xác
  lng: real('lng').notNull(),                                          // Kinh độ
  elevation: real('elevation'),                                        // Độ cao (mét)
  
  // Thông tin phân loại và trạng thái
  type: text('type').default('landslide'),                             // Loại sạt lở
  status: landslideStatusEnum('status').notNull(),                     // Trạng thái sạt lở
  riskLevel: riskLevelEnum('risk_level').notNull().default('medium'),  // Mức độ rủi ro
  
  // Thông tin phát hiện
  firstDetectedAt: timestamp('first_detected_at').notNull(),           // Thời điểm phát hiện đầu tiên
  firstDetectionEventId: text('first_detection_event_id')
    .references(() => inspectionEvents.id),                            // Đợt kiểm tra phát hiện đầu tiên
  
  // Thông tin chi tiết
  affectedArea: text('affected_area'),                                 // Diện tích ảnh hưởng
  potentialImpact: text('potential_impact'),                           // Tác động tiềm tàng
  geometry: jsonb('geometry'),                                         // Hình dạng chi tiết (GeoJSON)
  
  // Lịch sử theo dõi
  history: jsonb('history'),                                           // Lịch sử theo dõi (JSON array)
  lastInspectionId: text('last_inspection_id')
    .references(() => inspectionEvents.id),                            // ID của lần kiểm tra gần nhất
  lastUpdate: timestamp('last_update').notNull(),                      // Thời điểm cập nhật trạng thái mới nhất
  
  // Dữ liệu phân tích
  stabilityIndex: real('stability_index'),                             // Chỉ số ổn định (0-1)
  movementRate: real('movement_rate'),                                 // Tốc độ dịch chuyển (mm/ngày)
  
  // Thông tin liên kết
  mediaUrls: jsonb('media_urls'),                                      // URL các phương tiện (ảnh, video)
  
  // Thông tin hệ thống
  createdAt: timestamp('created_at').notNull().defaultNow(),           // Thời gian tạo
  updatedAt: timestamp('updated_at').notNull().defaultNow(),           // Thời gian cập nhật
  createdBy: text('created_by').default('system')                      // Người tạo
});

// 4. Bảng QUAN TRẮC SẠT LỞ (theo từng lần kiểm tra)
export const landslideObservations = pgTable('landslide_observations', {
  id: uuid('id').primaryKey().defaultRandom(),                         // ID quan trắc
  
  // Khóa ngoại
  landslideId: text('landslide_id')
    .notNull()
    .references(() => landslides.id, { onDelete: 'cascade' }),         // ID điểm sạt lở
  inspectionEventId: text('inspection_event_id')
    .notNull()
    .references(() => inspectionEvents.id, { onDelete: 'cascade' }),   // ID đợt kiểm tra
  
  // Thông tin quan trắc
  observationDate: timestamp('observation_date').notNull(),            // Ngày quan trắc
  status: landslideStatusEnum('status').notNull(),                     // Trạng thái sạt lở tại thời điểm quan trắc
  
  // Các tham số đo lường
  movementDetected: boolean('movement_detected').default(false),       // Phát hiện dịch chuyển?
  movementRate: real('movement_rate'),                                 // Tốc độ dịch chuyển (mm/ngày)
  affectedAreaChange: real('affected_area_change'),                    // Thay đổi diện tích ảnh hưởng (%)
  stabilityChange: real('stability_change'),                           // Thay đổi độ ổn định
  
  // Thông tin rủi ro
  riskLevel: riskLevelEnum('risk_level').notNull(),                    // Đánh giá mức độ rủi ro
  riskFactors: jsonb('risk_factors'),                                  // Các yếu tố rủi ro (JSON)
  
  // Ghi chú và phương tiện
  notes: text('notes'),                                                // Ghi chú quan trắc
  mediaUrls: jsonb('media_urls'),                                      // URL các phương tiện
  
  // Hành động 
  recommendedActions: text('recommended_actions'),                     // Hành động khuyến nghị
  actualActions: text('actual_actions'),                               // Hành động thực tế
  
  // Thông tin người quan trắc
  observedBy: text('observed_by'),                                     // Người quan trắc
  verifiedBy: text('verified_by'),                                     // Người xác minh
  
  // Thông tin hệ thống
  createdAt: timestamp('created_at').notNull().defaultNow(),           // Thời gian tạo
  updatedAt: timestamp('updated_at').notNull().defaultNow()            // Thời gian cập nhật
}, (table) => {
  return {
    // Tạo unique constraint để tránh trùng lặp quan trắc
    landslideInspectionUnique: unique().on(
      table.landslideId, 
      table.inspectionEventId
    )
  };
});

// 5. Bảng KẾ HOẠCH KIỂM TRA
export const inspectionSchedules = pgTable('inspection_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),                         // ID kế hoạch
  
  // Khóa ngoại
  monitoringAreaId: text('monitoring_area_id')
    .notNull()
    .references(() => monitoringAreas.id, { onDelete: 'cascade' }),    // ID vùng giám sát
  
  // Thông tin lịch trình
  name: text('name').notNull(),                                        // Tên kế hoạch
  description: text('description'),                                    // Mô tả
  
  frequency: monitorFrequencyEnum('frequency').notNull(),              // Tần suất
  startDate: timestamp('start_date').notNull(),                        // Ngày bắt đầu
  endDate: timestamp('end_date'),                                      // Ngày kết thúc (có thể null nếu không có hạn)
  
  // Cấu hình tùy chỉnh cho lịch tần suất tùy chỉnh
  customScheduleConfig: jsonb('custom_schedule_config'),               // Cấu hình lịch tùy chỉnh (JSON)
  
  // Trạng thái
  isActive: boolean('is_active').notNull().default(true),              // Đang hoạt động?
  isPaused: boolean('is_paused').default(false),                       // Tạm dừng?
  
  // Thông tin về phương pháp
  monitoringMethod: monitoringMethodEnum('monitoring_method')
    .notNull()
    .default('satellite'),                                             // Phương pháp giám sát
  
  // Thông tin người lập kế hoạch
  createdBy: text('created_by').default('system'),                     // Người tạo kế hoạch
  approvedBy: text('approved_by'),                                     // Người phê duyệt kế hoạch
  
  // Thông tin liên quan đến kế hoạch
  nextScheduledDate: timestamp('next_scheduled_date'),                 // Ngày kiểm tra tiếp theo
  lastExecutedDate: timestamp('last_executed_date'),                   // Ngày thực hiện gần nhất
  
  // Thông tin hệ thống
  createdAt: timestamp('created_at').notNull().defaultNow(),           // Thời gian tạo
  updatedAt: timestamp('updated_at').notNull().defaultNow()            // Thời gian cập nhật
});

// 6. Bảng CẢNH BÁO
export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),                         // ID cảnh báo
  
  // Thông tin cảnh báo
  type: alertTypeEnum('type').notNull(),                               // Loại cảnh báo
  title: text('title').notNull(),                                      // Tiêu đề cảnh báo
  description: text('description').notNull(),                          // Mô tả cảnh báo
  
  // Thời gian cảnh báo
  date: timestamp('date').notNull().defaultNow(),                      // Thời gian phát sinh cảnh báo
  expiresAt: timestamp('expires_at'),                                  // Thời gian hết hạn cảnh báo
  
  // Trạng thái 
  read: boolean('read').notNull().default(false),                      // Đã đọc?
  acknowledged: boolean('acknowledged').default(false),                // Đã xác nhận?
  acknowledgedBy: text('acknowledged_by'),                             // Người xác nhận
  acknowledgedAt: timestamp('acknowledged_at'),                        // Thời gian xác nhận
  
  // Liên kết với các đối tượng khác
  landslideId: text('landslide_id')
    .references(() => landslides.id, { onDelete: 'set null' }),        // ID điểm sạt lở
  monitoringAreaId: text('monitoring_area_id')
    .references(() => monitoringAreas.id, { onDelete: 'set null' }),   // ID vùng giám sát
  inspectionEventId: text('inspection_event_id')
    .references(() => inspectionEvents.id, { onDelete: 'set null' }),  // ID đợt kiểm tra
  
  // Thông tin người dùng
  userId: text('user_id').notNull(),                                   // ID người dùng nhận cảnh báo
  
  // Thông tin hệ thống
  createdAt: timestamp('created_at').notNull().defaultNow()            // Thời gian tạo
});

// 7. Bảng CÀI ĐẶT THÔNG BÁO
export const notificationSettings = pgTable('notification_settings', {
  id: uuid('id').primaryKey().defaultRandom(),                         // ID cài đặt
  userId: text('user_id').notNull(),                                   // ID người dùng
  
  // Cài đặt kênh thông báo
  email: boolean('email').notNull().default(true),                     // Gửi email?
  emailAddress: text('email_address'),                                 // Địa chỉ email
  sms: boolean('sms').notNull().default(false),                        // Gửi SMS?
  phoneNumber: text('phone_number'),                                   // Số điện thoại
  
  // Cài đặt loại thông báo
  landslideAlerts: boolean('landslide_alerts').default(true),          // Cảnh báo sạt lở
  inspectionAlerts: boolean('inspection_alerts').default(true),        // Cảnh báo kiểm tra
  weatherAlerts: boolean('weather_alerts').default(true),              // Cảnh báo thời tiết
  weeklyReports: boolean('weekly_reports').default(false),             // Báo cáo hàng tuần
  monthlyReports: boolean('monthly_reports').default(true),            // Báo cáo hàng tháng
  
  // Cài đặt tiên tiến
  riskThreshold: text('risk_threshold').default('medium'),             // Ngưỡng rủi ro để thông báo
  doNotDisturbStart: text('do_not_disturb_start'),                     // Bắt đầu thời gian không làm phiền
  doNotDisturbEnd: text('do_not_disturb_end'),                         // Kết thúc thời gian không làm phiền
  
  // Thông tin hệ thống
  createdAt: timestamp('created_at').notNull().defaultNow(),           // Thời gian tạo
  updatedAt: timestamp('updated_at').notNull().defaultNow()            // Thời gian cập nhật
});

// 8. Bảng THIẾT BỊ CẢM BIẾN (nếu dự án có sử dụng cảm biến theo dõi)
export const sensors = pgTable('sensors', {
  id: text('id').primaryKey(),                                         // ID thiết bị
  
  // Thông tin thiết bị
  name: text('name').notNull(),                                        // Tên thiết bị
  type: text('type').notNull(),                                        // Loại thiết bị
  model: text('model'),                                                // Mẫu thiết bị
  
  // Vị trí thiết bị
  lat: real('lat').notNull(),                                          // Vĩ độ
  lng: real('lng').notNull(),                                          // Kinh độ
  elevation: real('elevation'),                                        // Độ cao
  
  // Liên kết
  monitoringAreaId: text('monitoring_area_id')
    .references(() => monitoringAreas.id),                             // ID vùng giám sát
  landslideId: text('landslide_id')
    .references(() => landslides.id),                                  // ID điểm sạt lở
  
  // Trạng thái thiết bị
  status: text('status').notNull().default('active'),                  // Trạng thái
  batteryLevel: integer('battery_level'),                              // Mức pin
  lastReading: timestamp('last_reading'),                              // Lần đọc dữ liệu gần nhất
  
  // Cấu hình
  readingFrequency: text('reading_frequency').default('hourly'),       // Tần suất đọc dữ liệu
  parameters: jsonb('parameters'),                                     // Các tham số cấu hình
  threshold: jsonb('threshold'),                                       // Ngưỡng cảnh báo
  
  // Thông tin hệ thống
  installationDate: timestamp('installation_date'),                    // Ngày lắp đặt
  lastMaintenanceDate: timestamp('last_maintenance_date'),             // Ngày bảo trì gần nhất
  createdAt: timestamp('created_at').notNull().defaultNow(),           // Thời gian tạo
  updatedAt: timestamp('updated_at').notNull().defaultNow()            // Thời gian cập nhật
});

// 9. Bảng DỮ LIỆU CẢM BIẾN
export const sensorData = pgTable('sensor_data', {
  id: uuid('id').primaryKey().defaultRandom(),                         // ID bản ghi dữ liệu
  
  // Liên kết
  sensorId: text('sensor_id')
    .notNull()
    .references(() => sensors.id, { onDelete: 'cascade' }),            // ID thiết bị cảm biến
  
  // Thông tin dữ liệu
  timestamp: timestamp('timestamp').notNull(),                         // Thời gian ghi dữ liệu
  data: jsonb('data').notNull(),                                       // Dữ liệu ghi nhận (JSON)
  
  // Trạng thái dữ liệu
  status: text('status').default('normal'),                            // Trạng thái dữ liệu
  anomalyDetected: boolean('anomaly_detected').default(false),         // Phát hiện bất thường?
  anomalyType: text('anomaly_type'),                                   // Loại bất thường
  
  // Thông tin bổ sung
  metadata: jsonb('metadata'),                                         // Metadata bổ sung
  
  // Thông tin hệ thống
  createdAt: timestamp('created_at').notNull().defaultNow()            // Thời gian tạo
});

// 10. Bảng BÁO CÁO
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),                         // ID báo cáo
  
  // Thông tin báo cáo
  title: text('title').notNull(),                                      // Tiêu đề báo cáo
  type: text('type').notNull(),                                        // Loại báo cáo
  description: text('description'),                                    // Mô tả báo cáo
  
  // Liên kết báo cáo
  monitoringAreaId: text('monitoring_area_id')
    .references(() => monitoringAreas.id),                             // ID vùng giám sát
  inspectionEventId: text('inspection_event_id')
    .references(() => inspectionEvents.id),                            // ID đợt kiểm tra
  
  // Thông tin nội dung
  content: text('content'),                                            // Nội dung báo cáo
  fileUrl: text('file_url'),                                           // URL file báo cáo
  
  // Thông tin phân phối
  isPublic: boolean('is_public').default(false),                       // Công khai?
  sharedWith: jsonb('shared_with'),                                    // Chia sẻ với ai
  
  // Thông tin người tạo
  createdBy: text('created_by').notNull(),                             // Người tạo
  approvedBy: text('approved_by'),                                     // Người phê duyệt
  
  // Thông tin thời gian
  periodStart: timestamp('period_start'),                              // Thời gian bắt đầu của kỳ báo cáo
  periodEnd: timestamp('period_end'),                                  // Thời gian kết thúc của kỳ báo cáo
  
  // Thông tin hệ thống
  createdAt: timestamp('created_at').notNull().defaultNow(),           // Thời gian tạo
  updatedAt: timestamp('updated_at').notNull().defaultNow()            // Thời gian cập nhật
});

// 11. Bảng NGƯỜI DÙNG
export const users = pgTable('users', {
  id: text('id').primaryKey(),                                         // ID người dùng
  
  // Thông tin cơ bản
  name: text('name').notNull(),                                        // Tên người dùng
  email: text('email').notNull().unique(),                             // Email (duy nhất)
  passwordHash: text('password_hash').notNull(),                       // Mật khẩu đã hash
  
  // Thông tin cá nhân
  role: text('role').notNull().default('user'),                        // Vai trò người dùng
  phoneNumber: text('phone_number'),                                   // Số điện thoại
  department: text('department'),                                      // Phòng ban
  
  // Trạng thái tài khoản
  isActive: boolean('is_active').default(true),                        // Tài khoản hoạt động?
  emailVerified: boolean('email_verified').default(false),             // Email đã xác minh?
  lastLogin: timestamp('last_login'),                                  // Lần đăng nhập cuối
  
  // Thông tin hệ thống
  createdAt: timestamp('created_at').notNull().defaultNow(),           // Thời gian tạo
  updatedAt: timestamp('updated_at').notNull().defaultNow()            // Thời gian cập nhật
});