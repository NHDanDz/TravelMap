// scripts/create-test-user.js
const { PrismaClient } = require('@prisma/client');

async function createTestUser() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Checking existing users...');
    
    const existingUsers = await prisma.user.findMany({
      select: { id: true, username: true, email: true }
    });
    
    console.log('📊 Current users:', existingUsers);

    // Check if test user already exists
    const testUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'testuser' },
          { email: 'test@example.com' }
        ]
      }
    });

    if (testUser) {
      console.log('✅ Test user already exists:', testUser);
      return testUser;
    }

    console.log('🆕 Creating test user...');
    
    const newUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: Buffer.from('password123').toString('base64'), // Simple hash for testing
        fullName: 'Test User'
      }
    });

    console.log('✅ Test user created successfully:');
    console.log({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName
    });

    // Create a few more test users
    const additionalUsers = [
      {
        username: 'demouser',
        email: 'demo@example.com',
        fullName: 'Demo User',
        passwordHash: Buffer.from('demo123').toString('base64')
      },
      {
        username: 'admin',
        email: 'admin@example.com', 
        fullName: 'Admin User',
        passwordHash: Buffer.from('admin123').toString('base64')
      }
    ];

    for (const userData of additionalUsers) {
      try {
        const user = await prisma.user.create({
          data: userData
        });
        console.log(`✅ Created user: ${user.username} (ID: ${user.id})`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  User ${userData.username} already exists`);
        } else {
          console.error(`❌ Error creating ${userData.username}:`, error.message);
        }
      }
    }

    // List all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, username: true, email: true, fullName: true }
    });

    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });

    return newUser;

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser()
    .then((user) => {
      console.log('\n🎉 Setup completed! You can now use userId:', user.id);
      console.log('💡 Update your AuthService to return this ID');
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestUser };