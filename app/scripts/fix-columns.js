const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

/**
 * This script synchronizes your database schema with the schema defined in your code
 * It fixes all the column mismatches that are causing errors in your application
 */

// Main function to run the fixes
async function syncDatabaseSchema() {
  console.log('🔄 Bắt đầu đồng bộ hóa cấu trúc database...');
  
  const client = await pool.connect();
  let hasErrors = false;
  
  try {
    // Bắt đầu transaction
    await client.query('BEGIN');
    
    // ===== 1. FIX LANDSLIDES TABLE =====
    console.log('\n🔍 Đang kiểm tra bảng landslides...');
    
    // Check if first_detected_at exists
    const firstDetectedExists = await columnExists(client, 'landslides', 'first_detected_at');
    if (!firstDetectedExists) {
      console.log('  ➕ Thêm cột first_detected_at vào bảng landslides');
      await client.query(`
        ALTER TABLE landslides 
        ADD COLUMN first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
    }
    
    // ===== 2. FIX MONITORING_AREAS TABLE =====
    console.log('\n🔍 Đang kiểm tra bảng monitoring_areas...');
    
    // Check if updated_at exists
    const updatedAtExists = await columnExists(client, 'monitoring_areas', 'updated_at');
    if (!updatedAtExists) {
      console.log('  ➕ Thêm cột updated_at vào bảng monitoring_areas');
      await client.query(`
        ALTER TABLE monitoring_areas 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
    }
    
    // Check if landslide_count exists
    const landslideCountExists = await columnExists(client, 'monitoring_areas', 'landslide_count');
    if (!landslideCountExists) {
      console.log('  ➕ Thêm cột landslide_count vào bảng monitoring_areas');
      await client.query(`
        ALTER TABLE monitoring_areas 
        ADD COLUMN landslide_count INTEGER DEFAULT 0
      `);
    }
    
    // ===== 3. FIX NOTIFICATION_SETTINGS TABLE =====
    console.log('\n🔍 Đang kiểm tra bảng notification_settings...');
    
    // Check for difference between monthly_report and monthly_reports
    const monthlyReportsExists = await columnExists(client, 'notification_settings', 'monthly_reports');
    const monthlyReportExists = await columnExists(client, 'notification_settings', 'monthly_report');
    
    if (!monthlyReportsExists) {
      if (monthlyReportExists) {
        // Rename column if the singular version exists
        console.log('  🔄 Đổi tên cột monthly_report thành monthly_reports');
        await client.query(`
          ALTER TABLE notification_settings 
          RENAME COLUMN monthly_report TO monthly_reports
        `);
      } else {
        // Add column if neither exists
        console.log('  ➕ Thêm cột monthly_reports vào bảng notification_settings');
        await client.query(`
          ALTER TABLE notification_settings 
          ADD COLUMN monthly_reports BOOLEAN DEFAULT TRUE
        `);
      }
    }
    
    // Check for weekly_reports
    const weeklyReportsExists = await columnExists(client, 'notification_settings', 'weekly_reports');
    if (!weeklyReportsExists) {
      console.log('  ➕ Thêm cột weekly_reports vào bảng notification_settings');
      await client.query(`
        ALTER TABLE notification_settings 
        ADD COLUMN weekly_reports BOOLEAN DEFAULT FALSE
      `);
    }
    
    // ===== 4. FIX ALERTS TABLE =====
    console.log('\n🔍 Đang kiểm tra bảng alerts...');
    
    // Check for inspection_event_id
    const inspectionEventIdExists = await columnExists(client, 'alerts', 'inspection_event_id');
    if (!inspectionEventIdExists) {
      console.log('  ➕ Thêm cột inspection_event_id vào bảng alerts');
      await client.query(`
        ALTER TABLE alerts 
        ADD COLUMN inspection_event_id TEXT
      `);
      
      // Add foreign key if the inspections_events table exists
      const inspectionEventsExists = await tableExists(client, 'inspection_events');
      if (inspectionEventsExists) {
        console.log('  🔗 Thêm khóa ngoại cho inspection_event_id');
        await client.query(`
          ALTER TABLE alerts
          ADD CONSTRAINT fk_alerts_inspection_event
          FOREIGN KEY (inspection_event_id)
          REFERENCES inspection_events(id)
          ON DELETE SET NULL
        `);
      }
    }
    
    // Check for acknowledged_at
    const acknowledgedAtExists = await columnExists(client, 'alerts', 'acknowledged_at');
    if (!acknowledgedAtExists) {
      console.log('  ➕ Thêm cột acknowledged_at vào bảng alerts');
      await client.query(`
        ALTER TABLE alerts 
        ADD COLUMN acknowledged_at TIMESTAMP WITH TIME ZONE
      `);
    }
    
    // Check for risk_level
    const alertRiskLevelExists = await columnExists(client, 'alerts', 'risk_level');
    if (!alertRiskLevelExists) {
      console.log('  ➕ Thêm cột risk_level vào bảng alerts');
      await client.query(`
        ALTER TABLE alerts 
        ADD COLUMN risk_level VARCHAR(20)
      `);
    }
    
    // ===== 5. FIX COLUMN CASE IN ALL TABLES =====
    
    // Check for camelCase vs snake_case discrepancies in notification_settings
    console.log('\n🔍 Đang kiểm tra và sửa lỗi camelCase vs snake_case...');
    
    // Fix in notification_settings
    const camelCaseColumns = [
      { camelCase: 'emailAddress', snakeCase: 'email_address' },
      { camelCase: 'phoneNumber', snakeCase: 'phone_number' },
      { camelCase: 'updateFrequency', snakeCase: 'update_frequency' },
      { camelCase: 'weatherForecast', snakeCase: 'weather_forecast' },
      { camelCase: 'autoMonitor', snakeCase: 'auto_monitor' },
      { camelCase: 'createdAt', snakeCase: 'created_at' },
      { camelCase: 'updatedAt', snakeCase: 'updated_at' },
      { camelCase: 'userId', snakeCase: 'user_id' }
    ];
    
    for (const column of camelCaseColumns) {
      const camelExists = await columnExists(client, 'notification_settings', column.camelCase);
      const snakeExists = await columnExists(client, 'notification_settings', column.snakeCase);
      
      if (camelExists && !snakeExists) {
        console.log(`  🔄 Đổi tên cột ${column.camelCase} thành ${column.snakeCase} trong bảng notification_settings`);
        await client.query(`
          ALTER TABLE notification_settings 
          RENAME COLUMN "${column.camelCase}" TO ${column.snakeCase}
        `);
      } else if (!camelExists && !snakeExists && column.snakeCase === 'user_id') {
        // Special case for user_id which might be missing
        console.log(`  ➕ Thêm cột ${column.snakeCase} vào bảng notification_settings`);
        await client.query(`
          ALTER TABLE notification_settings 
          ADD COLUMN ${column.snakeCase} TEXT NOT NULL DEFAULT 'default'
        `);
      }
    }
    
    // Similar fixes for alerts table
    const alertsCamelCaseColumns = [
      { camelCase: 'landslideId', snakeCase: 'landslide_id' },
      { camelCase: 'monitoringAreaId', snakeCase: 'monitoring_area_id' },
      { camelCase: 'userId', snakeCase: 'user_id' },
      { camelCase: 'createdAt', snakeCase: 'created_at' }
    ];
    
    for (const column of alertsCamelCaseColumns) {
      const camelExists = await columnExists(client, 'alerts', column.camelCase);
      const snakeExists = await columnExists(client, 'alerts', column.snakeCase);
      
      if (camelExists && !snakeExists) {
        console.log(`  🔄 Đổi tên cột ${column.camelCase} thành ${column.snakeCase} trong bảng alerts`);
        await client.query(`
          ALTER TABLE alerts 
          RENAME COLUMN "${column.camelCase}" TO ${column.snakeCase}
        `);
      }
    }
    
    // ===== 6. COMMIT CHANGES =====
    console.log('\n✅ Đang lưu các thay đổi...');
    await client.query('COMMIT');
    console.log('🎉 Đã đồng bộ hóa cấu trúc database thành công!');
    
    // ===== 7. VERIFY FIXES =====
    await verifyFixes(client);
    
  } catch (error) {
    console.error('❌ Lỗi khi thực hiện đồng bộ hóa:', error);
    await client.query('ROLLBACK');
    hasErrors = true;
  } finally {
    client.release();
  }
  
  return !hasErrors;
}

// Helper function to check if a column exists
async function columnExists(client, table, column) {
  const result = await client.query(`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = $1 
      AND column_name = $2
    ) as exists
  `, [table, column]);
  
  return result.rows[0].exists;
}

// Helper function to check if a table exists
async function tableExists(client, table) {
  const result = await client.query(`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_name = $1
    ) as exists
  `, [table]);
  
  return result.rows[0].exists;
}

// Verify all fixes have been applied
async function verifyFixes(client) {
  console.log('\n🔍 Kiểm tra lại các sửa chữa...');
  
  // Columns to verify across different tables
  const columnsToVerify = [
    { table: 'landslides', column: 'first_detected_at' },
    { table: 'monitoring_areas', column: 'updated_at' },
    { table: 'monitoring_areas', column: 'landslide_count' },
    { table: 'notification_settings', column: 'monthly_reports' },
    { table: 'notification_settings', column: 'weekly_reports' },
    { table: 'alerts', column: 'inspection_event_id' },
    { table: 'alerts', column: 'acknowledged_at' },
    { table: 'alerts', column: 'risk_level' }
  ];
  
  let allFixed = true;
  
  for (const {table, column} of columnsToVerify) {
    const exists = await columnExists(client, table, column);
    
    if (exists) {
      console.log(`  ✅ Cột ${column} đã tồn tại trong bảng ${table}`);
    } else {
      console.log(`  ❌ Cột ${column} vẫn chưa tồn tại trong bảng ${table}`);
      allFixed = false;
    }
  }
  
  if (allFixed) {
    console.log('\n🎯 Tất cả các vấn đề đã được sửa chữa thành công!');
  } else {
    console.log('\n⚠️ Một số vấn đề vẫn chưa được sửa chữa, vui lòng kiểm tra lại.');
  }
}

// Main execution
async function main() {
  console.log('🚀 Bắt đầu quá trình sửa chữa database...');
  
  try {
    const success = await syncDatabaseSchema();
    
    if (success) {
      console.log('\n✨ Quá trình sửa chữa hoàn tất thành công!');
      console.log('🔸 Ứng dụng của bạn bây giờ có thể hoạt động bình thường.');
      console.log('🔸 Các lỗi missing column sẽ không còn xuất hiện nữa.');
    } else {
      console.log('\n⚠️ Quá trình sửa chữa chưa hoàn tất, vui lòng kiểm tra lỗi ở trên.');
    }
  } catch (error) {
    console.error('❌ Lỗi không xử lý được:', error);
  } finally {
    // Đóng kết nối đến pool
    await pool.end();
  }
}

// Chạy script
main();