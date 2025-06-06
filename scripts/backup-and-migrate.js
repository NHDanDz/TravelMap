// scripts/backup-and-migrate.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function backupAndMigrate() {
  console.log('🗄️ TravelSense Database Migration Tool\n');

  try {
    // 1. Get local database info
    console.log('📋 BƯỚC 1: Thông tin database local');
    const localHost = await question('Local host (localhost): ') || 'localhost';
    const localPort = await question('Local port (5432): ') || '5432';
    const localUser = await question('Local username (postgres): ') || 'postgres';
    const localDb = await question('Local database name: ');
    
    if (!localDb) {
      console.log('❌ Cần nhập tên database!');
      process.exit(1);
    }

    // 2. Test local connection
    console.log('\n🔍 BƯỚC 2: Kiểm tra kết nối local...');
    try {
      execSync(`psql -h ${localHost} -p ${localPort} -U ${localUser} -d ${localDb} -c "SELECT version();"`, { stdio: 'ignore' });
      console.log('✅ Kết nối local database thành công!');
    } catch (error) {
      console.log('❌ Không thể kết nối local database. Kiểm tra:');
      console.log('   - PostgreSQL đang chạy?');
      console.log('   - Username/password đúng?');
      console.log('   - Database tồn tại?');
      process.exit(1);
    }

    // 3. Backup local database
    console.log('\n📦 BƯỚC 3: Backup database local...');
    const backupFile = `backup_${Date.now()}.sql`;
    const backupPath = path.join(process.cwd(), backupFile);
    
    try {
      console.log(`   Đang backup vào ${backupFile}...`);
      execSync(`pg_dump -h ${localHost} -p ${localPort} -U ${localUser} -d ${localDb} > ${backupFile}`, { stdio: 'inherit' });
      
      const backupSize = fs.statSync(backupPath).size;
      console.log(`✅ Backup thành công! Kích thước: ${(backupSize / 1024).toFixed(2)} KB`);
      
      if (backupSize < 100) {
        console.log('⚠️  Cảnh báo: Backup file nhỏ, có thể database trống.');
      }
    } catch (error) {
      console.log('❌ Lỗi khi backup:', error.message);
      process.exit(1);
    }

    // 4. Get cloud database URL
    console.log('\n☁️ BƯỚC 4: Thông tin cloud database');
    console.log('   Nếu chưa có, tạo tại: https://neon.tech');
    const cloudUrl = await question('Cloud database URL: ');
    
    if (!cloudUrl) {
      console.log('❌ Cần nhập cloud database URL!');
      console.log('💡 Format: postgresql://user:pass@host:port/dbname?sslmode=require');
      process.exit(1);
    }

    // 5. Test cloud connection
    console.log('\n🔍 BƯỚC 5: Kiểm tra kết nối cloud...');
    try {
      execSync(`psql "${cloudUrl}" -c "SELECT version();"`, { stdio: 'ignore' });
      console.log('✅ Kết nối cloud database thành công!');
    } catch (error) {
      console.log('❌ Không thể kết nối cloud database. Kiểm tra URL!');
      process.exit(1);
    }

    // 6. Setup schema using Prisma
    console.log('\n🏗️ BƯỚC 6: Setup schema với Prisma...');
    try {
      // Temporarily set cloud URL
      process.env.POSTGRES_URL = cloudUrl;
      
      console.log('   Đang tạo schema...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      
      console.log('   Đang generate Prisma client...');
      execSync('npx prisma generate', { stdio: 'ignore' });
      
      console.log('✅ Schema đã được tạo!');
    } catch (error) {
      console.log('❌ Lỗi khi setup schema:', error.message);
      process.exit(1);
    }

    // 7. Migrate data
    console.log('\n📥 BƯỚC 7: Migrate dữ liệu...');
    const shouldMigrateData = await question('Migrate dữ liệu từ backup? (y/n): ');
    
    if (shouldMigrateData.toLowerCase() === 'y') {
      try {
        console.log('   Đang restore dữ liệu...');
        execSync(`psql "${cloudUrl}" < ${backupFile}`, { stdio: 'inherit' });
        console.log('✅ Dữ liệu đã được migrate!');
      } catch (error) {
        console.log('⚠️  Một số lỗi khi migrate dữ liệu (có thể do conflict):');
        console.log('   Bạn có thể migrate thủ công từ file:', backupFile);
      }
    }

    // 8. Create test user
    console.log('\n👤 BƯỚC 8: Tạo test user...');
    try {
      execSync('node scripts/create-test-user.js', { stdio: 'inherit' });
      console.log('✅ Test user đã được tạo!');
    } catch (error) {
      console.log('⚠️  Không thể tạo test user (có thể đã tồn tại)');
    }

    // 9. Verify migration
    console.log('\n✅ BƯỚC 9: Kiểm tra migration...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const userCount = await prisma.user.count();
      const placeCount = await prisma.place.count();
      const tripCount = await prisma.trip.count();
      
      console.log(`   Users: ${userCount}`);
      console.log(`   Places: ${placeCount}`);
      console.log(`   Trips: ${tripCount}`);
      
      await prisma.$disconnect();
      console.log('✅ Verification thành công!');
    } catch (error) {
      console.log('⚠️  Không thể verify (Prisma chưa được config)');
    }

    // 10. Setup environment
    console.log('\n⚙️ BƯỚC 10: Setup environment variables...');
    const envContent = `
# Cloud Database (Production)
POSTGRES_URL="${cloudUrl}"

# API Keys (thêm nếu cần)
NEXT_PUBLIC_COORDINATES_SERVER_URL="https://your-api-server.com"
NEXT_PUBLIC_API_KEY="your-api-key"
`;

    fs.writeFileSync('.env.production', envContent);
    console.log('✅ File .env.production đã được tạo!');

    // 11. Final instructions
    console.log('\n🎉 MIGRATION HOÀN THÀNH!');
    console.log('\n📝 Các bước tiếp theo:');
    console.log('1. Để deploy lên Vercel:');
    console.log('   vercel env add POSTGRES_URL');
    console.log(`   (paste: ${cloudUrl})`);
    console.log('   vercel --prod');
    console.log('\n2. File backup được lưu tại:', backupFile);
    console.log('3. Có thể xóa file backup sau khi verify thành công');
    console.log('\n4. Test app local với cloud DB:');
    console.log('   cp .env.production .env.local');
    console.log('   npm run dev');

  } catch (error) {
    console.error('\n❌ Lỗi không mong muốn:', error.message);
  } finally {
    rl.close();
  }
}

// Run script
if (require.main === module) {
  backupAndMigrate();
}

module.exports = { backupAndMigrate };