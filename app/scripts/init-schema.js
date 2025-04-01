const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function initSchema() {
  console.log('🔄 Khởi tạo schema cho database mới...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Tạo các enum
    console.log('Tạo các enum...');
    await client.query(`
      CREATE TYPE landslide_status AS ENUM (
        'high_risk', 'active', 'stabilized', 'monitored', 'remediated'
      );
      
      CREATE TYPE monitor_frequency AS ENUM (
        'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'custom'
      );
      
      CREATE TYPE risk_level AS ENUM (
        'critical', 'high', 'medium', 'low', 'negligible'
      );
      
      CREATE TYPE monitoring_method AS ENUM (
        'satellite', 'drone', 'ground', 'sensors', 'mixed'
      );
      
      CREATE TYPE inspection_status AS ENUM (
        'scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'
      );
      
      CREATE TYPE alert_type AS ENUM (
        'danger', 'warning', 'info', 'success'
      );
    `);

    // Tạo bảng landslides
    console.log('Tạo bảng landslides...');
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

    // Tạo bảng monitoring_areas
    console.log('Tạo bảng monitoring_areas...');
    await client.query(`
      CREATE TABLE monitoring_areas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
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

    // Tạo bảng inspection_events
    console.log('Tạo bảng inspection_events...');
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

    // Tạo bảng landslide_observations
    console.log('Tạo bảng landslide_observations...');
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

    // Tạo bảng notification_settings
    console.log('Tạo bảng notification_settings...');
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
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Tạo bảng alerts
    console.log('Tạo bảng alerts...');
    await client.query(`
      CREATE TABLE alerts (
        id SERIAL PRIMARY KEY,
        type alert_type NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        landslide_id TEXT REFERENCES landslides(id),
        monitoring_area_id TEXT REFERENCES monitoring_areas(id),
        read BOOLEAN NOT NULL DEFAULT FALSE,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Tạo các bảng khác nếu cần
    // ...

    await client.query('COMMIT');
    console.log('✅ Khởi tạo schema thành công!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khởi tạo schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

initSchema().catch(console.error);