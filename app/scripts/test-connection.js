const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const testConnection = async () => {
  // Hiển thị URL kết nối (che giấu mật khẩu)
  const connectionString = process.env.POSTGRES_URL || '';
  const maskedUrl = connectionString.replace(/:[^:]*@/, ':***@');
  console.log('Đang kết nối đến:', maskedUrl);

  // Tạo pool kết nối
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    // Thử kết nối và truy vấn đơn giản
    const client = await pool.connect();
    console.log('✅ Kết nối PostgreSQL thành công!');
    
    // Kiểm tra các bảng đã được tạo
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📋 Các bảng trong database:');
    res.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Đếm số lượng bản ghi trong mỗi bảng
    console.log('\n📊 Số lượng dữ liệu trong các bảng:');
    for (const table of res.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      console.log(`- ${table.table_name}: ${countRes.rows[0].count} bản ghi`);
    }

    client.release();
  } catch (err) {
    console.error('❌ Lỗi kết nối PostgreSQL:', err);
  } finally {
    await pool.end();
  }
};

testConnection();