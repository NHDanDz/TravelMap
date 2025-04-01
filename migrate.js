const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');
const path = require('path');

async function runMigration() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('POSTGRES_URL không được định nghĩa trong biến môi trường');
    process.exit(1);
  }
  
  console.log('Đang kết nối đến PostgreSQL...');
  const sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
  const db = drizzle(sql);

  console.log('Đang thực hiện migration...');
  await migrate(db, { migrationsFolder: path.resolve('./drizzle') });
  console.log('Migration hoàn tất!');
  
  await sql.end();
}

runMigration().catch(err => {
  console.error('Lỗi khi thực hiện migration:', err);
  process.exit(1);
});