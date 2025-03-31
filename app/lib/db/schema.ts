import { pgTable, serial, text, timestamp, integer, boolean, json, pgEnum } from 'drizzle-orm/pg-core';

// Enum cho trạng thái sạt lở
export const landslideStatusEnum = pgEnum('landslide_status', [
  'high_risk',
  'active',
  'stabilized',
  'monitored'
]);

// Enum cho tần suất giám sát
export const monitorFrequencyEnum = pgEnum('monitor_frequency', [
  'daily',
  'weekly',
  'biweekly',
  'monthly'
]);

// Enum cho mức độ rủi ro
export const riskLevelEnum = pgEnum('risk_level', [
  'high',
  'medium',
  'low'
]);

// Enum cho trạng thái giám sát
export const monitorStatusEnum = pgEnum('monitor_status', [
  'active',
  'paused'
]);

// Enum cho loại cảnh báo
export const alertTypeEnum = pgEnum('alert_type', [
  'danger',
  'warning',
  'info',
  'success'
]);

// Enum cho ngưỡng cảnh báo
export const thresholdEnum = pgEnum('threshold', [
  'low',
  'medium',
  'high'
]);

// Enum cho tần suất cập nhật
export const updateFrequencyEnum = pgEnum('update_frequency', [
  'immediate',
  'daily',
  'weekly'
]);

// Bảng điểm sạt lở
export const landslides = pgTable('landslides', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  lat: text('lat').notNull(),
  lng: text('lng').notNull(),
  detectedAt: timestamp('detected_at').notNull().defaultNow(),
  status: landslideStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  affectedArea: text('affected_area'),
  potentialImpact: text('potential_impact'),
  lastUpdate: timestamp('last_update').notNull().defaultNow(),
  history: json('history').$type<{
    date: string;
    status: string;
    note: string;
  }[]>().default([]),
});

// Bảng khu vực theo dõi
export const monitoringAreas = pgTable('monitoring_areas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  northBound: text('north_bound').notNull(),
  southBound: text('south_bound').notNull(),
  eastBound: text('east_bound').notNull(),
  westBound: text('west_bound').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  monitorFrequency: monitorFrequencyEnum('monitor_frequency').notNull(),
  lastChecked: timestamp('last_checked').notNull().defaultNow(),
  status: monitorStatusEnum('status').notNull().default('active'),
  detectedPoints: integer('detected_points').notNull().default(0),
  riskLevel: riskLevelEnum('risk_level').notNull(),
  landslideId: text('landslide_id').references(() => landslides.id),
  autoVerify: boolean('auto_verify').default(false),
});

// Bảng cài đặt thông báo
export const notificationSettings = pgTable('notification_settings', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  email: boolean('email').notNull().default(true),
  emailAddress: text('email_address'),
  sms: boolean('sms').notNull().default(false),
  phoneNumber: text('phone_number'),
  threshold: thresholdEnum('threshold').notNull().default('medium'),
  updateFrequency: updateFrequencyEnum('update_frequency').notNull().default('daily'),
  weatherForecast: boolean('weather_forecast').notNull().default(true),
  autoMonitor: boolean('auto_monitor').notNull().default(false),
  monthlyReport: boolean('monthly_report').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Bảng cảnh báo
export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  type: alertTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull().defaultNow(),
  landslideId: text('landslide_id').references(() => landslides.id),
  monitoringAreaId: text('monitoring_area_id').references(() => monitoringAreas.id),
  read: boolean('read').notNull().default(false),
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
