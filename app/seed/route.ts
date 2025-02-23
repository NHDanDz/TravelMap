import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

// Khởi tạo kết nối database với SSL
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Tạo tables và seed dữ liệu customers
async function seedCustomers() {
  try {
    // Tạo bảng customers
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        image_url VARCHAR(255) NOT NULL
      );
    `;

    // Insert dữ liệu customers
    for (const customer of customers) {
      await sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (
          ${customer.id},
          ${customer.name},
          ${customer.email},
          ${customer.image_url}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    console.log('Seeded customers successfully');
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

// Tạo tables và seed dữ liệu invoices
async function seedInvoices() {
  try {
    // Tạo bảng invoices với foreign key
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `;

    // Insert dữ liệu invoices
    for (const invoice of invoices) {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (
          ${invoice.customer_id},
          ${invoice.amount},
          ${invoice.status},
          ${invoice.date}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    console.log('Seeded invoices successfully');
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

// Tạo tables và seed dữ liệu users
async function seedUsers() {
  try {
    // Tạo bảng users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    // Insert dữ liệu users với mã hóa password
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (
          ${user.id},
          ${user.name},
          ${user.email},
          ${hashedPassword}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    console.log('Seeded users successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

// Tạo tables và seed dữ liệu revenue
async function seedRevenue() {
  try {
    // Tạo bảng revenue
    await sql`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `;

    // Insert dữ liệu revenue
    for (const rev of revenue) {
      await sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `;
    }

    console.log('Seeded revenue successfully');
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

// API endpoint để chạy seed
export async function GET() {
  try {
    // Tạo extension uuid-ossp nếu chưa có
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Seed theo thứ tự để tránh lỗi foreign key
    await seedCustomers();  // Seed trước vì invoices phụ thuộc
    await seedInvoices();   // Seed sau customers
    await seedUsers();      // Độc lập
    await seedRevenue();    // Độc lập

    return Response.json({ 
      success: true,
      message: 'Database seeded successfully' 
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    return Response.json({ 
      success: false,
      error: 'Error seeding database', 
      details: error 
    }, { 
      status: 500 
    });
  } finally {
    // Đóng kết nối database
    await sql.end();
  }
}