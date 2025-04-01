// apply-schema.js
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function main() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('POSTGRES_URL không được định nghĩa!');
    process.exit(1);
  }

  console.log('Đang kết nối đến PostgreSQL...');
  
  const sql = postgres(connectionString, {
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  console.log('Đang tạo enum types...');
  
  // Tạo enum types
  const enumTypes = [
    "CREATE TYPE IF NOT EXISTS landslide_status AS ENUM ('high_risk', 'active', 'stabilized', 'monitored', 'remediated')",
    "CREATE TYPE IF NOT EXISTS monitor_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'custom')",
    "CREATE TYPE IF NOT EXISTS risk_level AS ENUM ('critical', 'high', 'medium', 'low', 'negligible')",
    "CREATE TYPE IF NOT EXISTS monitoring_method AS ENUM ('satellite', 'drone', 'ground', 'sensors', 'mixed')",
    "CREATE TYPE IF NOT EXISTS inspection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed')",
    "CREATE TYPE IF NOT EXISTS alert_type AS ENUM ('danger', 'warning', 'info', 'success')"
  ];

  for (const enumType of enumTypes) {
    try {
      await sql.unsafe(enumType);
      console.log(`✓ ${enumType}`);
    } catch (err) {
      console.error(`Lỗi khi tạo enum: ${err.message}`);
    }
  }

  // Tạo file SQL từ schema.ts
  console.log('Đang tạo file SQL từ schema...');
  
  // Import dynamically the schema
  const { exec } = require('child_process');
  exec('npx ts-node -e "import * as schema from \'./app/lib/db/schema\'; console.log(Object.keys(schema).join(\',\'))"', (err, stdout) => {
    if (err) {
      console.error('Không thể import schema:', err);
      return;
    }
    
    console.log('Các đối tượng trong schema:', stdout);
  });

  console.log('Hoàn tất!');
  await sql.end();
}

main().catch(console.error);