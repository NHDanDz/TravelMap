const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function initCompleteSchema() {
  console.log('🔄 Khởi tạo schema đầy đủ cho database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Tạo các enum nếu chưa tồn tại
    console.log('Tạo các enum...');
    
    // Kiểm tra và tạo enum landslide_status
    const landslideStatusExists = await enumExists(client, 'landslide_status');
    if (!landslideStatusExists) {
      await client.query(`
        CREATE TYPE landslide_status AS ENUM (
          'high_risk', 'active', 'stabilized', 'monitored', 'remediated'
        );
      `);
      console.log('✅ Đã tạo enum landslide_status');
    } else {
      console.log('⏭️ Enum landslide_status đã tồn tại');
    }
    
    // Kiểm tra và tạo enum monitor_frequency
    const monitorFrequencyExists = await enumExists(client, 'monitor_frequency');
    if (!monitorFrequencyExists) {
      await client.query(`
        CREATE TYPE monitor_frequency AS ENUM (
          'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'custom'
        );
      `);
      console.log('✅ Đã tạo enum monitor_frequency');
    } else {
      console.log('⏭️ Enum monitor_frequency đã tồn tại');
    }
    
    // Kiểm tra và tạo enum risk_level
    const riskLevelExists = await enumExists(client, 'risk_level');
    if (!riskLevelExists) {
      await client.query(`
        CREATE TYPE risk_level AS ENUM (
          'critical', 'high', 'medium', 'low', 'negligible'
        );
      `);
      console.log('✅ Đã tạo enum risk_level');
    } else {
      console.log('⏭️ Enum risk_level đã tồn tại');
    }
    
    // Kiểm tra và tạo enum monitoring_method
    const monitoringMethodExists = await enumExists(client, 'monitoring_method');
    if (!monitoringMethodExists) {
      await client.query(`
        CREATE TYPE monitoring_method AS ENUM (
          'satellite', 'drone', 'ground', 'sensors', 'mixed'
        );
      `);
      console.log('✅ Đã tạo enum monitoring_method');
    } else {
      console.log('⏭️ Enum monitoring_method đã tồn tại');
    }
    
    // Kiểm tra và tạo enum inspection_status
    const inspectionStatusExists = await enumExists(client, 'inspection_status');
    if (!inspectionStatusExists) {
      await client.query(`
        CREATE TYPE inspection_status AS ENUM (
          'scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'
        );
      `);
      console.log('✅ Đã tạo enum inspection_status');
    } else {
      console.log('⏭️ Enum inspection_status đã tồn tại');
    }
    
    // Kiểm tra và tạo enum alert_type
    const alertTypeExists = await enumExists(client, 'alert_type');
    if (!alertTypeExists) {
      await client.query(`
        CREATE TYPE alert_type AS ENUM (
          'danger', 'warning', 'info', 'success'
        );
      `);
      console.log('✅ Đã tạo enum alert_type');
    } else {
      console.log('⏭️ Enum alert_type đã tồn tại');
    }
    
    // Kiểm tra và cài đặt extension uuid-ossp
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      console.log('✅ Đã cài đặt extension uuid-ossp');
    } catch (error) {
      console.warn('⚠️ Không thể cài đặt extension uuid-ossp:', error.message);
    }

    // Tạo bảng landslides
    console.log('Kiểm tra và tạo bảng landslides...');
    const landslidesExists = await tableExists(client, 'landslides');
    if (!landslidesExists) {
      await client.query(`
        CREATE TABLE landslides (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          lat TEXT NOT NULL,
          lng TEXT NOT NULL,
          detected_at TIMESTAMP NOT NULL DEFAULT NOW(),
          status landslide_status NOT NULL,
          affected_area TEXT,
          potential_impact TEXT,
          last_update TIMESTAMP NOT NULL DEFAULT NOW(),
          history TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Đã tạo bảng landslides');
    } else {
      console.log('⏭️ Bảng landslides đã tồn tại');
    }

    // Tạo bảng monitoring_areas
    console.log('Kiểm tra và tạo bảng monitoring_areas...');
    const monitoringAreasExists = await tableExists(client, 'monitoring_areas');
    if (!monitoringAreasExists) {
      await client.query(`
        CREATE TABLE monitoring_areas (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          north_bound TEXT NOT NULL,
          south_bound TEXT NOT NULL,
          east_bound TEXT NOT NULL,
          west_bound TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          monitor_frequency monitor_frequency NOT NULL,
          last_checked TIMESTAMP NOT NULL DEFAULT NOW(),
          status TEXT NOT NULL DEFAULT 'active',
          detected_points INTEGER NOT NULL DEFAULT 0,
          risk_level risk_level NOT NULL,
          landslide_id TEXT REFERENCES landslides(id),
          auto_verify BOOLEAN DEFAULT FALSE,
          monitoring_method monitoring_method DEFAULT 'satellite',
          boundary_polygon JSONB
        );
      `);
      console.log('✅ Đã tạo bảng monitoring_areas');
    } else {
      console.log('⏭️ Bảng monitoring_areas đã tồn tại');
    }

    // Tạo bảng inspection_events
    console.log('Kiểm tra và tạo bảng inspection_events...');
    const inspectionEventsExists = await tableExists(client, 'inspection_events');
    if (!inspectionEventsExists) {
      await client.query(`
        CREATE TABLE inspection_events (
          id TEXT PRIMARY KEY,
          monitoring_area_id TEXT NOT NULL REFERENCES monitoring_areas(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          description TEXT,
          method monitoring_method NOT NULL,
          status inspection_status NOT NULL,
          scheduled_date TIMESTAMP NOT NULL,
          start_date TIMESTAMP,
          end_date TIMESTAMP,
          findings TEXT,
          landslide_count INTEGER DEFAULT 0,
          report_url TEXT,
          metadata JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_by TEXT DEFAULT 'system'
        );
      `);
      console.log('✅ Đã tạo bảng inspection_events');
    } else {
      console.log('⏭️ Bảng inspection_events đã tồn tại');
    }

    // Tạo bảng landslide_observations
    console.log('Kiểm tra và tạo bảng landslide_observations...');
    const landslideObservationsExists = await tableExists(client, 'landslide_observations');
    if (!landslideObservationsExists) {
      await client.query(`
        CREATE TABLE landslide_observations (
          id UUID PRIMARY KEY,
          landslide_id TEXT NOT NULL REFERENCES landslides(id) ON DELETE CASCADE,
          inspection_event_id TEXT NOT NULL REFERENCES inspection_events(id) ON DELETE CASCADE,
          observation_date TIMESTAMP NOT NULL,
          status landslide_status NOT NULL,
          movement_detected BOOLEAN DEFAULT FALSE,
          movement_rate REAL,
          affected_area_change REAL,
          stability_change REAL,
          risk_level risk_level NOT NULL,
          risk_factors JSONB,
          notes TEXT,
          media_urls JSONB,
          recommended_actions TEXT,
          actual_actions TEXT,
          observed_by TEXT,
          verified_by TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(landslide_id, inspection_event_id)
        );
      `);
      console.log('✅ Đã tạo bảng landslide_observations');
    } else {
      console.log('⏭️ Bảng landslide_observations đã tồn tại');
    }

    // Tạo bảng notification_settings
    console.log('Kiểm tra và tạo bảng notification_settings...');
    const notificationSettingsExists = await tableExists(client, 'notification_settings');
    if (!notificationSettingsExists) {
      await client.query(`
        CREATE TABLE notification_settings (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          email BOOLEAN NOT NULL DEFAULT TRUE,
          email_address TEXT,
          sms BOOLEAN NOT NULL DEFAULT FALSE,
          phone_number TEXT,
          threshold TEXT NOT NULL DEFAULT 'medium',
          update_frequency TEXT NOT NULL DEFAULT 'daily',
          weather_forecast BOOLEAN NOT NULL DEFAULT TRUE,
          auto_monitor BOOLEAN NOT NULL DEFAULT FALSE,
          monthly_report BOOLEAN NOT NULL DEFAULT TRUE,
          landslide_alerts BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Đã tạo bảng notification_settings');
    } else {
      console.log('⏭️ Bảng notification_settings đã tồn tại');
    }

    // Tạo bảng alerts
    console.log('Kiểm tra và tạo bảng alerts...');
    const alertsExists = await tableExists(client, 'alerts');
    if (!alertsExists) {
      await client.query(`
        CREATE TABLE alerts (
          id SERIAL PRIMARY KEY,
          type alert_type NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          date TIMESTAMP NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMP,
          landslide_id TEXT REFERENCES landslides(id),
          monitoring_area_id TEXT REFERENCES monitoring_areas(id),
          read BOOLEAN NOT NULL DEFAULT FALSE,
          user_id TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Đã tạo bảng alerts');
    } else {
      console.log('⏭️ Bảng alerts đã tồn tại');
    }

    // Tạo bảng sensors
    console.log('Kiểm tra và tạo bảng sensors...');
    const sensorsExists = await tableExists(client, 'sensors');
    if (!sensorsExists) {
      await client.query(`
        CREATE TABLE sensors (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          model TEXT,
          lat TEXT NOT NULL,
          lng TEXT NOT NULL,
          elevation TEXT,
          monitoring_area_id TEXT REFERENCES monitoring_areas(id) ON DELETE CASCADE,
          landslide_id TEXT REFERENCES landslides(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'active',
          battery_level INTEGER,
          last_reading TIMESTAMP,
          reading_frequency TEXT,
          installation_date TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Đã tạo bảng sensors');
    } else {
      console.log('⏭️ Bảng sensors đã tồn tại');
    }

    // Tạo bảng sensor_data
    console.log('Kiểm tra và tạo bảng sensor_data...');
    const sensorDataExists = await tableExists(client, 'sensor_data');
    if (!sensorDataExists) {
      await client.query(`
        CREATE TABLE sensor_data (
          id UUID PRIMARY KEY,
          sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
          timestamp TIMESTAMP NOT NULL,
          data JSONB NOT NULL,
          status TEXT NOT NULL DEFAULT 'normal',
          anomaly_detected BOOLEAN DEFAULT FALSE,
          anomaly_type TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('✅ Đã tạo bảng sensor_data');
    } else {
      console.log('⏭️ Bảng sensor_data đã tồn tại');
    }

    await client.query('COMMIT');
    console.log('✅ Khởi tạo schema đầy đủ thành công!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khởi tạo schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Hàm kiểm tra xem một bảng có tồn tại hay không
async function tableExists(client, tableName) {
  const query = `
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_name = $1
    );
  `;
  
  const result = await client.query(query, [tableName]);
  return result.rows[0].exists;
}

// Hàm kiểm tra xem một cột có tồn tại trong bảng hay không
async function columnExists(client, tableName, columnName) {
  const query = `
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = $1 
      AND column_name = $2
    );
  `;
  
  const result = await client.query(query, [tableName, columnName]);
  return result.rows[0].exists;
}

// Hàm kiểm tra xem một enum có tồn tại hay không
async function enumExists(client, enumName) {
  const query = `
    SELECT EXISTS (
      SELECT 1 
      FROM pg_type 
      WHERE typname = $1
    );
  `;
  
  const result = await client.query(query, [enumName]);
  return result.rows[0].exists;
}

// Thực hiện khởi tạo schema
(async () => {
  try {
    await initCompleteSchema();
    console.log('✅ Đã khởi tạo schema đầy đủ thành công!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await pool.end();
  }
})();