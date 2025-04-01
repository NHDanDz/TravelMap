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
      ALTER TYPE landslide_status AS ENUM (
        'high_risk', 'active', 'stabilized', 'monitored', 'remediated'
      );
      
      ALTER TYPE monitor_frequency AS ENUM (
        'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'custom'
      );
      
      ALTER TYPE risk_level AS ENUM (
        'critical', 'high', 'medium', 'low', 'negligible'
      );
      
      ALTER TYPE monitoring_method AS ENUM (
        'satellite', 'drone', 'ground', 'sensors', 'mixed'
      );
      
      ALTER TYPE inspection_status AS ENUM (
        'scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'
      );
      
      ALTER TYPE alert_type AS ENUM (
        'danger', 'warning', 'info', 'success'
      );
    `);

    // Tạo bảng landslides
    console.log('Tạo bảng landslides...');
    await client.query(`
      ALTER TABLE landslides (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        lat TEXT NOT NULL,
        lng TEXT NOT NULL,
        elevation REAL,
        type TEXT DEFAULT 'landslide',
        status landslide_status NOT NULL,
        risk_level risk_level NOT NULL DEFAULT 'medium',
        first_detected_at TIMESTAMP NOT NULL DEFAULT NOW(),
        first_detection_event_id TEXT,
        affected_area TEXT,
        potential_impact TEXT,
        geometry JSONB,
        history JSONB,
        last_inspection_id TEXT,
        last_update TIMESTAMP NOT NULL DEFAULT NOW(),
        stability_index REAL,
        movement_rate REAL,
        media_urls JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_by TEXT DEFAULT 'system'
      );
    `);

    // Tạo bảng monitoring_areas
    console.log('Tạo bảng monitoring_areas...');
    await client.query(`
      ALTER TABLE monitoring_areas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        north_bound REAL NOT NULL,
        south_bound REAL NOT NULL,
        east_bound REAL NOT NULL,
        west_bound REAL NOT NULL,
        boundary_polygon JSONB,
        monitor_frequency monitor_frequency NOT NULL DEFAULT 'monthly',
        monitoring_method monitoring_method NOT NULL DEFAULT 'satellite',
        auto_verify BOOLEAN DEFAULT FALSE,
        risk_level risk_level NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'active',
        total_inspections INTEGER DEFAULT 0,
        latest_inspection_id TEXT,
        landslide_count INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_by TEXT DEFAULT 'system'
      );
    `);

    // Tạo bảng inspection_events
    console.log('Tạo bảng inspection_events...');
    await client.query(`
      ALTER TABLE inspection_events (
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
      ALTER TABLE landslide_observations (
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
      ALTER TABLE notification_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        email BOOLEAN NOT NULL DEFAULT TRUE,
        email_address TEXT,
        sms BOOLEAN NOT NULL DEFAULT FALSE,
        phone_number TEXT,
        landslide_alerts BOOLEAN DEFAULT TRUE,
        inspection_alerts BOOLEAN DEFAULT TRUE,
        weather_alerts BOOLEAN DEFAULT TRUE,
        weekly_reports BOOLEAN DEFAULT FALSE,
        monthly_reports BOOLEAN DEFAULT TRUE,
        threshold TEXT NOT NULL DEFAULT 'medium',
        update_frequency TEXT NOT NULL DEFAULT 'daily',
        weather_forecast BOOLEAN NOT NULL DEFAULT TRUE,
        auto_monitor BOOLEAN NOT NULL DEFAULT FALSE,
        monthly_report BOOLEAN NOT NULL DEFAULT TRUE,
        risk_threshold TEXT DEFAULT 'medium',
        do_not_disturb_start TEXT,
        do_not_disturb_end TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Tạo bảng alerts
    console.log('Tạo bảng alerts...');
    await client.query(`
      ALTER TABLE alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type alert_type NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        acknowledged BOOLEAN DEFAULT FALSE,
        acknowledged_by TEXT,
        acknowledged_at TIMESTAMP,
        landslide_id TEXT REFERENCES landslides(id) ON DELETE SET NULL,
        monitoring_area_id TEXT REFERENCES monitoring_areas(id) ON DELETE SET NULL,
        inspection_event_id TEXT REFERENCES inspection_events(id) ON DELETE SET NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Add foreign key references after all tables are created
    console.log('Adding foreign key references...');
    await client.query(`
      ALTER TABLE landslides 
        ADD CONSTRAINT fk_landslide_first_detection 
        FOREIGN KEY (first_detection_event_id) 
        REFERENCES inspection_events(id);
      
      ALTER TABLE landslides 
        ADD CONSTRAINT fk_landslide_last_inspection 
        FOREIGN KEY (last_inspection_id) 
        REFERENCES inspection_events(id);
        
      ALTER TABLE monitoring_areas 
        ADD CONSTRAINT fk_monitoring_area_latest_inspection 
        FOREIGN KEY (latest_inspection_id) 
        REFERENCES inspection_events(id);
    `);

    await client.query('COMMIT');
    console.log('✅ Khởi tạo schema thành công!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khởi tạo schema:', error);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

initSchema().catch(console.error);